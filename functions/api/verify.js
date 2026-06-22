const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxanLbwubWA8tndtYgrCIEJhPrS4Pp5D-aLIn12XE-1-gZ5RSwei7BChGsE-lK8NldUjg/exec';

export async function onRequestGet(context) {
  const incoming = new URL(context.request.url);
  const target = new URL(APPS_SCRIPT_URL);

  for (const [key, value] of incoming.searchParams) {
    target.searchParams.set(key, value);
  }

  try {
    const res = await fetch(target.toString(), { redirect: 'follow' });
    const text = await res.text();
    return new Response(text, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch {
    return new Response(JSON.stringify({ found: false }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
