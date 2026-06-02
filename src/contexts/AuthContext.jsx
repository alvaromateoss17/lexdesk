import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { cargarPerfil, registrarUsuario, setupDespacho } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  // Flag para suprimir fetchProfile durante el registro (evita race condition)
  const registrando = useRef(false)

  // Timeout de seguridad: si en 10s no resuelve, forzar fin de carga
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(prev => {
        if (prev) console.warn('[Vincla] Auth timeout — forzando fin de carga')
        return false
      })
    }, 10000)
    return () => clearTimeout(t)
  }, [])

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      return
    }
    // Si estamos en medio del registro, esperar a que termine
    if (registrando.current) {
      await new Promise(r => setTimeout(r, 3000))
    }
    try {
      // Intentar 3 veces con delays crecientes (da tiempo al registro a completarse)
      for (const delay of [0, 1000, 2500]) {
        if (delay > 0) await new Promise(r => setTimeout(r, delay))
        const data = await cargarPerfil(authUser.id)
        if (data) {
          setProfile(data)
          return
        }
      }
      // Tras 3 intentos sin perfil: el usuario tiene Auth pero setup incompleto
      // NO hacemos signOut — dejamos que PrivateRoute muestre la pantalla de setup
      console.warn('[Vincla] Usuario sin perfil tras 3 intentos:', authUser.id)
      setProfile(null)
    } catch (err) {
      console.error('[Vincla] Error cargando perfil:', err)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let montado = true

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!montado) return
        if (error) {
          console.error('[Vincla] Error obteniendo sesión:', error)
          setLoading(false)
          return
        }
        setUser(session?.user ?? null)
        fetchProfile(session?.user ?? null)
          .catch(err => console.error('[Vincla] Error en fetchProfile inicial:', err))
          .finally(() => { if (montado) setLoading(false) })
      })
      .catch(err => {
        console.error('[Vincla] Supabase no disponible:', err)
        if (montado) setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!montado) return
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try { await fetchProfile(session?.user ?? null) }
          catch (err) { console.error('[Vincla] Error en onAuthStateChange:', err) }
        }
        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      montado = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signUp({ email, password, nombre, nombreDespacho, codigoInvitacion = '' }) {
    registrando.current = true
    try {
      const result = await registrarUsuario({ nombre, email, password, nombreDespacho, codigoInvitacion })
      // Cargar el perfil manualmente después del registro completo
      if (result.user) {
        const perfil = await cargarPerfil(result.user.id)
        if (perfil) setProfile(perfil)
      }
      return { data: result, needsConfirmation: result.needsConfirmation }
    } catch (err) {
      return { error: { message: err.message } }
    } finally {
      registrando.current = false
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  // Crea el despacho para cuentas con setup incompleto y recarga el perfil
  async function crearDespacho(nombreDespacho) {
    await setupDespacho(nombreDespacho)
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      const perfil = await cargarPerfil(u.id)
      if (perfil) setProfile(perfil)
    }
  }

  const sinDespacho = !loading && !!user && (!profile || !profile.despachos)

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      sinDespacho,
      signIn,
      signUp,
      signOut,
      crearDespacho,
      estaAutenticado:  !!user,
      despacho:         profile?.despachos ?? null,
      refrescarPerfil:  () => fetchProfile(user),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
