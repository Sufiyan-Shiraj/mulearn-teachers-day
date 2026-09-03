/**
 * Upload an image file or base64 data URL to Cloudinary using signed upload
 */
export async function uploadToCloudinary(
  fileOrBase64: File | string,
  onProgress?: (progress: number) => void
): Promise<{ secureUrl: string; publicId: string }> {
  try {
    // 1. Fetch signature from our backend API route
    const sigResponse = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'teachers_day_cards' }),
    });

    const sigData = await sigResponse.json();

    // If Cloudinary is not configured in backend, create a local base64/object URL
    if (!sigData.configured || !sigData.signature) {
      if (typeof fileOrBase64 === 'string') {
        return {
          secureUrl: fileOrBase64,
          publicId: `local_${Date.now()}`,
        };
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            secureUrl: reader.result as string,
            publicId: `local_${Date.now()}`,
          });
        };
        reader.readAsDataURL(fileOrBase64);
      });
    }

    // 2. Prepare multipart upload for Cloudinary
    const formData = new FormData();
    if (typeof fileOrBase64 === 'string') {
      formData.append('file', fileOrBase64);
    } else {
      formData.append('file', fileOrBase64);
    }
    formData.append('api_key', sigData.apiKey);
    formData.append('timestamp', sigData.timestamp.toString());
    formData.append('signature', sigData.signature);
    formData.append('folder', sigData.folder);

    // 3. Post to Cloudinary upload endpoint
    const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return {
      secureUrl: data.secure_url,
      publicId: data.public_id,
    };
  } catch (err: any) {
    console.warn('Cloudinary upload error, using local fallback:', err);
    // Fallback so the user experience is never blocked
    if (typeof fileOrBase64 === 'string') {
      return {
        secureUrl: fileOrBase64,
        publicId: `local_${Date.now()}`,
      };
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          secureUrl: reader.result as string,
          publicId: `local_${Date.now()}`,
        });
      };
      reader.readAsDataURL(fileOrBase64);
    });
  }
}
