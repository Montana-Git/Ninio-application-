import { useState, useRef } from "react";
import { Camera, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { FileUploadService } from '@/services/file-upload-service';
import { useNotification } from '@/contexts/NotificationContext';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export function ProfileImageUpload({
  currentImageUrl,
  onImageUploaded,
  size = 'lg',
  className,
  fallback = 'U',
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please upload an image file (JPEG, PNG, etc.)',
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        type: 'error',
        title: 'File too large',
        message: 'Please upload an image smaller than 5MB',
      });
      return;
    }
    
    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Upload the file
    setIsUploading(true);
    try {
      const { url, error } = await FileUploadService.uploadFile(file, {
        folder: 'profile-images',
        isPublic: true,
      });
      
      if (error) throw error;
      
      if (url) {
        onImageUploaded(url);
        showNotification({
          type: 'success',
          title: 'Image uploaded',
          message: 'Your profile image has been updated',
        });
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      showNotification({
        type: 'error',
        title: 'Upload failed',
        message: 'There was an error uploading your image. Please try again.',
      });
      
      // Reset preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage src={displayUrl || ''} />
        <AvatarFallback className="text-2xl">{fallback}</AvatarFallback>
      </Avatar>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-full">
        {isUploading ? (
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        ) : (
          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="secondary"
              className="rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
            
            {displayUrl && (
              <Button
                size="icon-sm"
                variant="destructive"
                className="rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
