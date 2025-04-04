import { useState, useRef } from "react";
import { Upload, X, FileText, Image, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
  showPreview?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileUpload,
  accept = '*/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  multiple = false,
  disabled = false,
  label = 'Upload a file',
  description = 'Drag and drop a file here, or click to select a file',
  showPreview = true,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds the limit of ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    // Check file type if accept is specified
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      
      // Handle image/* or similar patterns
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });

      if (!isAccepted) {
        setError(`File type not accepted. Please upload a file of type: ${accept}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    onFileSelect(file);
    setSuccess(false);

    // Create preview for images
    if (file.type.startsWith('image/') && showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !onFileUpload) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);
      
      // Actual upload
      const url = await onFileUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-8 w-8 text-muted-foreground" />;
    
    if (selectedFile.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-primary" />;
    } else if (selectedFile.type.includes('pdf')) {
      return <FileText className="h-8 w-8 text-primary" />;
    } else {
      return <File className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          "flex flex-col items-center justify-center text-center",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-2">
          {getFileIcon()}
          <div className="space-y-1">
            <h3 className="text-base font-medium">{label}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            {maxSize && (
              <p className="text-xs text-muted-foreground">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            )}
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              {getFileIcon()}
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {success && <CheckCircle className="h-5 w-5 text-success" />}
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
        </div>
      )}

      {preview && showPreview && (
        <div className="mt-2 relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-48 rounded-md object-contain mx-auto border" 
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && onFileUpload && (
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || disabled}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      )}
    </div>
  );
}
