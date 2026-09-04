const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyvladtdxbbwvavorjon.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dmxhZHRkeGJid3Zhdm9yam9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTQzNjcsImV4cCI6MjEwNDAzMDM2N30.Nsr-phItQ8f3wXRHv37SigzPTonAwnYCkt53v0N0xKQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory cache for SPA index.html to avoid re-fetching on every human visit
let cachedSpaHtml = null;
let lastSpaFetch = 0;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async function handler(req, res) {
  const { slug } = req.query || {};
  if (!slug || typeof slug !== 'string') {
    res.statusCode = 400;
    return res.end('Missing slug parameter');
  }

  const cleanSlug = slug.trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'mulearn-teachers-day.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;
  const imageUrl = `${baseUrl}/api/card-image?slug=${encodeURIComponent(cleanSlug)}`;
  const cardPageUrl = `${baseUrl}/c/${encodeURIComponent(cleanSlug)}`;

  let teacher = 'My Teacher';
  let message = 'A card made with your photo, your words, and your heart.';

  try {
    const { data } = await supabase
      .from('cards')
      .select('teacher_name, message')
      .eq('share_slug', cleanSlug)
      .single();

    if (data?.teacher_name && data.teacher_name.trim()) {
      teacher = data.teacher_name.trim();
    }
    if (data?.message && data.message.trim()) {
      message = data.message.trim();
    }
  } catch (err) {
    console.warn('Could not load card details for preview:', err);
  }

  const safeTeacher = escapeHtml(teacher);
  const safeTitle = `A Teacher's Day card for ${safeTeacher} 🌼`;
  const safeDesc = escapeHtml(message);

  // Inject dynamic Open Graph tags into the Vite SPA index.html
  // Both bots (WhatsApp, Telegram, etc.) and human browsers receive this:
  // - Bots read the Open Graph meta tags and og:image
  // - Humans get instant React hydration and see the card immediately
  try {
    const now = Date.now();
    if (!cachedSpaHtml || now - lastSpaFetch > 60000) {
      const response = await fetch(`${baseUrl}/index.html`);
      if (response.ok) {
        cachedSpaHtml = await response.text();
        lastSpaFetch = now;
      }
    }

    if (cachedSpaHtml) {
      const ogBlock = `
    <title>${safeTitle} · μlearn ASI</title>
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="μlearn Teacher's Day" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:url" content="${cardPageUrl}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${imageUrl}" />`;

      const injectedHtml = cachedSpaHtml
        .replace(/<title>.*?<\/title>/, '')
        .replace(/<meta property="og:title".*?\/>/, '')
        .replace(/<meta property="og:description".*?\/>/, ogBlock);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
      res.statusCode = 200;
      return res.end(injectedHtml);
    }
  } catch (err) {
    console.error('Error hydrating SPA index.html:', err);
  }

  // Fallback if SPA fetch fails: return clean HTML with OG tags and client redirect
  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle} · μlearn ASI</title>
  <meta name="description" content="${safeDesc}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="μlearn Teacher's Day">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:url" content="${cardPageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta http-equiv="refresh" content="0;url=/c/${encodeURIComponent(cleanSlug)}">
  <script>window.location.replace('/c/${encodeURIComponent(cleanSlug)}');</script>
</head>
<body>
  <p>${safeTitle}. <a href="${cardPageUrl}">Click here to open</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  return res.end(fallbackHtml);
};
