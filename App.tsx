import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, Output, Creation, Mode, AspectRatio, ImageFile, ProductSize } from './types';
import { ImageUploader } from './components/ImageUploader';
import { MediaDisplay } from './components/MediaDisplay';
import { GalleryModal } from './components/modals/GalleryModal';
import { PromptEditorModal } from './components/modals/PromptEditorModal';
import { PromptHelperModal } from './components/modals/PromptHelperModal';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { LogoIcon } from './components/icons/LogoIcon';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import * as gemini from './services/geminiService';
import * as db from './services/dbService';
import { VIDEO_LOADING_MESSAGES } from './constants';

const initialState: AppState = {
  mode: 'image',
  prompt: '',
  negativePrompt: '',
  productImage: null,
  sceneImage: null,
  aspectRatio: '1:1',
  productSize: 'Same Size',
};

// --- Helper Components defined outside App ---

const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; onToggle: () => void }> = ({ theme, onToggle }) => (
  <button onClick={onToggle} className="p-2 rounded-full text-slate-800 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" aria-label="Toggle theme">
    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
  </button>
);

const Header: React.FC<{ onGalleryOpen: () => void; theme: 'light' | 'dark'; onThemeToggle: () => void; }> = ({ onGalleryOpen, theme, onThemeToggle }) => (
  <header className="flex justify-between items-center p-4 bg-white/30 dark:bg-black/20 backdrop-blur-lg sticky top-0 z-10 border-b border-white/40 dark:border-black/30">
    <div className="flex items-center gap-3">
        <LogoIcon className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 hidden sm:block">Casa Vidro Studio</h1>
    </div>
    <div className="flex items-center gap-2">
        <button onClick={onGalleryOpen} className="px-4 py-2 bg-black/5 dark:bg-white/5 text-slate-800 dark:text-white text-sm font-semibold rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            Minhas Criações
        </button>
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </div>
  </header>
);

const ModeToggle: React.FC<{ mode: Mode; onModeChange: (mode: Mode) => void; disabled: boolean }> = ({ mode, onModeChange, disabled }) => (
    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
        <button
            onClick={() => onModeChange('image')}
            disabled={disabled}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'image' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'} disabled:opacity-50`}
        >Imagem</button>
        <button
            onClick={() => onModeChange('video')}
            disabled={disabled}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'video' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'} disabled:opacity-50`}
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
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">Proporção da Tela</label>
            <div className="grid grid-cols-5 gap-3">
                {ratios.map(r => (
                    <button key={r.ratio} onClick={() => onChange(r.ratio)} disabled={disabled}
                        className={`p-2 rounded-lg transition-all flex flex-col items-center text-center space-y-2 border-2 ${
                            value === r.ratio 
                                ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-lg'
                                : 'bg-black/5 dark:bg-white/10 border-transparent hover:bg-black/10 dark:hover:bg-white/20'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        
                        <div className={`w-full max-w-[36px] ${aspectStyles[r.ratio]} bg-slate-400 dark:bg-slate-500 rounded-sm`}></div>

                        <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">{r.ratio}</span>
                        
                        <div className="flex justify-center items-center gap-1.5 min-h-[16px]">
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
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">Ajuste de Tamanho do Produto</label>
            <div className="flex flex-col sm:flex-row bg-black/5 dark:bg-white/5 rounded-lg p-1">
                {sizes.map(size => (
                    <button
                        key={size.id}
                        onClick={() => onChange(size.id)}
                        disabled={disabled}
                        className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${value === size.id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'} disabled:opacity-50`}
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

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') return 'dark';
    return 'light';
  });
  
  const pollingRef = useRef<boolean>(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const { mode, prompt, negativePrompt, productImage, sceneImage, aspectRatio, productSize } = appState;
  
  const isProductPlacementMode = mode === 'image' && !!productImage;

  const updateState = <K extends keyof AppState,>(key: K, value: AppState[K]) => {
    setAppState(prev => ({...prev, [key]: value}));
  };
  
  const handleClearAll = useCallback(() => {
    setAppState(initialState);
    setOutput(null);
    setIsLoading(false);
    setLoadingMessage('');
    pollingRef.current = false;
  }, []);

  const handleUseOutputAsProduct = useCallback((imageFile: ImageFile) => {
    setAppState(prev => ({
        ...prev,
        mode: 'image',
        productImage: imageFile,
        sceneImage: null, // Clear scene when using a new product
        prompt: '',
    }));
    setOutput(null);
  }, []);

  const handleTranslate = async (text: string, field: 'prompt' | 'negativePrompt') => {
    if (!text.trim()) return;
    try {
        const translated = await gemini.translateText(text);
        updateState(field, translated);
    } catch (e) {
        console.error(e);
        alert('A tradução falhou.');
    }
  };
  
  const handleAnalyzeAndPrompt = async () => {
    if (!productImage || !sceneImage) return;

    setIsAnalyzing(true);
    updateState('prompt', ''); // Clear existing prompt
    try {
        const generatedPrompt = await gemini.generateProductPlacementPrompt(productImage, sceneImage, productSize);
        updateState('prompt', generatedPrompt);
    } catch (error) {
        console.error("Prompt generation failed:", error);
        alert(`Falha ao gerar o prompt: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !productImage) {
        alert("Por favor, forneça um prompt ou uma imagem de produto.");
        return;
    }
    
    setIsLoading(true);
    setOutput(null);
    pollingRef.current = true;
    
    const currentAppState = { ...appState };

    try {
      let resultOutput: Output | null = null;
      if (mode === 'image') {
        setLoadingMessage(isProductPlacementMode ? 'Inserindo produto...' : 'Criando imagem...');
        
        let imageBase64: string | undefined;
        let outputText: string | undefined;

        if (isProductPlacementMode) {
            const response = await gemini.editImage(prompt, productImage!, sceneImage);
            const imagePart = response.candidates?.[0].content.parts.find(p => p.inlineData);
            const textPart = response.candidates?.[0].content.parts.find(p => p.text);
            imageBase64 = imagePart?.inlineData?.data;
            outputText = textPart?.text;
        } else {
            const response = await gemini.generateImage(prompt, negativePrompt, aspectRatio);
            imageBase64 = response.generatedImages?.[0]?.image?.imageBytes;
        }

        if (imageBase64) {
            resultOutput = { type: 'image', src: `data:image/png;base64,${imageBase64}`, text: outputText };
        } else {
            throw new Error('Nenhum dado de imagem recebido da API.');
        }

      } else { // Video mode
        setLoadingMessage(VIDEO_LOADING_MESSAGES[0]);
        let operation = await gemini.generateVideo(prompt, productImage);
        
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
                const videoUrl = URL.createObjectURL(videoBlob);
                resultOutput = { type: 'video', src: videoUrl };
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
          await db.addCreation(newCreation);
      }

    } catch (error) {
        console.error("Generation failed:", error);
        alert(`Ocorreu um erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
        pollingRef.current = false;
    }
  };

  const handleReloadCreation = (creation: Creation) => {
    // Backward compatibility for old creations
    const reloadedState = {
      productSize: 'Same Size', // Default for old creations
      ...creation,
      productImage: (creation as any).productImage || (creation as any).baseImage,
      sceneImage: (creation as any).sceneImage || (creation as any).blendImage,
    };
    const { output, createdAt, id, ...restOfState } = reloadedState;
    setAppState(restOfState as AppState);
    setOutput(output);
  };
  
  const actionButtonText = mode === 'video' ? 'Gerar Vídeo' : 'Gerar';

  return (
    <>
      <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        <Header onGalleryOpen={() => setIsGalleryOpen(true)} theme={theme} onThemeToggle={toggleTheme} />
        <main className="flex flex-col md:flex-row gap-8 p-6 lg:p-8">
          <div className="w-full md:w-2/5 lg:w-1/3 xl:w-1/4 flex-shrink-0">
            <div className="bg-white/30 dark:bg-black/20 backdrop-blur-lg border border-white/40 dark:border-black/30 rounded-2xl p-6 space-y-6 sticky top-28">
              <ModeToggle mode={mode} onModeChange={(m) => updateState('mode', m)} disabled={isLoading || isAnalyzing} />
              
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-800 dark:text-slate-300">Descreva Sua Visão</label>
                    <div className="flex gap-1">
                        <button onClick={() => setIsPromptEditorOpen(true)} className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400 rounded hover:bg-black/10 dark:hover:bg-white/10">Expandir</button>
                        <button onClick={() => setIsPromptHelperOpen(true)} className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400 rounded hover:bg-black/10 dark:hover:bg-white/10">Dicas</button>
                    </div>
                </div>
                <textarea id="prompt" value={prompt} onChange={e => updateState('prompt', e.target.value)} rows={4}
                    className="w-full p-2 bg-black/5 dark:bg-white/5 text-slate-900 dark:text-slate-100 border border-black/10 dark:border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-600 dark:placeholder:text-slate-400"
                    placeholder={isProductPlacementMode ? 'Prompt gerado pela IA aparecerá aqui...' : 'Uma cidade futurista ao pôr do sol...'} disabled={isLoading || isAnalyzing} />
                 <button onClick={() => handleTranslate(prompt, 'prompt')} className="absolute bottom-2 right-2 px-2 py-1 text-xs bg-white/50 dark:bg-black/50 text-slate-700 dark:text-slate-300 rounded-md hover:bg-white dark:hover:bg-black/70">Traduzir PT-EN</button>
              </div>

              {mode === 'image' && !isProductPlacementMode && (
                <div className="relative">
                    <label htmlFor="negativePrompt" className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">Prompt Negativo (opcional)</label>
                    <textarea id="negativePrompt" value={negativePrompt} onChange={e => updateState('negativePrompt', e.target.value)} rows={2}
                        className="w-full p-2 bg-black/5 dark:bg-white/5 text-slate-900 dark:text-slate-100 border border-black/10 dark:border-white/10 rounded-md placeholder:text-slate-600 dark:placeholder:text-slate-400"
                        placeholder="embaçado, texto, marca d'água..." disabled={isLoading || isAnalyzing} />
                    <button onClick={() => handleTranslate(negativePrompt, 'negativePrompt')} className="absolute bottom-2 right-2 px-2 py-1 text-xs bg-white/50 dark:bg-black/50 text-slate-700 dark:text-slate-300 rounded-md hover:bg-white dark:hover:bg-black/70">Traduzir PT-EN</button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader id="productImage" label={mode === 'image' ? 'Imagem do Produto' : 'Imagem Base (opcional)'} imageFile={productImage} onImageChange={(f) => updateState('productImage', f)} disabled={isLoading || isAnalyzing} />
                {mode === 'image' && (
                    <ImageUploader id="sceneImage" label="Imagem do Cenário" imageFile={sceneImage} onImageChange={(f) => updateState('sceneImage', f)} disabled={isLoading || isAnalyzing} />
                )}
              </div>
              
              {mode === 'image' && productImage && sceneImage && (
                <ProductSizeSelector value={productSize} onChange={(s) => updateState('productSize', s)} disabled={isLoading || isAnalyzing} />
              )}

              {mode === 'image' && productImage && sceneImage && (
                  <button onClick={handleAnalyzeAndPrompt} disabled={isAnalyzing || isLoading} className="w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity">
                      {isAnalyzing ? <SpinnerIcon /> : <SparklesIcon className="w-5 h-5" />}
                      {isAnalyzing ? 'Analisando...' : 'Analisar e Criar Prompt'}
                  </button>
              )}
              
              {mode === 'image' && !isProductPlacementMode && (
                  <AspectRatioSelector value={aspectRatio} onChange={(r) => updateState('aspectRatio', r)} disabled={isLoading || isAnalyzing} />
              )}

              <div className="flex gap-4 pt-2">
                <button onClick={handleGenerate} disabled={isLoading || isAnalyzing} className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity shadow-lg shadow-indigo-500/30 dark:shadow-indigo-800/30">
                  {isLoading && <SpinnerIcon />}
                  {isLoading ? 'Gerando...' : actionButtonText}
                </button>
                <button onClick={handleClearAll} disabled={isLoading || isAnalyzing} className="px-4 py-3 bg-black/10 dark:bg-white/10 font-bold rounded-md hover:bg-black/20 dark:hover:bg-white/20 disabled:opacity-50 transition-colors">Limpar</button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-3/5 lg:w-2/3 xl:w-3/4 h-[80vh]">
            <MediaDisplay isLoading={isLoading || isAnalyzing} loadingMessage={loadingMessage || (isAnalyzing ? 'Analisando imagens...' : '')} output={output} onUseOutputAsProduct={handleUseOutputAsProduct} />
          </div>
        </main>
      </div>
      
      <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onReload={handleReloadCreation} />
      <PromptEditorModal isOpen={isPromptEditorOpen} onClose={() => setIsPromptEditorOpen(false)} initialPrompt={prompt} onSave={(p) => updateState('prompt', p)} />
      <PromptHelperModal isOpen={isPromptHelperOpen} onClose={() => setIsPromptHelperOpen(false)} 
        onAppendToPrompt={(text) => updateState('prompt', prompt ? `${prompt}, ${text}`: text)}
        onAppendToNegativePrompt={(text) => updateState('negativePrompt', negativePrompt ? `${negativePrompt}, ${text}`: text)}
      />
    </>
  );
};

export default App;