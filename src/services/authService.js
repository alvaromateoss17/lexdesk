import { supabase } from '../lib/supabase'

const INVITE_CODE = import.meta.env.VITE_INVITE_CODE || 'VINCLA2025'

// ─── REGISTRO ────────────────────────────────────────────────────────────────

export async function registrarUsuario({ nombre, apellidos = '', email, password, nombreDespacho, codigoInvitacion }) {
  if (codigoInvitacion.trim().toUpperCase() !== INVITE_CODE.toUpperCase()) {
    throw new Error('Código de invitación incorrecto. Contacta con Vincla para obtener acceso.')
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { nombre, apellidos } },
  })

  if (authError) throw new Error(traducirErrorAuth(authError.message))
  if (!authData.user) throw new Error('No se pudo crear la cuenta. Inténtalo de nuevo.')

  const { data: despacho, error: despachoError } = await supabase
    .from('despachos')
    .insert({ nombre: nombreDespacho.trim(), plan: 'esencial', activo: true })
    .select()
    .single()

  if (despachoError) throw new Error('No se pudo crear el despacho: ' + despachoError.message)

  const { error: usuarioError } = await supabase
    .from('usuarios')
    .insert({
      auth_user_id: authData.user.id,
      despacho_id: despacho.id,
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      rol: 'propietario',
      activo: true,
    })

  if (usuarioError) throw new Error('No se pudo crear el perfil: ' + usuarioError.message)

  return { user: authData.user, despacho, needsConfirmation: !authData.session }
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export async function iniciarSesion({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) throw new Error(traducirErrorAuth(error.message))
  if (!data.user) throw new Error('No se pudo iniciar sesión.')

  const perfil = await cargarPerfil(data.user.id)
  return { user: data.user, perfil }
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error('No se pudo cerrar sesión: ' + error.message)
}

// ─── SETUP DE DESPACHO (recuperación para cuentas sin despacho) ──────────────

/**
 * Crea un despacho y vincula al usuario actual a él.
 * Usa una función SECURITY DEFINER en Supabase que bypasea RLS,
 * lo que permite reparar cuentas cuyo registro quedó incompleto.
 */
export async function setupDespacho(nombreDespacho = 'Mi Despacho') {
  const { data, error } = await supabase.rpc('setup_user_despacho', {
    p_despacho_nombre: nombreDespacho.trim() || 'Mi Despacho',
  })
  if (error) throw new Error('No se pudo crear el despacho: ' + error.message)
  return data
}

// ─── PERFIL ──────────────────────────────────────────────────────────────────

export async function cargarPerfil(authUserId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*, despachos(*)')
    .eq('auth_user_id', authUserId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error('No se pudo cargar el perfil: ' + error.message)
  }

  return data
}

export async function obtenerSesion() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── UTILIDADES ──────────────────────────────────────────────────────────────

function traducirErrorAuth(message) {
  const errores = {
    'Invalid login credentials': 'Email o contraseña incorrectos.',
    'Email not confirmed': 'Debes confirmar tu email antes de iniciar sesión.',
    'User already registered': 'Ya existe una cuenta con este email.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'El formato del email no es válido.',
    'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos.',
    'Invalid email or password': 'Email o contraseña incorrectos.',
    'signup_disabled': 'El registro está desactivado temporalmente.',
  }

  for (const [key, value] of Object.entries(errores)) {
    if (message.includes(key)) return value
  }

  return message || 'Ha ocurrido un error. Inténtalo de nuevo.'
}
