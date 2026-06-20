/* global process */
export const config = { runtime: 'edge' };

// Cabeceras CORS. Si ALLOWED_ORIGINS está definida (lista separada por comas),
// solo se permite el Origin de la petición si está en la lista; en caso
// contrario se devuelve el primer origen permitido (el navegador lo bloqueará).
// Si la variable NO está definida, se mantiene el comportamiento actual ('*').
function corsHeaders(req) {
  const allowed = process.env.ALLOWED_ORIGINS;
  let origin = '*';
  if (allowed) {
    const lista = allowed.split(',').map((o) => o.trim()).filter(Boolean);
    const reqOrigin = req.headers.get('Origin') || '';
    origin = lista.includes(reqOrigin) ? reqOrigin : (lista[0] || '*');
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export default async function handler(req) {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'GROQ_API_KEY no configurada en Vercel.' } }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...cors } }
    );
  }

  // --- Autenticación: exigir sesión de usuario de Vincla antes de llamar a Groq ---
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return new Response(JSON.stringify({ error: { message: 'No autenticado.' } }), {
      status: 401, headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const SUPA_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const userRes = await fetch(`${SUPA_URL}/auth/v1/user`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: { message: 'Sesión no válida.' } }), {
      status: 401, headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: { message: 'Body inválido' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}));
    return new Response(JSON.stringify(err), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...cors,
    },
  });
}
