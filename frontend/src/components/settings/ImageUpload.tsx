import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { resizeImage, validateImageFile } from '@/utils/imageResize'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

interface ImageUploadProps {
  label: string
  currentUrl?: string | null
  onUpload: (file: File) => Promise<string>
  onRemove: () => Promise<void>
  maxWidth: number
  maxHeight: number
  maxSizeMB?: number
  className?: string
}

export function ImageUpload({
  label,
  currentUrl,
  onUpload,
  onRemove,
  maxWidth,
  maxHeight,
  maxSizeMB = 2,
  className,
}: ImageUploadProps) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file
    const validationError = validateImageFile(file, maxSizeMB)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)

    try {
      // Resize image
      const resizedBlob = await resizeImage(file, maxWidth, maxHeight)
      const resizedFile = new File([resizedBlob], file.name, { type: file.type })

      // Upload to storage
      const url = await onUpload(resizedFile)
      setPreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      await onRemove()
      setPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={label}
              className="h-24 w-24 rounded-md object-cover border"
            />
            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="h-24 w-24 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <Upload className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
          />
          <Label
            htmlFor={`upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="cursor-pointer"
          >
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              asChild
            >
              <span>{uploading ? t('settings.uploading') : preview ? t('settings.change') : t('settings.upload')}</span>
            </Button>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            {t('settings.maxSizeFormat', { maxSizeMB })}
          </p>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

