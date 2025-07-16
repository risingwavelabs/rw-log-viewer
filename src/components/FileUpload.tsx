import React, { useCallback } from 'react';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, isLoading }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
    };
    reader.readAsText(file);
  }, [onFileLoad]);

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