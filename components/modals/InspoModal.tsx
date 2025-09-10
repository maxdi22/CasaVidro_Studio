
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { getInspoImages } from '../../services/inspoService';
import { InspoImage, InspoCategory } from '../../types';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { LuxuryIcon } from '../icons/LuxuryIcon';
import { DecorIcon } from '../icons/DecorIcon';
import { FashionIcon } from '../icons/FashionIcon';
import { AdvertisingIcon } from '../icons/AdvertisingIcon';
import { InspoManagementModal } from './InspoManagementModal';

interface InspoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (dataUrl: string) => void;
}

const InspoItem: React.FC<{ image: InspoImage; onSelect: (url: string) => void }> = ({ image, onSelect }) => {
    return (
        <div 
            className="relative group bg-black/20 rounded-lg overflow-hidden cursor-pointer mb-4 break-inside-avoid"
            onClick={() => onSelect(image.src)}
        >
            <img src={image.src} alt={image.alt} loading="lazy" className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <button className="text-white text-xs bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full font-semibold">
                    Usar como Cenário
                </button>
            </div>
        </div>
    );
};

const CATEGORY_MAP: { [key in InspoCategory]: { name: string, icon: React.FC<{ className?: string }> } } = {
    'Luxuoso': { name: 'Luxuoso', icon: LuxuryIcon },
    'Decor': { name: 'Decor', icon: DecorIcon },
    'Fashion': { name: 'Fashion', icon: FashionIcon },
    'Publicitário': { name: 'Publicitário', icon: AdvertisingIcon },
};

export const InspoModal: React.FC<InspoModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [images, setImages] = useState<InspoImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<InspoCategory | 'Featured'>('Featured');
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  const loadImages = () => {
    setIsLoading(true);
    getInspoImages()
      .then(data => {
        setImages(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load inspiration images:", err);
        setIsLoading(false);
      });
  };
  
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const filteredImages = useMemo(() => {
    return images.filter(image => {
      const matchesCategory = activeCategory === 'Featured' || image.category === activeCategory;
      const matchesSearch = image.alt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [images, searchQuery, activeCategory]);

  const handleDataChange = () => {
    loadImages();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Inspiração para Cenários" size="5xl">
        <div className="flex flex-col gap-4">
          <header className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div className="relative w-full md:w-1/3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-[var(--foreground)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                      type="search"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 pl-10 bg-black/5 dark:bg-black/20 text-[var(--foreground)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition placeholder:text-slate-600 dark:placeholder:text-slate-400"
                  />
              </div>
              <div className="flex items-center gap-2">
                  <button
                      onClick={() => setActiveCategory('Featured')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                          activeCategory === 'Featured'
                              ? 'bg-[var(--foreground)] text-[var(--background)]'
                              : 'bg-transparent text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      Featured
                  </button>
                  {Object.entries(CATEGORY_MAP).map(([key, { name, icon: Icon }]) => (
                      <button
                          key={key}
                          onClick={() => setActiveCategory(key as InspoCategory)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                              activeCategory === key
                                ? 'bg-[var(--foreground)] text-[var(--background)]'
                                : 'bg-transparent text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                      >
                         <Icon className="h-5 w-5" />
                         {name}
                      </button>
                  ))}
              </div>
              <button
                onClick={() => setIsManagementOpen(true)}
                className="px-4 py-2 bg-[var(--primary)] text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm"
              >
                Gerenciar Imagens
              </button>
          </header>
          
          {isLoading ? (
              <div className="flex justify-center items-center h-96">
                  <SpinnerIcon className="w-12 h-12" />
              </div>
          ) : images.length === 0 ? (
              <div className="text-center py-16 text-[var(--foreground)] opacity-70">
                  <p className="text-lg font-semibold">Sua galeria de inspiração está vazia.</p>
                  <p>Clique em "Gerenciar Imagens" para começar a enviar seus próprios cenários.</p>
              </div>
          ) : filteredImages.length === 0 ? (
              <div className="text-center py-16 text-[var(--foreground)] opacity-70">
                  <p>Nenhuma inspiração encontrada para sua busca.</p>
              </div>
          ) : (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                  {filteredImages.map((img) => (
                      <InspoItem key={img.id} image={img} onSelect={onSelect} />
                  ))}
              </div>
          )}
        </div>
      </Modal>
      <InspoManagementModal 
        isOpen={isManagementOpen} 
        onClose={() => setIsManagementOpen(false)}
        onDataChange={handleDataChange}
      />
    </>
  );
};