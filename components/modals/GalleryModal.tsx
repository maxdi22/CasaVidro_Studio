import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Creation } from '../../types';
import { getAllCreations, deleteCreation } from '../../services/dbService';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: (creation: Creation) => void;
}

const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ReloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5m-6-16a9 9 0 019 9h3a12 12 0 10-2.828 8.172" />
    </svg>
);

const PlayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const GalleryItem: React.FC<{ creation: Creation; onDelete: (id: number) => void; onReload: (creation: Creation) => void; }> = ({ creation, onDelete, onReload }) => {
    const handleDelete = () => {
        if (window.confirm('Você tem certeza que deseja excluir permanentemente esta criação?')) {
            if(creation.id) onDelete(creation.id);
        }
    };

    return (
        <div className="relative group aspect-square bg-slate-700 rounded-lg overflow-hidden">
            <img src={creation.output.src} alt={creation.prompt} className="w-full h-full object-cover" />
            {creation.output.type === 'video' && (
                <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
                    <PlayIcon className="w-4 h-4 text-white" />
                </div>
            )}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-2">
                <p className="text-xs text-white flex-grow overflow-hidden overflow-ellipsis">{creation.prompt}</p>
                <div className="flex justify-end gap-2 items-end">
                    <button onClick={() => onReload(creation)} className="p-2 bg-slate-600 text-white rounded-full hover:bg-indigo-600" title="Recarregar Criação">
                        <ReloadIcon className="w-4 h-4" />
                    </button>
                    <button onClick={handleDelete} className="p-2 bg-slate-600 text-white rounded-full hover:bg-red-600" title="Excluir Criação">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose, onReload }) => {
  const [creations, setCreations] = useState<Creation[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCreations();
    }
  }, [isOpen]);

  const loadCreations = async () => {
    const items = await getAllCreations();
    setCreations(items);
  };

  const handleDelete = async (id: number) => {
    await deleteCreation(id);
    loadCreations();
  };

  const handleReload = (creation: Creation) => {
    onReload(creation);
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Minhas Criações" size="5xl">
      {creations.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>Suas criações aparecerão aqui.</p>
          <p>Vá criar algo incrível!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {creations.map((c) => (
            c.id && <GalleryItem key={c.id} creation={c} onDelete={handleDelete} onReload={handleReload} />
          ))}
        </div>
      )}
    </Modal>
  );
};