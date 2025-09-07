import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  onSave: (newPrompt: string) => void;
}

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({ isOpen, onClose, initialPrompt, onSave }) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleSave = () => {
    onSave(prompt);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Prompt" size="2xl">
      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-64 p-3 bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-200 border border-slate-400/50 dark:border-slate-600/50 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-slate-600 dark:placeholder:text-slate-400"
          placeholder="Descreva sua visão em detalhes..."
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black/10 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded-md hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Salvar Prompt
          </button>
        </div>
      </div>
    </Modal>
  );
};