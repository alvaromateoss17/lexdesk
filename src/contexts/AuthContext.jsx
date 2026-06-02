import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { registrarUsuario } from '../services/authService'

const AuthContext = createContext(null)

async function cargarPerfilDB(authUserId) {
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single()

  if (perfilError) {
    if (perfilError.code === 'PGRST116') return null  // sin fila → necesita setup
    throw perfilError
  }
  if (!perfil)              return null  // sin fila
  if (!perfil.despacho_id) return null  // fila sin despacho → necesita setup

  const { data: despachoData } = await supabase
    .from('despachos')
    .select('*')
    .eq('id', perfil.despacho_id)
    .single()

  if (!despachoData) return null  // despacho borrado o RLS lo bloquea → necesita setup

  return { ...perfil, despachos: despachoData }
}

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [profile,   setProfile]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [sinPerfil, setSinPerfil] = useState(false)

  // ── Carga perfil una vez; si no existe tras 1 reintento, marca sinPerfil ──
  const procesarUsuario = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null); setProfile(null); setSinPerfil(false)
      return
    }
    setUser(authUser)
    try {
      let perfil = await cargarPerfilDB(authUser.id)

      if (!perfil) {
        // Dar 2s al registro para que termine antes de rendirse
        await new Promise(r => setTimeout(r, 2000))
        perfil = await cargarPerfilDB(authUser.id)
      }

      if (perfil) {
        setProfile(perfil)
        setSinPerfil(false)
      } else {
        setProfile(null)
        setSinPerfil(true)   // existe en Auth pero sin fila en usuarios
      }
    } catch (err) {
      console.error('[Auth] Error cargando perfil:', err.message)
      // Reintento final: si falla la carga, esperar 3s y probar una vez más
      try {
        await new Promise(r => setTimeout(r, 3000))
        const perfilRetry = await cargarPerfilDB(authUser.id)
        if (perfilRetry) {
          setProfile(perfilRetry)
          setSinPerfil(false)
        } else {
          setProfile(null)
          setSinPerfil(true)
        }
      } catch {
        setProfile(null)
        setSinPerfil(true)
      }
    }
  }, [])

  // ── Inicialización ────────────────────────────────────────────────────────
  useEffect(() => {
    let activo = true

    // Seguridad: máximo 10s en estado cargando
    const timeout = setTimeout(() => {
      if (activo) { console.warn('[Auth] Timeout'); setCargando(false) }
    }, 10000)

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
    despacho: profile?.despachos ?? null,
    refrescarPerfil,

    // El signUp real con código de invitación se sigue haciendo en authService
    // Los hooks usan despacho.id para las operaciones
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext
