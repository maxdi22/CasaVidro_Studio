
import React, { useState, useEffect, useCallback, DragEvent } from 'react';
import { Modal } from './Modal';
import { InspoImage, InspoCategory, INSPO_CATEGORIES } from '../../types';
import * as inspoService from '../../services/inspoService';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface InspoManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChange: () => void;
}

const ImageIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const InspoManagementModal: React.FC<InspoManagementModalProps> = ({ isOpen, onClose, onDataChange }) => {
  const [images, setImages] = useState<InspoImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InspoCategory>(INSPO_CATEGORIES[0]);

  const loadImages = useCallback(() => {
    setIsLoading(true);
    inspoService.getInspoImages().then(data => {
      setImages(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    } else {
        // Reset upload state on close
        setFileToUpload(null);
        setPreviewUrl(null);
    }
  }, [isOpen, loadImages]);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
        setFileToUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else if (file) {
        alert("Por favor, selecione um arquivo de imagem válido.");
    }
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!fileToUpload) return;
    setIsUploading(true);
    try {
      await inspoService.addInspoImage(fileToUpload, selectedCategory);
      setFileToUpload(null);
      setPreviewUrl(null);
      onDataChange();
      loadImages();
    } catch (err) {
      console.error(err);
      alert("Falha ao enviar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta imagem?")) {
      try {
        await inspoService.deleteInspoImage(id);
        onDataChange();
        loadImages();
      } catch (err) {
        console.error(err);
        alert("Falha ao excluir imagem.");
      }
    }
  };
  
  const uploaderClasses = `relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-black/5 dark:bg-black/20
    ${isDragging ? 'border-[var(--primary)]' : 'border-[var(--border)]'}
    hover:border-[var(--primary)]`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Imagens de Inspiração" size="4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Uploader Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-[var(--foreground)]">Adicionar Nova Imagem</h3>
          
          <label 
            htmlFor="inspo-upload"
            className={uploaderClasses}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-[var(--foreground)] opacity-70">
                    <ImageIcon className="w-12 h-12 mb-2"/>
                    <p className="font-semibold">Clique para enviar ou arraste e solte</p>
                    <p className="text-xs">PNG, JPG, WEBP</p>
                </div>
            )}
          </label>
          <input id="inspo-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)} />

          {fileToUpload && (
            <div className="space-y-3 p-3 bg-black/5 dark:bg-black/20 rounded-lg">
                <div>
                    <label htmlFor="category-select" className="block text-sm font-medium text-[var(--foreground)] mb-1">Categoria</label>
                    <select
                        id="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as InspoCategory)}
                        className="w-full p-2 bg-[var(--card)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--primary)]"
                    >
                        {INSPO_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full px-4 py-2 bg-[var(--primary)] text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isUploading ? <SpinnerIcon className="w-5 h-5" /> : 'Adicionar à Galeria'}
                </button>
            </div>
          )}
        </div>

        {/* Gallery Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-[var(--foreground)]">Galeria Atual</h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-48"><SpinnerIcon className="w-10 h-10" /></div>
          ) : images.length === 0 ? (
            <div className="text-center py-10 text-[var(--foreground)] opacity-70 bg-black/5 dark:bg-black/20 rounded-lg">
              <p>Nenhuma imagem na galeria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2">
              {images.map(image => (
                <div key={image.id} className="relative group aspect-square">
                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover rounded-md" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-600"
                      title="Excluir Imagem"
                    >
                      <TrashIcon className="w-5 h-5"/>
                    </button>
                  </div>
                   <div className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
                    {image.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
