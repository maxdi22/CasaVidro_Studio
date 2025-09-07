import React, { useState } from 'react';
import { Modal } from './Modal';
import { PROMPT_HELPER_CONTENT } from '../../constants';
import { PromptHelperContent } from '../../types';
import { buildPrompt } from '../../services/geminiService';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface PromptHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppendToPrompt: (text: string) => void;
  onAppendToNegativePrompt: (text: string) => void;
}

type Tab = 'guide' | 'editing' | 'builder' | 'styles' | 'negative';

const LanguageToggle: React.FC<{ language: string; onLanguageChange: (lang: string) => void; }> = ({ language, onLanguageChange }) => (
    <div className="flex bg-slate-300/50 dark:bg-slate-800/50 rounded-lg p-1">
        <button onClick={() => onLanguageChange('en')} className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'}`}>EN</button>
        <button onClick={() => onLanguageChange('pt-br')} className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'pt-br' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'}`}>PT-BR</button>
    </div>
);

const KeywordButton: React.FC<{ name: string; value: string; onClick: (value: string) => void; }> = ({ name, value, onClick }) => (
    <button onClick={() => onClick(value)} className="px-3 py-1.5 bg-slate-300/50 dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 rounded-md hover:bg-indigo-500 hover:text-white transition-colors text-left">
        {name}
    </button>
);

const PromptBuilder: React.FC<{ content: PromptHelperContent['promptBuilder']; onAppendToPrompt: (text: string) => void }> = ({ content, onAppendToPrompt }) => {
    const [type, setType] = useState('');
    const [subject, setSubject] = useState('');
    const [style, setStyle] = useState('');
    const [details, setDetails] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!subject) {
            alert('Por favor, forneça um assunto.');
            return;
        }
        setIsLoading(true);
        setGeneratedPrompt('');
        try {
            const result = await buildPrompt(type, subject, style, details);
            setGeneratedPrompt(result);
        } catch (error) {
            console.error(error);
            alert('Falha ao gerar o prompt.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "w-full p-2 bg-slate-300/50 dark:bg-slate-800/50 rounded-md border border-slate-400/50 dark:border-slate-600/50 placeholder:text-slate-600 dark:placeholder:text-slate-400";

    return (
        <div className="space-y-4">
            <input type="text" placeholder={content.type} value={type} onChange={e => setType(e.target.value)} className={inputClasses} />
            <input type="text" placeholder={content.subject} value={subject} onChange={e => setSubject(e.target.value)} className={inputClasses} />
            <input type="text" placeholder={content.style} value={style} onChange={e => setStyle(e.target.value)} className={inputClasses} />
            <input type="text" placeholder={content.details} value={details} onChange={e => setDetails(e.target.value)} className={inputClasses} />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center gap-2">
                {isLoading && <SpinnerIcon className="w-4 h-4"/>}
                {content.generateButton}
            </button>
            {generatedPrompt && (
                <div>
                    <h4 className="font-semibold mb-2">{content.yourPrompt}</h4>
                    <div className="p-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-md cursor-pointer hover:bg-slate-300/70 dark:hover:bg-slate-700/70" onClick={() => onAppendToPrompt(generatedPrompt)}>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{generatedPrompt}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


export const PromptHelperModal: React.FC<PromptHelperModalProps> = ({ isOpen, onClose, onAppendToPrompt, onAppendToNegativePrompt }) => {
  const [activeTab, setActiveTab] = useState<Tab>('guide');
  const [language, setLanguage] = useState<'en' | 'pt-br'>('pt-br');
  const content = PROMPT_HELPER_CONTENT[language];

  const renderTabContent = () => {
    switch (activeTab) {
        case 'guide':
            return (
                <div className="space-y-4 text-slate-800 dark:text-slate-300">
                    <p>{content.promptGuide.content}</p>
                    <div className="p-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-md">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-200">{content.promptGuide.example.title}</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">{content.promptGuide.example.prompt}</p>
                    </div>
                </div>
            );
        case 'editing':
            return (
                <div className="space-y-4 text-slate-800 dark:text-slate-300">
                    <p>{content.editingGuide.content}</p>
                    {content.editingGuide.examples.map((ex, i) => (
                        <div key={i} className="p-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-md">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-200">{ex.title}</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">{ex.prompt}</p>
                        </div>
                    ))}
                </div>
            );
        case 'builder':
            return <PromptBuilder content={content.promptBuilder} onAppendToPrompt={onAppendToPrompt} />
        case 'styles':
            return (
                <div className="space-y-6">
                    {content.stylesKeywords.categories.map(cat => (
                        <div key={cat.name}>
                            <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-200">{cat.name}</h4>
                            <div className="flex flex-wrap gap-2">
                                {cat.keywords.map(kw => <KeywordButton key={kw.value} name={kw.name} value={kw.value} onClick={onAppendToPrompt} />)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        case 'negative':
            return (
                <div className="space-y-4 text-slate-800 dark:text-slate-300">
                    <p>{content.negativePrompts.content}</p>
                    <div className="flex flex-wrap gap-2">
                        {content.negativePrompts.keywords.map(kw => (
                            <button key={kw} onClick={() => onAppendToNegativePrompt(kw)} className="px-3 py-1.5 bg-slate-300/50 dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 rounded-md hover:bg-indigo-500 hover:text-white transition-colors">
                                {kw}
                            </button>
                        ))}
                    </div>
                </div>
            );
        default: return null;
    }
  };
  
  const TabButton: React.FC<{tabId: Tab; title: string}> = ({ tabId, title }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2
        ${activeTab === tabId ? 'border-indigo-500 text-indigo-500 dark:text-indigo-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500'}`}
    >
      {title}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={content.title} size="3xl">
      <div className="flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-900/10 dark:border-white/10 mb-4">
            <div className="flex space-x-1">
                <TabButton tabId="guide" title={content.promptGuide.title} />
                <TabButton tabId="editing" title={content.editingGuide.title} />
                <TabButton tabId="builder" title={content.promptBuilder.title} />
                <TabButton tabId="styles" title={content.stylesKeywords.title} />
                <TabButton tabId="negative" title={content.negativePrompts.title} />
            </div>
            <LanguageToggle language={language} onLanguageChange={setLanguage as (lang: string) => void} />
        </div>
        <div>
            {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
};