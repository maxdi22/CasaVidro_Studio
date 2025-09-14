
import React from 'react';
import { Output, ImageFile } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { LogoIcon } from './icons/LogoIcon';
import { ReplaceIcon } from './icons/ReplaceIcon';

interface MediaDisplayProps {
  isLoading: boolean;
  loadingMessage: string;
  output: Output | null;
  onUseOutputAsProduct: (imageFile: ImageFile) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const WelcomeMessage: React.FC = () => (
  <div className="text-center text-[var(--foreground)] opacity-80">
    <LogoIcon className="w-24 h-24 mx-auto opacity-50" />
    <h2 className="mt-6 text-2xl font-bold text-[var(--foreground)]">Bem-vindo ao Casa Vidro Studio</h2>
    <p className="mt-2">Sua suíte de criação de mídia com IA para o mercado criativo.</p>
    <p>Use o painel à esquerda para começar.</p>
  </div>
);

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center text-[var(--foreground)]">
    <SpinnerIcon className="w-12 h-12 mx-auto mb-4" />
    <p className="text-lg animate-pulse">{message}</p>
  </div>
);

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ isLoading, loadingMessage, output, onUseOutputAsProduct, addToast }) => {
  const handleUseOutput = async () => {
    if (output && output.type === 'image') {
      try {
        const response = await fetch(output.src);
        const blob = await response.blob();
        const file = new File([blob], 'generated_image.png', { type: blob.type });

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
          onUseOutputAsProduct({
            base64,
            mimeType: file.type,
            dataUrl,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Failed to process image for 'Use as Product'", error);
        addToast("Não foi possível usar esta imagem como produto. Por favor, baixe e envie novamente.", 'error');
      }
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-2xl w-full h-full flex items-center justify-center p-4 border border-[var(--border)]">
      <div className="w-full h-full flex flex-col items-center justify-center">
        {isLoading ? (
          <LoadingIndicator message={loadingMessage} />
        ) : !output ? (
          <WelcomeMessage />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="relative group w-full max-w-full max-h-[85%] aspect-auto flex-shrink">
              {output.type === 'image' ? (
                <>
                  <img src={output.src} alt="Generated media" className="object-contain w-full h-full rounded-md" />
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 rounded-md">
                    <a href={output.src} download="casavidro-studio-creation.png" className="p-3 bg-black/40 text-white rounded-full hover:bg-[var(--primary)] transition-colors" title="Baixar">
                      <DownloadIcon />
                    </a>
                    <button onClick={handleUseOutput} className="p-3 bg-black/40 text-white rounded-full hover:bg-[var(--primary)] transition-colors" title="Iterar com esta imagem">
                      <ReplaceIcon />
                    </button>
                  </div>
                </>
              ) : (
                <video src={output.src} controls className="object-contain w-full h-full rounded-md" />
              )}
            </div>
            {output.text && (
              <p className="text-sm text-[var(--foreground)] bg-[var(--background)] p-3 rounded-md max-w-full text-center flex-shrink-0">
                {output.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
