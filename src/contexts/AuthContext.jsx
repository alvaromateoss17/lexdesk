import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { cargarPerfil, registrarUsuario } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Timeout de seguridad: si en 8s no resuelve, forzar fin de carga
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(prev => {
        if (prev) console.warn('[Vincla] Auth timeout — forzando fin de carga')
        return false
      })
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      return
    }
    try {
      const data = await cargarPerfil(authUser.id)
      if (data) {
        setProfile(data)
      } else {
        // Perfil no existe todavía — puede ocurrir justo tras el registro
        await new Promise(r => setTimeout(r, 1500))
        try {
          const retry = await cargarPerfil(authUser.id)
          if (retry) setProfile(retry)
          else console.warn('[Vincla] Usuario sin perfil en DB:', authUser.id)
        } catch (retryErr) {
          console.error('[Vincla] Error en reintento de perfil:', retryErr)
        }
      }
    } catch (err) {
      // ⚠️ CRÍTICO: siempre limpiar aunque haya error para no bloquear la app
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
          .catch(err => console.error('[Vincla] Error inesperado en fetchProfile:', err))
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
    try {
      const result = await registrarUsuario({ nombre, email, password, nombreDespacho, codigoInvitacion })
      return { data: result, needsConfirmation: result.needsConfirmation }
    } catch (err) {
      return { error: { message: err.message } }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      estaAutenticado: !!user,
      despacho: profile?.despachos ?? null,
      refrescarPerfil: () => fetchProfile(user),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
