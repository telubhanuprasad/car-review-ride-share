
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadCarsToFirebase } from '@/utils/uploadCarsData';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const AdminUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadStatus('idle');
    
    try {
      const result = await uploadCarsToFirebase();
      
      if (result.success) {
        setUploadStatus('success');
        toast({
          title: "Upload Successful!",
          description: result.message,
        });
      } else {
        setUploadStatus('error');
        toast({
          title: "Upload Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Upload Cars to Firebase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Click the button below to upload the car data to your Firebase database.
        </p>
        
        <Button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} className="mr-2" />
              Upload Cars
            </>
          )}
        </Button>
        
        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} />
            Cars uploaded successfully!
          </div>
        )}
        
        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            Upload failed. Check console for details.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUpload;
