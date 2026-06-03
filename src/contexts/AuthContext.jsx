import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { registrarUsuario } from '../services/authService'

const AuthContext = createContext(null)

async function cargarPerfilDB(authUserId) {
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('*, despachos(*)')
    .eq('auth_user_id', authUserId)
    .single()

  if (perfilError) {
    if (perfilError.code === 'PGRST116') return null  // sin fila → necesita setup
    throw perfilError
  }
  if (!perfil)              return null  // sin fila
  if (!perfil.despacho_id) return null  // fila sin despacho → necesita setup
  if (!perfil.despachos)   return null  // despacho borrado o RLS lo bloquea → necesita setup

  return perfil
}

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [profile,   setProfile]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [sinPerfil, setSinPerfil] = useState(false)

  // ── Carga perfil una vez; si no existe, marca sinPerfil ──
  const procesarUsuario = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null); setProfile(null); setSinPerfil(false)
      localStorage.removeItem('vincla_despacho_id')
      return
    }
    setUser(authUser)
    try {
      const perfil = await cargarPerfilDB(authUser.id)

      if (perfil) {
        setProfile(perfil)
        setSinPerfil(false)
        // Guardar despacho en localStorage
        if (Array.isArray(perfil.despachos) && perfil.despachos[0]) {
          localStorage.setItem('vincla_despacho_id', perfil.despachos[0].id)
        }
      } else {
        setProfile(null)
        setSinPerfil(true)   // existe en Auth pero sin fila en usuarios
      }
    } catch (err) {
      console.error('[Auth] Error cargando perfil:', err.message)
      setProfile(null)
      setSinPerfil(true)
    }
  }, [])

  // ── Inicialización ────────────────────────────────────────────────────────
  useEffect(() => {
    let activo = true

    // Seguridad: máximo 15s en estado cargando (aumentado para cuentas con muchos datos o conexión lenta)
    const timeout = setTimeout(() => {
      if (activo) { console.warn('[Auth] Timeout'); setCargando(false) }
    }, 15000)

    function setCargando(v) { if (activo) setLoading(v) }

    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (!activo) return
        if (error) { console.error('[Auth] getSession error:', error.message); setCargando(false); clearTimeout(timeout); return }

        if (session) {
          // Validar la sesión contra el servidor (detecta JWTs de usuarios borrados)
          const { error: userError } = await supabase.auth.getUser()
          if (userError) {
            await supabase.auth.signOut()
            setCargando(false)
            clearTimeout(timeout)
            return
          }
        }

        await procesarUsuario(session?.user ?? null)
        setCargando(false)
        clearTimeout(timeout)
      })
      .catch(err => {
        console.error('[Auth] Supabase no disponible:', err.message)
        setCargando(false)
        clearTimeout(timeout)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (evento, session) => {
        if (!activo) return
        if (evento === 'SIGNED_IN')    { await procesarUsuario(session?.user ?? null) }
        if (evento === 'SIGNED_OUT')   { setUser(null); setProfile(null); setSinPerfil(false) }
        if (evento === 'TOKEN_REFRESHED' && session?.user && !profile) {
          await procesarUsuario(session.user)
        }
      }
    )

    return () => { activo = false; clearTimeout(timeout); subscription.unsubscribe() }
  }, [procesarUsuario]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Refrescar perfil manualmente (para después del setup) ─────────────────
  const refrescarPerfil = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) await procesarUsuario(u)
  }, [procesarUsuario])

  // ── Valor del contexto — mantiene todos los nombres anteriores + nuevos ───
  const valor = {
    // Nombres actuales (usados por Sidebar, TopBar, Login, hooks…)
    user,
    profile,
    loading,
    signIn:  (email, password) => supabase.auth.signInWithPassword({ email, password }).then(({ error }) => ({ error })),
    signOut: () => supabase.auth.signOut(),
    signUp: async ({ email, password, nombre, nombreDespacho, codigoInvitacion = '' }) => {
      try {
        const result = await registrarUsuario({ nombre, email, password, nombreDespacho, codigoInvitacion })
        // Guardar despacho_id en localStorage si existe
        if (result.despacho_id) {
          localStorage.setItem('vincla_despacho_id', result.despacho_id)
        }
        // Recargar perfil explícitamente DESPUÉS de que setup_user_despacho haya terminado
        // (onAuthStateChange SIGNED_IN puede haber disparado antes de que el despacho existiera)
        if (!result.needsConfirmation) {
          const { data: { user: u } } = await supabase.auth.getUser()
          if (u) await procesarUsuario(u)
        }
        return { data: result, needsConfirmation: result.needsConfirmation }
      } catch (err) {
        return { error: { message: err.message } }
      }
    },

    // Nuevos nombres (usados por SetupDespacho, PrivateRoute)
    sinPerfil,
    estaAutenticado: !!user,
    despacho: Array.isArray(profile?.despachos) && profile.despachos.length > 0 ? profile.despachos[0] : { id: localStorage.getItem('vincla_despacho_id') },
    refrescarPerfil,

    // El signUp real con código de invitación se sigue haciendo en authService
    // Los hooks usan despacho.id para las operaciones
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext
