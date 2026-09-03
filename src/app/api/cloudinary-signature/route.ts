import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { folder = 'teachers_day_cards', public_id } = body;

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      // In development / demo mode when secrets are not yet configured in .env,
      // return a graceful message so the frontend falls back to direct client preview URL
      return NextResponse.json(
        { 
          configured: false,
          error: 'Cloudinary environment variables not set. (Using client-side image storage fallback)' 
        },
        { status: 200 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const params: Record<string, string | number> = {
      folder,
      timestamp,
    };
    if (public_id) {
      params.public_id = public_id;
    }

    // Sort params alphabetically
    const sortedKeys = Object.keys(params).sort();
    const serialized = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
    const toSign = `${serialized}${apiSecret}`;

    // Web Crypto SHA-1 digest
    const encoder = new TextEncoder();
    const data = encoder.encode(toSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return NextResponse.json({
      configured: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Signature error' }, { status: 500 });
  }
}
