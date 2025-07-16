import React, { useCallback } from 'react';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
  isLoading?: boolean;
  onError?: (title: string, message: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, isLoading, onError }) => {
  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    const allowedTypes = ['.log', '.txt'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExtension)) {
      onError?.('Invalid File Type', `Only log files (.log, .txt) are supported. You selected: ${fileExtension}`);
      return false;
    }
    
    // Check file size (basic check - detailed check happens in handleFileLoad)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      onError?.('File Too Large', `The file size exceeds the maximum allowed size of 100MB.`);
      return false;
    }
    
    return true;
  }, [onError]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      event.target.value = ''; // Clear the input
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
    };
    reader.onerror = () => {
      onError?.('File Read Error', 'Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  }, [onFileLoad, validateFile, onError]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
    };
    reader.onerror = () => {
      onError?.('File Read Error', 'Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  }, [onFileLoad, validateFile, onError]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="text-gray-600">Processing log file...</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Upload Log File
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop your log file here, or click to browse
                </p>
              </div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                <File className="h-4 w-4 mr-2" />
                Choose File
                <input
                  type="file"
                  accept=".log,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
};