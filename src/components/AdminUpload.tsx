
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadCarsToFirebase } from '@/utils/uploadCarsData';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

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
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-3xl shadow-xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-3 text-slate-800">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
            <Upload size={20} className="text-white" />
          </div>
          Upload Cars to Firebase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-slate-600 text-center leading-relaxed">
          Sync your car inventory with Firebase to keep your database up to date.
        </p>
        
        <Button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-3"></div>
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
          <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-2xl">
            <CheckCircle size={16} />
            Cars uploaded successfully!
          </div>
        )}
        
        {uploadStatus === 'error' && (
          <div className="flex items-center justify-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-2xl">
            <AlertCircle size={16} />
            Upload failed. Check console for details.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUpload;
