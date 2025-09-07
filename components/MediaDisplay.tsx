import React from 'react';
import { Output, ImageFile } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { LogoIcon } from './icons/LogoIcon';

interface MediaDisplayProps {
  isLoading: boolean;
  loadingMessage: string;
  output: Output | null;
  onUseOutputAsProduct: (imageFile: ImageFile) => void;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const UseAsBaseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M4 19v-5h5m11-4h-5V4m5 15h-5v-5" />
    </svg>
);


const WelcomeMessage: React.FC = () => (
  <div className="text-center text-slate-600 dark:text-slate-400">
    <LogoIcon className="w-24 h-24 mx-auto text-slate-400 dark:text-slate-600" />
    <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-200">Bem-vindo ao Casa Vidro Studio</h2>
    <p className="mt-2">Sua suíte de criação de mídia com IA para o mercado criativo.</p>
    <p>Use o painel à esquerda para começar.</p>
  </div>
);

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center text-slate-800 dark:text-slate-300">
    <SpinnerIcon className="w-12 h-12 mx-auto mb-4" />
    <p className="text-lg animate-pulse">{message}</p>
  </div>
);

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ isLoading, loadingMessage, output, onUseOutputAsProduct }) => {
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
        alert("Não foi possível usar esta imagem como produto. Por favor, baixe e envie novamente.");
      }
    }
  };

  return (
    <div className="bg-white/30 dark:bg-black/20 backdrop-blur-lg rounded-2xl w-full h-full flex items-center justify-center p-4 border border-white/40 dark:border-black/30">
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
                    <a href={output.src} download="casavidro-studio-creation.png" className="p-3 bg-white/20 dark:bg-black/20 text-white rounded-full hover:bg-indigo-600 transition-colors" title="Baixar">
                      <DownloadIcon />
                    </a>
                    <button onClick={handleUseOutput} className="p-3 bg-white/20 dark:bg-black/20 text-white rounded-full hover:bg-indigo-600 transition-colors" title="Usar como Produto">
                      <UseAsBaseIcon />
                    </button>
                  </div>
                </>
              ) : (
                <video src={output.src} controls className="object-contain w-full h-full rounded-md" />
              )}
            </div>
            {output.text && (
              <p className="text-sm text-slate-800 dark:text-slate-200 bg-white/30 dark:bg-black/20 backdrop-blur-sm p-3 rounded-md max-w-full text-center flex-shrink-0">
                {output.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};