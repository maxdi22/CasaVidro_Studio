
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { GalleryIcon } from './icons/GalleryIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; onToggle: () => void }> = ({ theme, onToggle }) => (
  <button onClick={onToggle} className="p-2 rounded-full text-[var(--foreground)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors" aria-label="Toggle theme">
    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
  </button>
);

export const Header: React.FC<{ onGalleryOpen: () => void; theme: 'light' | 'dark'; onThemeToggle: () => void; }> = ({ onGalleryOpen, theme, onThemeToggle }) => {
    return (
        <header className="flex justify-between items-center p-4 bg-[var(--background)]/80 backdrop-blur-lg sticky top-0 z-40 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
                <LogoIcon className="w-8 h-8 text-[var(--primary)]" />
                <h1 className="text-2xl font-bold text-[var(--foreground)] hidden sm:block">Casa Vidro Studio</h1>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onGalleryOpen} className="p-2 text-[var(--foreground)] rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Minhas Criações">
                    <GalleryIcon className="w-5 h-5" />
                </button>
                <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            </div>
        </header>
    );
};
