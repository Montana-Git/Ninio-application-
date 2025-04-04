import { useState } from "react";
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { FileUpload } from '@/components/ui/file-upload';
import { FileUploadService } from '@/services/file-upload-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileImageUpload } from '@/components/ui/profile-image-upload';
import { Button } from '@/components/ui/button';
import { FileText, Image, File, Upload, Trash2 } from 'lucide-react';

const FileUploadPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [profileImage, setProfileImage] = useState<string | undefined>(user?.avatar_url);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const folder = file.type.startsWith('image/') ? 'images' : 'documents';
      const { url, error } = await FileUploadService.uploadFile(file, {
        folder,
        isPublic: true,
      });

      if (error) throw error;

      if (url) {
        setUploadedFiles(prev => [
          ...prev,
          {
            name: file.name,
            url,
            type: file.type,
          },
        ]);

        showNotification({
          type: 'success',
          title: 'File Uploaded',
          message: `${file.name} has been uploaded successfully.`,
        });

        return url;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'There was an error uploading your file. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }

    return '';
  };

  const handleProfileImageUpdate = (url: string) => {
    setProfileImage(url);
    // In a real application, you would update the user's profile in the database
    showNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile image has been updated successfully.',
    });
  };

  const handleDeleteFile = async (fileUrl: string, index: number) => {
    try {
      // Extract the path from the URL
      const urlObj = new URL(fileUrl);
      const path = urlObj.pathname.split('/').slice(2).join('/');
      
      const { success, error } = await FileUploadService.deleteFile(path);
      
      if (error) throw error;
      
      if (success) {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        
        showNotification({
          type: 'success',
          title: 'File Deleted',
          message: 'The file has been deleted successfully.',
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      showNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'There was an error deleting the file. Please try again.',
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>File Upload | Ninio Kindergarten</title>
      </Helmet>

      {/* Sidebar */}
      <Sidebar userName={user?.first_name} userRole="parent" userAvatar={profileImage} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {t('parent.fileUpload.title')}
            </h1>
            <p className="text-gray-600">
              {t('parent.fileUpload.subtitle')}
            </p>
          </div>

          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Image</CardTitle>
                  <CardDescription>
                    Update your profile picture. This will be visible to teachers and administrators.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ProfileImageUpload
                    currentImageUrl={profileImage}
                    onImageUploaded={handleProfileImageUpdate}
                    size="xl"
                    fallback={user?.first_name?.charAt(0) || 'U'}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Upload important documents such as medical records, permission slips, or other forms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileUpload={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt"
                    maxSize={10 * 1024 * 1024} // 10MB
                    label="Upload Document"
                    description="Drag and drop a document here, or click to select a file"
                  />
                </CardContent>
              </Card>
              
              {uploadedFiles.filter(f => !f.type.startsWith('image/')).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {uploadedFiles
                        .filter(f => !f.type.startsWith('image/'))
                        .map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.type)}
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{file.type}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => window.open(file.url, '_blank')}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => handleDeleteFile(file.url, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Images</CardTitle>
                  <CardDescription>
                    Upload images of your child's activities, artwork, or other memorable moments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileUpload={handleFileUpload}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    label="Upload Image"
                    description="Drag and drop an image here, or click to select a file"
                    showPreview={true}
                  />
                </CardContent>
              </Card>
              
              {uploadedFiles.filter(f => f.type.startsWith('image/')).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uploadedFiles
                        .filter(f => f.type.startsWith('image/'))
                        .map((file, index) => (
                          <div key={index} className="relative group overflow-hidden rounded-md border">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                              <p className="text-white font-medium truncate">{file.name}</p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  size="icon-sm"
                                  onClick={() => window.open(file.url, '_blank')}
                                >
                                  <Image className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon-sm"
                                  onClick={() => handleDeleteFile(file.url, index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPage;
