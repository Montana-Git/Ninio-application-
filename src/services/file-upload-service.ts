import { supabase } from '@/lib/supabase';

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Service for handling file uploads to Supabase Storage
 */
export class FileUploadService {
  /**
   * Upload a file to Supabase Storage
   * @param file The file to upload
   * @param options Upload options
   * @returns URL of the uploaded file or error
   */
  static async uploadFile(
    file: File, 
    options: UploadOptions = {}
  ): Promise<{ url: string | null; error: any }> {
    try {
      const {
        bucket = 'public',
        folder = '',
        isPublic = true,
        metadata = {},
      } = options;

      // Create a unique file name to prevent collisions
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      // Construct the file path
      const filePath = folder 
        ? `${folder}/${fileName}`
        : fileName;

      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: options.contentType || file.type,
          metadata
        });

      if (error) throw error;

      // Get the public URL if the file should be public
      if (isPublic) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        
        return { url: publicUrl, error: null };
      }

      // For private files, return the path
      return { url: data.path, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { url: null, error };
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param path Path to the file
   * @param bucket Storage bucket
   * @returns Success status
   */
  static async deleteFile(
    path: string,
    bucket: string = 'public'
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error };
    }
  }

  /**
   * Get a signed URL for a private file
   * @param path Path to the file
   * @param bucket Storage bucket
   * @param expiresIn Expiration time in seconds (default: 60 minutes)
   * @returns Signed URL
   */
  static async getSignedUrl(
    path: string,
    bucket: string = 'private',
    expiresIn: number = 3600
  ): Promise<{ signedUrl: string | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;

      return { signedUrl: data.signedUrl, error: null };
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return { signedUrl: null, error };
    }
  }

  /**
   * List files in a bucket/folder
   * @param bucket Storage bucket
   * @param folder Folder path
   * @returns List of files
   */
  static async listFiles(
    bucket: string = 'public',
    folder: string = ''
  ): Promise<{ files: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder);

      if (error) throw error;

      return { files: data, error: null };
    } catch (error) {
      console.error('Error listing files:', error);
      return { files: null, error };
    }
  }
}
