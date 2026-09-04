import { isSupabaseConfigured, supabase } from './supabase'

export interface CloudinaryUploadResult {
  secureUrl: string
  publicId: string
}

/**
 * Upload image to Cloudinary (via Supabase Edge Function or direct fallback)
 */
export async function uploadPhoto(
  fileOrBase64: File | string,
): Promise<CloudinaryUploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY

  // Helper for local data URL fallback
  const toLocalResult = async (): Promise<CloudinaryUploadResult> => {
    if (typeof fileOrBase64 === 'string') {
      return { secureUrl: fileOrBase64, publicId: `local_${Date.now()}` }
    }
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve({
          secureUrl: reader.result as string,
          publicId: `local_${Date.now()}`,
        })
      }
      reader.readAsDataURL(fileOrBase64)
    })
  }

  if (!cloudName || !apiKey || !isSupabaseConfigured) {
    return toLocalResult()
  }

  try {
    // 1. Attempt to get signature from Supabase Edge Function
    const { data: sigData, error: sigError } = await supabase.functions.invoke(
      'cloudinary-signature',
      { body: { folder: 'teachers_day_cards' } },
    )

    if (sigError || !sigData?.signature) {
      console.info('Edge function signature not active, using local data URL fallback')
      return toLocalResult()
    }

    // 2. Upload to Cloudinary
    const formData = new FormData()
    formData.append('file', fileOrBase64)
    formData.append('api_key', sigData.apiKey || apiKey)
    formData.append('timestamp', String(sigData.timestamp))
    formData.append('signature', sigData.signature)
    formData.append('folder', sigData.folder || 'teachers_day_cards')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error('Cloudinary upload returned non-200 status')
    }

    const json = await res.json()
    return {
      secureUrl: json.secure_url,
      publicId: json.public_id,
    }
  } catch (err) {
    console.warn('Photo upload falling back to local data URL:', err)
    return toLocalResult()
  }
}
