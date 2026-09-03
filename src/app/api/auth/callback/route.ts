import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/create';

  // If server received PKCE code
  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
      await supabase.auth.exchangeCodeForSession(code);
    }
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // If Supabase redirected with an implicit URL hash (#access_token=... or #error=...)
  // Browsers do NOT send hash to server, so we return a lightweight client page that extracts the hash and redirects.
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authenticating...</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body style="background-color:#FAF6F0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
  <div style="width:40px;height:40px;border:4px solid #7A1F1F;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
  <p style="margin-top:16px;color:#44403C;font-size:18px;font-weight:600;">Completing sign in...</p>
  <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
  <script>
    (async function() {
      const supabaseUrl = "${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}";
      const supabaseAnonKey = "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}";
      
      if (supabaseUrl && supabaseAnonKey) {
        const client = supabase.createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            storageKey: 'mulearn_auth_token',
          }
        });
        // Supabase client automatically parses #access_token and saves to localStorage
        const { data } = await client.auth.getSession();
      }
      
      // Redirect to /create or destination
      setTimeout(() => {
        window.location.href = "${next}";
      }, 500);
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
