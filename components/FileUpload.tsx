'use client'

import { useRef, useState } from 'react'
import { uploadFile } from '@/lib/supabase/storage'

interface FileUploadProps {
  label: string
  accept: string           // e.g. "video/*", "audio/*", "application/pdf", "image/*"
  folder: string           // e.g. "douleurs", "site", "posts"
  currentUrl?: string | null
  onUploaded: (url: string) => void
  onRemoved?: () => void
  hint?: string
  maxSize?: number          // max file size in bytes, 0 or undefined = no limit
}

export default function FileUpload({
  label,
  accept,
  folder,
  currentUrl,
  onUploaded,
  onRemoved,
  hint,
  maxSize,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideoUpload = accept.includes('video')

    // Format vidéo : seuls MP4/WebM (H.264/VP9) sont lisibles par tous les
    // navigateurs. Les vidéos iPhone en .MOV/HEVC s'affichent « barrées » chez
    // les membres — on les refuse à l'import avec un message clair.
    if (isVideoUpload) {
      const name = file.name.toLowerCase()
      const webSafeType = ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)
      const webSafeExt = /\.(mp4|m4v|webm|ogg|ogv)$/.test(name)
      const badContainer =
        file.type === 'video/quicktime' || /\.(mov|avi|mkv|hevc|3gp|3g2|wmv|flv|ts|m2ts)$/.test(name)
      if (badContainer || !(webSafeType || webSafeExt)) {
        setError(
          "Format non lisible sur le web (souvent une vidéo iPhone .MOV/HEVC). " +
            "Convertissez-la en MP4 (H.264) avant de l'importer, sinon elle s'affichera « barrée » chez les membres."
        )
        return
      }
    }

    // Validate size (undefined/0 = pas de limite explicite ; on plafonne quand
    // même les vidéos par défaut pour éviter des chargements interminables).
    const defaultVideoCap = 500 * 1024 * 1024 // 500 Mo
    const limit = (maxSize ?? 0) > 0 ? (maxSize as number) : (isVideoUpload ? defaultVideoCap : 0)
    if (limit > 0 && file.size > limit) {
      setError(`Fichier trop volumineux (max ${Math.round(limit / (1024 * 1024))} Mo). Compressez la vidéo avant de l'importer.`)
      return
    }

    setError(null)
    setUploading(true)
    setProgress(`Upload en cours... (${(file.size / 1024 / 1024).toFixed(1)} Mo)`)

    try {
      const url = await uploadFile(file, folder)
      onUploaded(url)
      setProgress(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
      setProgress(null)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isImage = accept.includes('image')
  const isVideo = accept.includes('video')
  const isAudio = accept.includes('audio')
  const isPdf = accept.includes('pdf')

  function getIcon() {
    if (isImage) return '🖼️'
    if (isVideo) return '🎬'
    if (isAudio) return '🎵'
    if (isPdf) return '📄'
    return '📁'
  }

  function getFileLabel() {
    if (isImage) return 'image'
    if (isVideo) return 'vidéo'
    if (isAudio) return 'audio'
    if (isPdf) return 'PDF'
    return 'fichier'
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>

      {/* Current file preview */}
      {currentUrl && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(85,239,196,0.06)', border: '1px solid rgba(85,239,196,0.15)' }}>
          {isImage && (
            <img src={currentUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
          )}
          {isVideo && (
            <video src={currentUrl} className="w-20 h-12 object-cover rounded-lg"
              muted playsInline preload="metadata" />
          )}
          {isAudio && (
            <audio src={currentUrl} controls className="h-8 max-w-[200px]" />
          )}
          {!isImage && !isVideo && !isAudio && (
            <span className="text-xl">{getIcon()}</span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate" style={{ color: '#55EFC4' }}>Fichier actuel</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
              {currentUrl.split('/').pop()}
            </p>
          </div>
          {onRemoved && (
            <button
              onClick={onRemoved}
              type="button"
              className="text-xs px-2 py-1 rounded-md transition-colors"
              style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}
            >
              Retirer
            </button>
          )}
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative rounded-lg p-4 text-center transition-all duration-200 cursor-pointer hover:border-[rgba(116,192,252,0.4)]"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed var(--border)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs" style={{ color: '#74C0FC' }}>{progress}</span>
          </div>
        ) : (
          <div>
            <span className="text-lg block mb-1">{getIcon()}</span>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Cliquez pour {currentUrl ? 'remplacer le' : 'uploader un'} {getFileLabel()}
            </p>
            {hint && (
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs" style={{ color: '#FF6B6B' }}>{error}</p>
      )}
    </div>
  )
}
