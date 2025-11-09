/**
 * Resize an image file to specified dimensions
 * @param file - The image file to resize
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - Image quality (0-1), default 0.9
 * @returns Promise resolving to a Blob
 */
export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          file.type,
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns Error message or null if valid
 */
export function validateImageFile(file: File, maxSizeMB: number = 2): string | null {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Only JPG and PNG images are allowed.'
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `File size exceeds ${maxSizeMB}MB limit.`
  }
  
  return null
}

