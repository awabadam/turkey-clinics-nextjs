import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface ImageUploadProps {
  label: string
  value: string[] // Array of image URLs
  onChange: (urls: string[]) => void
  multiple?: boolean
  maxImages?: number
}

export function ImageUpload({
  label,
  value,
  onChange,
  multiple = true,
  maxImages = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    const remainingSlots = maxImages - value.length

    if (filesArray.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can only upload ${remainingSlots} more image(s).`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const uploadPromises = filesArray.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`)
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 5MB size limit`)
        }

        const formData = new FormData()
        formData.append("file", file)

        // Use the API client for upload
        const response = await api.post<{ url: string }>("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        return response.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...value, ...uploadedUrls])

      toast({
        title: "Upload successful",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!multiple && e.dataTransfer.files.length > 1) {
      toast({
        title: "Too many files",
        description: "Please select only one image.",
        variant: "destructive",
      })
      return
    }
    // Create a synthetic event for handleFileSelect
    const syntheticEvent = {
      target: { files: e.dataTransfer.files },
    } as any
    handleFileSelect(syntheticEvent)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || value.length >= maxImages}
        />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 5MB
                  {maxImages && ` (Max ${maxImages} images)`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-muted"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual URL Input (fallback) */}
      <div className="mt-4 pt-4 border-t">
        <Label className="text-sm text-muted-foreground">
          Or add image URLs manually (comma-separated)
        </Label>
        <input
          type="text"
          className="mt-1 w-full px-3 py-2 text-sm border rounded-md bg-background"
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          onBlur={(e) => {
            const urls = e.target.value
              .split(",")
              .map((url) => url.trim())
              .filter((url) => url.length > 0)
            if (urls.length > 0 && value.length + urls.length <= maxImages) {
              onChange([...value, ...urls])
              e.target.value = ""
            } else if (urls.length > 0) {
              toast({
                title: "Too many images",
                description: `You can only add ${maxImages - value.length} more image(s).`,
                variant: "destructive",
              })
            }
          }}
        />
      </div>
    </div>
  )
}
