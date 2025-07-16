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
    <div className="w-full max-w-lg mx-auto">
      <div
        className="relative border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-all duration-300 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl group"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center space-y-6">
          {isLoading ? (
            <>
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 animate-pulse"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-800 mb-1">Processing log file...</p>
                <p className="text-sm text-gray-600">This may take a moment for large files</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-2xl font-bold text-gray-900">
                  Upload Log File
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Drag and drop your log file here, or click to browse
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">.log</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">.txt</span>
                  <span className="text-gray-400">files supported</span>
                </div>
              </div>
              <label className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium">
                <File className="h-5 w-5 mr-2" />
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
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 bg-indigo-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-2 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};