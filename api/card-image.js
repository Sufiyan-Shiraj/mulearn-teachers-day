const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyvladtdxbbwvavorjon.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dmxhZHRkeGJid3Zhdm9yam9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTQzNjcsImV4cCI6MjEwNDAzMDM2N30.Nsr-phItQ8f3wXRHv37SigzPTonAwnYCkt53v0N0xKQ';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async function handler(req, res) {
  const { slug } = req.query || {};
  if (!slug || typeof slug !== 'string') {
    res.statusCode = 400;
    return res.end('Missing slug parameter');
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('photo_url, custom_config')
      .eq('share_slug', slug.trim())
      .single();

    if (error || !data) {
      res.statusCode = 404;
      return res.end('Card not found');
    }

    const raw = data.custom_config?.preview || data.custom_config?.cardImage || data.photo_url;
    if (!raw) {
      res.statusCode = 404;
      return res.end('No image available');
    }

    // If it's a data URL (e.g. data:image/jpeg;base64,...)
    if (raw.startsWith('data:image/')) {
      const match = raw.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      const mime = match ? match[1] : 'image/jpeg';
      const base64Content = match ? match[2] : raw.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Content, 'base64');

      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
      res.statusCode = 200;
      return res.end(buffer);
    }

    // If it's a remote URL (e.g. Cloudinary or HTTPS)
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      res.writeHead(302, { Location: raw });
      return res.end();
    }

    res.statusCode = 400;
    return res.end('Invalid image format');
  } catch (err) {
    console.error('Error in card-image handler:', err);
    res.statusCode = 500;
    return res.end('Internal Server Error');
  }
};
