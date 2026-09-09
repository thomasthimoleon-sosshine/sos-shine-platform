import { createClient } from './client'

const BUCKET = 'uploads'

/**
 * Upload a file to Supabase Storage and return its public URL.
 * folder: e.g. "douleurs", "site", "posts"
 */
export async function uploadFile(
  file: File,
  folder: string
): Promise<string> {
  const supabase = createClient()

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'bin'
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60)
  const uniqueName = `${safeName}_${Date.now()}.${ext}`
  const path = `${folder}/${uniqueName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      // Type MIME explicite : garantit que la vidéo est servie avec le bon
      // en-tête (sinon certains navigateurs refusent de la lire).
      contentType: file.type || undefined,
      // Cache long côté CDN : les fichiers sont immuables (nom unique par upload).
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return urlData.publicUrl
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  const supabase = createClient()

  // Extract path from public URL
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/)
  if (!match) return

  const path = decodeURIComponent(match[1])
  await supabase.storage.from(BUCKET).remove([path])
}
