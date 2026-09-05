// scripts/check-cloudinary-files.mjs
import fs from 'fs';
import path from 'path';

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

const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

async function checkCloudinary() {
  try {
    // Check teachers_day_cards folder resources
    const folder = 'teachers_day_cards';
    const listUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${encodeURIComponent(folder)}/&max_results=500`;
    const res = await fetch(listUrl, {
      headers: { Authorization: authHeader }
    });
    const data = await res.json();

    console.log('--- CLOUDINARY FOLDER: teachers_day_cards ---');
    if (data.resources) {
      console.log(`Total files in '${folder}/': ${data.resources.length}`);
      data.resources.forEach((r, i) => {
        console.log(` ${i + 1}. public_id: ${r.public_id} (${r.format}, ${(r.bytes / 1024).toFixed(1)} KB, created: ${r.created_at})`);
      });
    } else {
      console.log('Response:', data);
    }

    // Also check total folders in the cloud
    const rootFoldersUrl = `https://api.cloudinary.com/v1_1/${cloudName}/folders`;
    const fRes = await fetch(rootFoldersUrl, {
      headers: { Authorization: authHeader }
    });
    const fData = await fRes.json();
    console.log('\n--- ALL FOLDERS IN CLOUDINARY ---');
    console.log(fData.folders || fData);

  } catch (err) {
    console.error('Error querying Cloudinary:', err);
  }
}

checkCloudinary();
