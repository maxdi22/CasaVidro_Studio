import React, { useState, useCallback, DragEvent } from 'react';
import { ImageFile } from '../types';
import { fileToImageFile } from '../utils/fileUtils';

interface ImageUploaderProps {
  id: string;
  label: string;
  imageFile: ImageFile | null;
  onImageChange: (file: ImageFile | null) => void;
  disabled?: boolean;
}

const ImageIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, imageFile, onImageChange, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const imgFile = await fileToImageFile(file);
        onImageChange(imgFile);
      } catch (error) {
        console.error("Error converting file:", error);
        alert("Falha ao processar o arquivo de imagem.");
      }
    } else if (file) {
      alert("Por favor, envie um arquivo de imagem válido.");
    }
  };

  const onDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); // Necessary to allow drop
  };
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };
  
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageChange(null);
  };

  const uploaderClasses = `relative block w-full aspect-square border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ease-in-out
    bg-black/5 dark:bg-white/5 border-slate-900/20 dark:border-white/20
    ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-black/10 dark:hover:bg-white/10'}
    ${isDragging ? 'border-indigo-500 dark:border-indigo-400 bg-black/10 dark:bg-white/10' : ''}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">{label}</label>
      <div className="relative">
        <label
          htmlFor={id}
          className={uploaderClasses}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {imageFile ? (
            <img src={imageFile.dataUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-400">
              <ImageIcon className="w-12 h-12 mb-2" />
              <span className="text-sm">Clique ou arraste e solte</span>
            </div>
          )}
        </label>
        <input id={id} name={id} type="file" className="sr-only" onChange={onFileInputChange} disabled={disabled} accept="image/*" />
        {imageFile && !disabled && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-colors"
            aria-label="Limpar imagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};