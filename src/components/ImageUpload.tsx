import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  currentImage?: string | null;
  currentImageUrl?: string | null;
  onUpload?: (url: string) => void;
  onUploadComplete?: (url: string) => void;
  folder?: string;
  aspectRatio?: 'square' | 'cover' | 'video' | 'portrait';
  className?: string;
  placeholder?: React.ReactNode;
}

export default function ImageUpload({
  currentImage,
  currentImageUrl,
  onUpload,
  onUploadComplete,
  folder = 'uploads',
  aspectRatio = 'square',
  className,
  placeholder,
}: ImageUploadProps) {
  const handleComplete = onUpload || onUploadComplete || (() => {});
  const displayCurrentImage = currentImage || currentImageUrl;
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      handleComplete(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    handleComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || displayCurrentImage;

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border transition-all hover:border-primary',
        aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'portrait' ? 'aspect-[4/5]' : 'aspect-[3/1]',
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {displayImage ? (
        <>
          <img
            src={displayImage}
            alt="Upload preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <>
                <button
                  onClick={handleRemove}
                  className="p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center bg-muted/50">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            placeholder || (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center px-4">
                  Click to upload
                </p>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
