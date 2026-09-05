// scripts/wipe-cloudinary.mjs
// Deletes all uploaded user photos in the 'teachers_day_cards' folder from Cloudinary

import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local or .env
function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...vals] = trimmed.split('=');
          if (key && vals.length) {
            process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      });
    }
  }
}

loadEnv();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder = 'teachers_day_cards';

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary environment variables missing in .env.local (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

async function wipeCloudinaryFolder() {
  console.log(`\n🧹 Wiping Cloudinary folder: "${folder}" in cloud: "${cloudName}"...`);
  try {
    // 1. Delete all resources with prefix
    const deleteResourcesUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${encodeURIComponent(folder)}/&all=true`;
    const res = await fetch(deleteResourcesUrl, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await res.json();
    console.log('✅ Deleted images response:', data);

    // 2. Delete the empty folder itself
    const deleteFolderUrl = `https://api.cloudinary.com/v1_1/${cloudName}/folders/${encodeURIComponent(folder)}`;
    const folderRes = await fetch(deleteFolderUrl, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
      },
    });

    const folderData = await folderRes.json();
    console.log('✅ Deleted folder response:', folderData);
    console.log('\n🎉 Cloudinary cleanup complete!\n');
  } catch (err) {
    console.error('❌ Error wiping Cloudinary folder:', err);
  }
}

wipeCloudinaryFolder();
