import React, { DragEvent, ChangeEvent } from 'react';
import { ImageFile } from '../types';
import { fileToImageFile } from '../utils/fileUtils';

interface MultiImageUploaderProps {
  label: string;
  imageFiles: ImageFile[];
  onImageChange: (files: ImageFile[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

const ImageIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  label,
  imageFiles,
  onImageChange,
  disabled = false,
  maxImages = 4,
}) => {
  const handleFileChange = async (file: File, index: number) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const imgFile = await fileToImageFile(file);
        const newFiles = [...imageFiles];
        // This logic correctly places the new image, even if there are gaps.
        // The array is compacted upon state update.
        if (index >= newFiles.length) {
            newFiles.push(imgFile);
        } else {
            newFiles[index] = imgFile;
        }
        onImageChange(newFiles.filter(Boolean));
      } catch (error) {
        console.error("Error converting file:", error);
        alert("Falha ao processar o arquivo de imagem.");
      }
    } else if (file) {
      alert("Por favor, envie um arquivo de imagem válido.");
    }
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>, index: number) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file, index);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file, index);
    e.target.value = ''; // Reset input
  };

  const handleClear = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    onImageChange(newFiles);
  };

  const slots = Array.from({ length: maxImages });

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((_, index) => {
          const imageFile = imageFiles[index];
          // Allow uploading into any empty slot
          const canUpload = !imageFile;
          const uploaderId = `multi-uploader-${index}`;
          
          return (
            <div key={index} className="relative">
              <label
                htmlFor={uploaderId}
                className={`relative block w-full aspect-square border-2 border-dashed rounded-lg p-2 text-center transition-all duration-200 ease-in-out border-[var(--border)]
                  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[var(--primary)]'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, index)}
              >
                {imageFile ? (
                  <img src={imageFile.dataUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--foreground)] opacity-70">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs">Ângulo {index + 1}</span>
                  </div>
                )}
              </label>
              <input id={uploaderId} name={uploaderId} type="file" className="sr-only" onChange={(e) => onFileInputChange(e, index)} disabled={disabled || !canUpload} accept="image/*" />
              {imageFile && !disabled && (
                <button
                  onClick={(e) => handleClear(e, index)}
                  className="absolute top-1 right-1 p-1 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-colors"
                  aria-label={`Limpar imagem ${index + 1}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};