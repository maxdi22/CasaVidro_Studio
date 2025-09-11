import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, Output, Creation, Mode, AspectRatio, ImageFile, ProductSize } from './types';
import { ImageUploader } from './components/ImageUploader';
import { MediaDisplay } from './components/MediaDisplay';
import { GalleryModal } from './components/modals/GalleryModal';
import { PromptEditorModal } from './components/modals/PromptEditorModal';
import { PromptHelperModal } from './components/modals/PromptHelperModal';
import { MaskEditorModal } from './components/modals/MaskEditorModal';
import { InspoModal } from './components/modals/InspoModal';
import { Header } from './components/Header';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import { ExclamationIcon } from './components/icons/ExclamationIcon';
import * as gemini from './services/geminiService';
import * as db from './services/dbService';
import { VIDEO_LOADING_MESSAGES } from './constants';
import { MultiImageUploader } from './components/MultiImageUploader';
import { fileToImageFile, urlToImageFile } from './utils/fileUtils';
import { InspoIcon } from './components/icons/InspoIcon';
import { useAuth } from './context/AuthContext';
import { VariationsIcon } from './components/icons/VariationsIcon';

const initialState: AppState = {
  mode: 'image',
  prompt: '',
  videoPrompt: '',
  negativePrompt: '',
  productImages: [],
  sceneImage: null,
  aspectRatio: '1:1',
  productSize: 'Same Size',
  contextImages: [],
};

type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

// --- Helper Components defined outside App ---

const ModeToggle: React.FC<{ mode: Mode; onModeChange: (mode: Mode) => void; disabled: boolean }> = ({ mode, onModeChange, disabled }) => (
    <div className="flex bg-zinc-500/10 p-1 rounded-lg">
        <button
            onClick={() => onModeChange('image')}
            disabled={disabled}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'image' ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' : 'text-[var(--foreground)] opacity-70 hover:opacity-100'} disabled:opacity-50`}
        >Imagem</button>
        <button
            onClick={() => onModeChange('video')}
            disabled={disabled}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'video' ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' : 'text-[var(--foreground)] opacity-70 hover:opacity-100'} disabled:opacity-50`}
        >Vídeo</button>
    </div>
);

// --- Social Media Icons for Aspect Ratio Selector ---

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="url(#ig-grad-ratio)" />
        <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.9502 7.05005H16.9602" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <radialGradient id="ig-grad-ratio" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20.5 3.5) rotate(135) scale(25.4558)">
                <stop stopColor="#F0C67D"/><stop offset="0.375" stopColor="#D26A4D"/><stop offset="0.682292" stopColor="#C22B8E"/><stop offset="1" stopColor="#7323B4"/>
            </radialGradient>
        </defs>
    </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.28 6.118C14.069 6.118 12.399 6.118 12.399 6.118V14.638S12.389 17.028 14.859 17.098C17.359 17.158 17.419 14.698 17.419 14.698V9.538S14.599 9.288 14.599 12.108" fill="#25F4EE" />
        <path d="M12.28 6.118C12.069 6.118 10.399 6.118 10.399 6.118V14.638S10.389 17.028 12.859 17.098C15.359 17.158 15.419 14.698 15.419 14.698V9.538S12.599 9.288 12.599 12.108" fill="#FE2C55" />
        <path d="M13.28 6.118C13.069 6.118 11.399 6.118 11.399 6.118V14.638S11.389 17.028 13.859 17.098C16.359 17.158 16.419 14.698 16.419 14.698V9.538S13.599 9.288 13.599 12.108" fill="#000000" />
    </svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z" fill="#FF0000"/>
        <path d="M9.5 15.5V8.5L16.5 12L9.5 15.5Z" fill="white"/>
    </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z" fill="#1877F2"/>
        <path d="M15 8.5H13.5C12.9477 8.5 12.5 8.94772 12.5 9.5V11.5H15L14.5 14.5H12.5V20H9.5V14.5H8V11.5H9.5V9.5C9.5 7.567 11.067 6 13 6H15V8.5Z" fill="white"/>
    </svg>
);

const PinterestIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#E60023"/>
        <path d="M12 7.5C9.62 7.5 8 9.42 8 11.54C8 12.89 8.69 13.82 9.51 14.19C9.64 14.25 9.79 14.12 9.82 13.98L10.13 12.65C10.16 12.51 10.07 12.36 9.94 12.33C9.44 12.2 9.17 11.75 9.17 11.23C9.17 10.1 10.36 9.03 11.53 9.03C12.83 9.03 13.78 10.02 13.78 11.28C13.78 12.44 13.1 13.52 12.22 13.52C11.69 13.52 11.33 13.15 11.33 12.72C11.33 12.22 11.66 11.65 11.66 11.65C12.11 10.63 11.08 9.5 10.1 10.03L9.66 11.88C9.28 13.34 10.3 14.97 11.79 14.97C13.68 14.97 15 13.1 15 11.2C15 9.12 13.62 7.5 12 7.5Z" fill="white"/>
    </svg>
);

const AspectRatioSelector: React.FC<{ value: AspectRatio; onChange: (value: AspectRatio) => void; disabled: boolean }> = ({ value, onChange, disabled }) => {
    const ratios = [
        { ratio: '1:1' as AspectRatio, icons: [InstagramIcon, FacebookIcon] },
        { ratio: '16:9' as AspectRatio, icons: [YouTubeIcon, FacebookIcon] },
        { ratio: '9:16' as AspectRatio, icons: [InstagramIcon, TikTokIcon] },
        { ratio: '4:3' as AspectRatio, icons: [] },
        { ratio: '3:4' as AspectRatio, icons: [PinterestIcon, InstagramIcon, FacebookIcon] },
    ];
    
    const aspectStyles: {[key in AspectRatio]: string} = { '1:1': 'aspect-square', '16:9': 'aspect-video', '9:16': 'aspect-[9/16]', '4:3': 'aspect-[4/3]', '3:4': 'aspect-[3/4]'};
    
    return (
        <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Proporção da Tela</label>
            <div className="grid grid-cols-5 gap-2">
                {ratios.map(r => (
                    <button key={r.ratio} onClick={() => onChange(r.ratio)} disabled={disabled}
                        className={`p-2 rounded-lg transition-all flex flex-col justify-between items-center text-center group border ${
                            value === r.ratio 
                                ? 'bg-[var(--background)] border-[var(--primary)] border-2'
                                : 'bg-black/5 dark:bg-black/20 border-transparent hover:border-[var(--border)]'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        
                        <div className={`w-full max-w-[40px] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--primary)]/50 rounded-sm transition-colors ${aspectStyles[r.ratio]} ${value === r.ratio ? '!border-[var(--primary)]' : ''}`}>
                           <span className={`text-xs font-semibold transition-colors ${value === r.ratio ? 'text-[var(--primary)]' : 'text-[var(--foreground)] opacity-60'}`}>{r.ratio}</span>
                        </div>
                        
                        <div className="flex justify-center items-center gap-1.5 min-h-[16px] mt-2">
                            {r.icons.map((Icon, index) => <Icon key={index} className="w-4 h-4" />)}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ProductSizeSelector: React.FC<{ value: ProductSize; onChange: (value: ProductSize) => void; disabled: boolean }> = ({ value, onChange, disabled }) => {
    const sizes: { id: ProductSize; label: string }[] = [
        { id: 'Much Smaller', label: 'Bem Menor' },
        { id: 'Smaller', label: 'Menor' },
        { id: 'Same Size', label: 'Mesmo Tamanho' },
        { id: 'Larger', label: 'Maior' },
        { id: 'Much Larger', label: 'Bem Maior' },
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Ajuste de Tamanho do Produto</label>
            <div className="flex flex-col sm:flex-row bg-zinc-500/10 rounded-lg p-1">
                {sizes.map(size => (
                    <button
                        key={size.id}
                        onClick={() => onChange(size.id)}
                        disabled={disabled}
                        className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all ${value === size.id ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm' : 'text-[var(--foreground)] opacity-70 hover:opacity-100'} disabled:opacity-50`}
                    >
                        {size.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2.293 2.293a1 1 0 01-1.414 0L4 12m13 1.293l2.293 2.293a1 1 0 010 1.414L14 22l-2.293-2.293a1 1 0 010-1.414L17 13.293z" />
    </svg>
);


interface PromptInputProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    contextImages: ImageFile[];
    onContextImagesChange: (files: ImageFile[]) => void;
    onTranslate: () => void;
    onExpand: () => void;
    onTips: () => void;
    onMakeVariations: () => void;
    showVariationsButton: boolean;
    isEditingFlow: boolean;
    disabled?: boolean;
    placeholder?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({
    prompt, onPromptChange, contextImages, onContextImagesChange,
    onTranslate, onExpand, onTips, onMakeVariations, showVariationsButton, 
    isEditingFlow, disabled, placeholder
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const imageFile = await fileToImageFile(file);
                onContextImagesChange([...contextImages, imageFile]);
            } catch (error) {
                console.error("Error processing context image:", error);
            }
        }
        event.target.value = ''; // Reset input
    };

    const removeContextImage = (index: number) => {
        onContextImagesChange(contextImages.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-[var(--foreground)]">Descreva Sua Visão</label>
                <div className="flex items-center divide-x divide-[var(--border)]">
                    {showVariationsButton && (
                         <button onClick={onMakeVariations} className="px-2 py-0.5 text-xs text-[var(--foreground)] opacity-70 rounded-l hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-1">
                            <VariationsIcon className="w-4 h-4" />
                            Criar Variações
                         </button>
                    )}
                    <button onClick={onExpand} className={`px-2 py-0.5 text-xs text-[var(--foreground)] opacity-70 ${showVariationsButton ? '' : 'rounded-l'} hover:bg-black/10 dark:hover:bg-white/10`}>Expandir</button>
                    <button onClick={onTips} className="px-2 py-0.5 text-xs text-[var(--foreground)] opacity-70 rounded-r hover:bg-black/10 dark:hover:bg-white/10">Dicas</button>
                </div>
            </div>
            <div className="relative">
                 <textarea id="prompt" value={prompt} onChange={e => onPromptChange(e.target.value)} rows={4}
                    className="w-full p-2 bg-black/5 dark:bg-black/20 text-[var(--foreground)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition placeholder:text-slate-600 dark:placeholder:text-slate-400"
                    placeholder={placeholder} disabled={disabled} />
                 <button onClick={onTranslate} className="absolute bottom-2 right-2 px-2 py-1 text-xs bg-[var(--background)]/80 dark:bg-[var(--card)]/80 backdrop-blur-sm text-[var(--foreground)] opacity-90 rounded-md hover:opacity-100 transition-all">Traduzir PT-EN</button>
                {isEditingFlow && (
                    <>
                        <button 
                            onClick={handleAddImageClick}
                            title="Adicionar imagem de referência"
                            aria-label="Adicionar imagem de referência"
                            className="absolute top-2 right-2 p-1.5 bg-[var(--background)]/80 dark:bg-[var(--card)]/80 backdrop-blur-sm text-[var(--foreground)] rounded-full hover:opacity-100 transition-all"
                            disabled={disabled}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={disabled}
                        />
                    </>
                )}
            </div>
            {contextImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {contextImages.map((image, index) => (
                        <div key={index} className="relative w-16 h-16">
                            <img src={image.dataUrl} alt={`Contexto ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                            <button
                                onClick={() => removeContextImage(index)}
                                className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                aria-label={`Remover imagem de contexto ${index + 1}`}
                                disabled={disabled}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [output, setOutput] = useState<Output | null>(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [isPromptHelperOpen, setIsPromptHelperOpen] = useState(false);
  const [isMaskEditorOpen, setIsMaskEditorOpen] = useState(false);
  const [isInspoModalOpen, setIsInspoModalOpen] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') return 'dark';
    return 'light';
  });

  const [videoPromptGeneratedFor, setVideoPromptGeneratedFor] = useState<string | null>(null);
  
  const pollingRef = useRef<boolean>(false);
  const { isReady } = useAuth();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);
  
  const { mode, prompt, videoPrompt, negativePrompt, productImages, sceneImage, aspectRatio, productSize, contextImages } = appState;

  // Auto-generate video prompt effect
  useEffect(() => {
    const image = productImages[0];
    const handleAutoVideoPrompt = async (img: ImageFile) => {
      if (!img) return;
      setIsAnalyzing(true);
      setLoadingMessage('Diretor Criativo de IA está analisando sua imagem...');
      try {
        const generatedPrompt = await gemini.generateVideoPromptFromImage(img);
        updateState('videoPrompt', generatedPrompt);
        setVideoPromptGeneratedFor(img.dataUrl);
        addToast("Prompt de vídeo gerado com IA!", "success");
      } catch (error) {
        console.error("Video prompt generation failed:", error);
        addToast(`Falha ao gerar o prompt de vídeo: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsAnalyzing(false);
        setLoadingMessage('');
      }
    };
    
    if (
      mode === 'video' &&
      image &&
      !videoPrompt && // Only generate if prompt is empty
      videoPromptGeneratedFor !== image.dataUrl // And not already generated for this specific image
    ) {
      handleAutoVideoPrompt(image);
    }
  }, [mode, productImages, videoPrompt, videoPromptGeneratedFor]);


  const addToast = useCallback((message: string, type: 'success' | 'error' = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const isProductPlacementMode = mode === 'image' && productImages.length > 0;

  const updateState = <K extends keyof AppState,>(key: K, value: AppState[K]) => {
    setAppState(prev => ({...prev, [key]: value}));
  };
  
  const handleClearAll = useCallback(() => {
    setAppState(initialState);
    setOutput(null);
    setIsLoading(false);
    setIsAdvancedMode(false);
    setLoadingMessage('');
    setVideoPromptGeneratedFor(null);
    pollingRef.current = false;
  }, []);

  const handleUseOutputAsProduct = useCallback((imageFile: ImageFile) => {
    setAppState(prev => ({
        ...prev,
        mode: 'image',
        productImages: [imageFile],
        sceneImage: null, // Clear scene when using a new product
        prompt: '',
        videoPrompt: '',
        contextImages: [], // Clear context images for the new iteration
    }));
    setVideoPromptGeneratedFor(null);
    setIsAdvancedMode(false);
    setOutput(null);
  }, []);

  const handleTranslate = async (text: string, field: 'prompt' | 'videoPrompt' | 'negativePrompt') => {
    if (!text.trim()) return;
    try {
        const translated = await gemini.translateText(text);
        updateState(field, translated);
    } catch (e) {
        console.error(e);
        addToast('A tradução falhou.');
    }
  };
  
  const handleAnalyzeAndPrompt = async () => {
    if (productImages.length === 0 || !sceneImage) return;

    setIsAnalyzing(true);
    updateState('prompt', ''); // Clear existing prompt
    try {
        const generatedPrompt = await gemini.generateProductPlacementPrompt(productImages, sceneImage, productSize);
        updateState('prompt', generatedPrompt);
    } catch (error) {
        console.error("Prompt generation failed:", error);
        addToast(`Falha ao gerar o prompt: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSelectInspo = async (dataUrl: string) => {
    setIsInspoModalOpen(false);
    // Directly use the dataUrl provided by the new InspoModal
    const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
    const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
    const imageFile: ImageFile = { base64, mimeType, dataUrl };
    updateState('sceneImage', imageFile);
  };

  const handleGenerate = async (promptOverride?: string) => {
    const currentPrompt = promptOverride ?? (mode === 'image' ? prompt : videoPrompt);

    if (!currentPrompt.trim() && productImages.length === 0) {
        addToast("Por favor, forneça um prompt ou uma imagem de produto.");
        return;
    }
    
    setIsLoading(true);
    setOutput(null);
    pollingRef.current = true;
    
    const currentAppState = { ...appState, prompt: mode === 'image' ? currentPrompt : prompt };
    let resultOutput: Output | null = null;

    try {
      if (mode === 'image') {
        setLoadingMessage(isProductPlacementMode ? 'Inserindo produto...' : 'Criando imagem...');
        
        let imageBase64: string | undefined;
        let outputText: string | undefined;

        if (isProductPlacementMode) {
            const response = await gemini.editImage(currentPrompt, productImages, sceneImage, contextImages, aspectRatio, negativePrompt);
            const imagePart = response.candidates?.[0].content.parts.find(p => p.inlineData);
            const textPart = response.candidates?.[0].content.parts.find(p => p.text);
            imageBase64 = imagePart?.inlineData?.data;
            outputText = textPart?.text;
        } else {
            const response = await gemini.generateImage(currentPrompt, negativePrompt, aspectRatio);
            imageBase64 = response.generatedImages?.[0]?.image?.imageBytes;
        }

        if (imageBase64) {
            resultOutput = { type: 'image', src: `data:image/png;base64,${imageBase64}`, text: outputText };
        } else {
            throw new Error('Nenhum dado de imagem recebido da API.');
        }

      } else { // Video mode
        setLoadingMessage(VIDEO_LOADING_MESSAGES[0]);
        let operation = await gemini.generateVideo(currentPrompt, productImages[0] || null);
        
        let msgIndex = 1;
        while (pollingRef.current && !operation.done) {
            setLoadingMessage(VIDEO_LOADING_MESSAGES[msgIndex % VIDEO_LOADING_MESSAGES.length]);
            msgIndex++;
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await gemini.pollVideoStatus(operation);
        }
        
        if (pollingRef.current && operation.done) {
            const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (uri) {
                setLoadingMessage("Buscando dados do vídeo...");
                const videoResponse = await fetch(`${uri}&key=${process.env.API_KEY}`);
                const videoBlob = await videoResponse.blob();
                
                const videoDataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (typeof reader.result === 'string') {
                            resolve(reader.result);
                        } else {
                            reject(new Error('Falha ao ler o blob como Data URL.'));
                        }
                    };
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(videoBlob);
                });

                resultOutput = { type: 'video', src: videoDataUrl };
            } else {
                throw new Error("A geração de vídeo terminou, mas nenhuma URI foi retornada.");
            }
        }
      }

      if (resultOutput) {
          setOutput(resultOutput);
          const newCreation: Omit<Creation, 'id'> = {
              ...currentAppState,
              output: resultOutput,
              createdAt: new Date().toISOString(),
          };
          try {
            await db.addCreation(newCreation);
            addToast("Criação salva na galeria!", "success");
          } catch(dbError) {
            console.error("DB Save failed:", dbError);
            addToast("Falha ao salvar na galeria. A criação não será permanente.");
          }
      }

    } catch (error) {
        console.error("Generation failed:", error);
        addToast(`Ocorreu um erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
        pollingRef.current = false;
    }
  };
  
  const handleMakeVariations = async () => {
    if (isLoading || isAnalyzing || productImages.length === 0) {
      if (productImages.length === 0) {
        addToast("É necessária uma imagem de produto para criar variações.");
      }
      return;
    }
  
    setIsLoading(true);
    setLoadingMessage("IA está pensando em uma nova variação...");
    setOutput(null);
  
    try {
      const newPrompt = await gemini.generateVariationPrompt(productImages, sceneImage);
      updateState('prompt', newPrompt);
      // handleGenerate will take over the loading state and messages
      await handleGenerate(newPrompt);
    } catch (error) {
      console.error("Variation creation failed:", error);
      addToast(`Falha ao criar variação: ${error instanceof Error ? error.message : String(error)}`);
      // Ensure loading state is reset on prompt generation failure
      setIsLoading(false);
      setLoadingMessage('');
    }
  };


  const handleReloadCreation = (creation: Creation) => {
    const { output, createdAt, id, ...restOfState } = creation;
    
    // Handle backward compatibility for old creations
    const reloadedPrompt = creation.prompt || '';
    const reloadedVideoPrompt = creation.videoPrompt || (creation.mode === 'video' ? reloadedPrompt : '');
    const reloadedImagePrompt = creation.mode === 'image' ? reloadedPrompt : '';
    
    if (!restOfState.productImages) {
        if ((creation as any).productImage) {
            restOfState.productImages = [(creation as any).productImage];
        } else if ((creation as any).baseImage) {
            restOfState.productImages = [(creation as any).baseImage];
        } else {
            restOfState.productImages = [];
        }
    }
    
    if (!restOfState.contextImages) restOfState.contextImages = [];
    if (!restOfState.productSize) restOfState.productSize = 'Same Size';

    const finalState = {
        ...initialState,
        ...restOfState,
        prompt: reloadedImagePrompt,
        videoPrompt: reloadedVideoPrompt,
        sceneImage: (creation as any).sceneImage || (creation as any).blendImage || null,
    };
    
    setAppState(finalState as AppState);
    setOutput(output);
    setIsAdvancedMode(finalState.productImages.length > 1);
    setVideoPromptGeneratedFor(null);
  };
  
  const actionButtonText = mode === 'video' ? 'Gerar Vídeo' : 'Gerar';
  
  const appendToCurrentPrompt = (text: string) => {
    if (mode === 'image') {
        updateState('prompt', prompt ? `${prompt}, ${text}`: text);
    } else {
        updateState('videoPrompt', videoPrompt ? `${videoPrompt}, ${text}`: text);
    }
  };

  const renderContent = () => {
    const sceneUploader = (isAdvanced: boolean) => (
      <div className={!isAdvanced ? "flex flex-col" : ""}>
        <div className="flex justify-between items-center mb-2 h-7">
            <label className="block text-sm font-medium text-[var(--foreground)]">
                {isAdvanced ? "Imagem do Cenário" : "Cenário"}
            </label>
            <button
                onClick={() => setIsInspoModalOpen(true)}
                disabled={isLoading || isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-zinc-500/10 text-[var(--primary)] rounded-full hover:bg-zinc-500/20 transition-colors"
            >
                <InspoIcon className="w-4 h-4" />
                Inspo
            </button>
        </div>
        <ImageUploader
            id="sceneImage"
            label=""
            imageFile={sceneImage}
            onImageChange={(f) => {
                if (f && sceneImage && f.dataUrl !== sceneImage.dataUrl) {
                    f.maskDisplayUrl = undefined;
                    f.maskApiBase64 = undefined;
                }
                updateState('sceneImage', f)
            }}
            disabled={isLoading || isAnalyzing}
            onEdit={() => setIsMaskEditorOpen(true)}
            maskDataUrl={sceneImage?.maskDisplayUrl}
            stretch={!isAdvanced}
        />
      </div>
    );


    return (
      <>
        <Header onGalleryOpen={() => setIsGalleryOpen(true)} theme={theme} onThemeToggle={toggleTheme} />
        <main className="flex flex-col md:flex-row gap-8 p-6 lg:p-8">
          <div className="w-full md:w-2/5 lg:w-1/3 xl:w-1/4 flex-shrink-0">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6 sticky top-28">
              <ModeToggle mode={mode} onModeChange={(m) => updateState('mode', m)} disabled={isLoading || isAnalyzing} />
              
              {/* Uploader Section Start */}
              {mode === 'image' ? (
                isAdvancedMode ? (
                  <>
                    <div>
                      <MultiImageUploader
                        label="Imagens do Produto (Múltiplos Ângulos)"
                        imageFiles={productImages}
                        onImageChange={(files) => updateState('productImages', files)}
                        disabled={isLoading || isAnalyzing}
                      />
                      <button
                        onClick={() => setIsAdvancedMode(false)}
                        className="w-full text-center mt-2 p-2 bg-black/5 dark:bg-black/20 rounded-lg text-sm text-[var(--primary)] font-semibold hover:bg-black/10 dark:hover:bg-black/30 transition-colors disabled:opacity-50"
                        disabled={isLoading || isAnalyzing}
                      >
                        Modo Simples: Usar uma imagem
                      </button>
                    </div>
                    {sceneUploader(true)}
                  </>
                ) : (
                  // Simple Image Mode
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-2 h-7">
                            <label className="block text-sm font-medium text-[var(--foreground)]">Produto</label>
                        </div>
                        <ImageUploader
                            id="productImage"
                            label=""
                            imageFile={productImages[0] || null}
                            onImageChange={(f) => updateState('productImages', f ? [f] : [])}
                            disabled={isLoading || isAnalyzing}
                        />
                        <button
                            onClick={() => setIsAdvancedMode(true)}
                            className="w-full text-center mt-2 p-2 bg-black/5 dark:bg-black/20 rounded-lg text-sm text-[var(--primary)] font-semibold hover:bg-black/10 dark:hover:bg-black/30 transition-colors disabled:opacity-50"
                            disabled={isLoading || isAnalyzing}
                        >
                            Modo Avançado: Múltiplos ângulos
                        </button>
                    </div>
                    {sceneUploader(false)}
                  </div>
                )
              ) : (
                // Video Mode
                <ImageUploader
                  id="productImage"
                  label="Imagem Base (opcional)"
                  imageFile={productImages[0] || null}
                  onImageChange={(f) => updateState('productImages', f ? [f] : [])}
                  disabled={isLoading || isAnalyzing}
                />
              )}
              {/* Uploader Section End */}

              {mode === 'image' && productImages.length > 0 && sceneImage && (
                <ProductSizeSelector value={productSize} onChange={(s) => updateState('productSize', s)} disabled={isLoading || isAnalyzing} />
              )}

              {mode === 'image' && productImages.length > 0 && sceneImage && (
                  <button onClick={handleAnalyzeAndPrompt} disabled={isAnalyzing || isLoading} className="w-full px-4 py-2 bg-[var(--secondary)] text-white dark:text-[var(--foreground)] font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity">
                      {isAnalyzing ? <SpinnerIcon /> : <SparklesIcon className="w-5 h-5" />}
                      {isAnalyzing ? 'Analisando...' : 'Analisar e Criar Prompt'}
                  </button>
              )}
              
              <PromptInput
                  prompt={mode === 'image' ? prompt : videoPrompt}
                  onPromptChange={mode === 'image' ? (p => updateState('prompt', p)) : (p => updateState('videoPrompt', p))}
                  contextImages={contextImages}
                  onContextImagesChange={f => updateState('contextImages', f)}
                  onTranslate={() => handleTranslate(mode === 'image' ? prompt : videoPrompt, mode === 'image' ? 'prompt' : 'videoPrompt')}
                  onExpand={() => setIsPromptEditorOpen(true)}
                  onTips={() => setIsPromptHelperOpen(true)}
                  onMakeVariations={handleMakeVariations}
                  showVariationsButton={mode === 'image' && productImages.length > 0}
                  isEditingFlow={mode === 'image' && productImages.length > 0}
                  disabled={isLoading || isAnalyzing}
                  placeholder={
                    isAnalyzing && mode === 'video' 
                    ? 'Diretor Criativo de IA está gerando um prompt...' 
                    : isProductPlacementMode 
                    ? 'Prompt gerado pela IA ou sua edição aparecerá aqui...' 
                    : 'Uma cidade futurista ao pôr do sol...'
                  }
              />

              {mode === 'image' && !sceneImage && (
                <div className="relative">
                    <label htmlFor="negativePrompt" className="block text-sm font-medium text-[var(--foreground)] mb-2">Prompt Negativo (opcional)</label>
                    <textarea id="negativePrompt" value={negativePrompt} onChange={e => updateState('negativePrompt', e.target.value)} rows={2}
                        className="w-full p-2 bg-black/5 dark:bg-black/20 text-[var(--foreground)] border border-[var(--border)] rounded-md placeholder:text-slate-600 dark:placeholder:text-slate-400"
                        placeholder="embaçado, texto, marca d'água..." disabled={isLoading || isAnalyzing} />
                    <button onClick={() => handleTranslate(negativePrompt, 'negativePrompt')} className="absolute bottom-2 right-2 px-2 py-1 text-xs bg-[var(--background)]/80 dark:bg-[var(--card)]/80 backdrop-blur-sm text-[var(--foreground)] opacity-90 rounded-md hover:opacity-100 transition-all">Traduzir PT-EN</button>
                </div>
              )}

              {mode === 'image' && !sceneImage && (
                  <AspectRatioSelector value={aspectRatio} onChange={(r) => updateState('aspectRatio', r)} disabled={isLoading || isAnalyzing} />
              )}

              <div className="flex gap-4 pt-2">
                <button onClick={() => handleGenerate()} disabled={isLoading || isAnalyzing} className="w-full px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity shadow-lg shadow-[var(--primary)]/20">
                  {isLoading && <SpinnerIcon />}
                  {isLoading ? 'Gerando...' : actionButtonText}
                </button>
                <button onClick={handleClearAll} disabled={isLoading || isAnalyzing} className="px-4 py-3 bg-black/10 dark:bg-white/10 font-bold rounded-md hover:bg-black/20 dark:hover:bg-white/20 disabled:opacity-50 transition-colors">Limpar</button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-3/5 lg:w-2/3 xl:w-3/4 h-[80vh]">
            <MediaDisplay 
              isLoading={isLoading || isAnalyzing} 
              loadingMessage={loadingMessage || (isAnalyzing ? 'Analisando imagens...' : '')} 
              output={output} 
              onUseOutputAsProduct={handleUseOutputAsProduct} 
              addToast={addToast}
            />
          </div>
        </main>
      </>
    );
  };
  
  if (!isReady) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[var(--background)]">
        <SpinnerIcon className="w-12 h-12 text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen text-[var(--foreground)] font-sans transition-colors duration-300">
        {renderContent()}
      </div>

      {/* Toast Container */}
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <div key={toast.id} className="max-w-sm w-full bg-[var(--card)]/80 backdrop-blur-md shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border border-[var(--border)]">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {toast.type === 'success' ? (
                      <CheckIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <ExclamationIcon className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {toast.message}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                      className="inline-flex text-[var(--foreground)] opacity-70 hover:opacity-100"
                    >
                      <span className="sr-only">Fechar</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onReload={handleReloadCreation} />
      <PromptEditorModal 
        isOpen={isPromptEditorOpen} 
        onClose={() => setIsPromptEditorOpen(false)} 
        initialPrompt={mode === 'image' ? prompt : videoPrompt} 
        onSave={mode === 'image' ? (p) => updateState('prompt', p) : (p) => updateState('videoPrompt', p)} 
      />
      <PromptHelperModal 
        isOpen={isPromptHelperOpen} 
        onClose={() => setIsPromptHelperOpen(false)} 
        onAppendToPrompt={appendToCurrentPrompt}
        onAppendToNegativePrompt={(text) => updateState('negativePrompt', negativePrompt ? `${negativePrompt}, ${text}`: text)}
      />
      <MaskEditorModal
        isOpen={isMaskEditorOpen && !!sceneImage}
        onClose={() => setIsMaskEditorOpen(false)}
        imageFile={sceneImage}
        onSave={({ displayUrl, apiBase64 }) => {
          if (sceneImage) {
            updateState('sceneImage', { ...sceneImage, maskDisplayUrl: displayUrl, maskApiBase64: apiBase64 });
          }
          setIsMaskEditorOpen(false);
        }}
      />
      <InspoModal
        isOpen={isInspoModalOpen}
        onClose={() => setIsInspoModalOpen(false)}
        onSelect={handleSelectInspo}
      />
    </>
  );
};

export default App;
