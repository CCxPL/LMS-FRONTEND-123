import React, { useRef, useState } from 'react';
import { Upload, X, Image, FileText, Film } from 'lucide-react';

interface FileUploadProps {
  type?: 'image' | 'video' | 'document' | 'any';
  onFileSelect: (file: File) => void;
  maxSize?: number;
  className?: string;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  type = 'any', 
  onFileSelect, 
  maxSize = 10,
  className = '',
  label
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptMap = {
    image: 'image/*',
    video: 'video/*',
    document: '.pdf,.doc,.docx,.txt',
    any: '*/*'
  };

  const iconMap = {
    image: <Image className="w-8 h-8 text-gray-400" />,
    video: <Film className="w-8 h-8 text-gray-400" />,
    document: <FileText className="w-8 h-8 text-gray-400" />,
    any: <Upload className="w-8 h-8 text-gray-400" />
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size should be less than ${maxSize}MB`);
      return;
    }

    setFileName(file.name);
    onFileSelect(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-40 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : fileName ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-500" />
            <span className="text-sm text-gray-700 truncate max-w-[200px]">{fileName}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
          {iconMap[type]}
          <span className="mt-2 text-sm text-gray-600">
            Click to upload {type !== 'any' ? type : 'file'}
          </span>
          <span className="text-xs text-gray-400 mt-1">Max {maxSize}MB</span>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={acceptMap[type]}
            onChange={handleFileChange}
          />
        </label>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;