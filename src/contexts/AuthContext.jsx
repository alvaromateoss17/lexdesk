import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { cargarPerfil, registrarUsuario } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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
        // Race condition al registrarse: perfil aún no existe, reintentar
        setTimeout(async () => {
          const retry = await cargarPerfil(authUser.id)
          if (retry) setProfile(retry)
        }, 1500)
      }
    } catch {
      // Si falla la carga del perfil no bloqueamos la app
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      fetchProfile(session?.user ?? null).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await fetchProfile(session?.user ?? null)
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
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

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    // Alias adicionales por si algún componente los usa
    estaAutenticado: !!user,
    despacho: profile?.despachos ?? null,
    refrescarPerfil: () => fetchProfile(user),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
