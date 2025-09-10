import React, { useState, useEffect, useRef } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { GalleryIcon } from './icons/GalleryIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { useAuth } from '../context/AuthContext';
import { GoogleLoginIcon } from './icons/GoogleLoginIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; onToggle: () => void }> = ({ theme, onToggle }) => (
  <button onClick={onToggle} className="p-2 rounded-full text-[var(--foreground)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors" aria-label="Toggle theme">
    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
  </button>
);

export const Header: React.FC<{ onGalleryOpen: () => void; theme: 'light' | 'dark'; onThemeToggle: () => void; }> = ({ onGalleryOpen, theme, onThemeToggle }) => {
    const { isAuthenticated, user, login, logout, isReady } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const authContent = () => {
        if (!isReady) {
            return <SpinnerIcon className="w-5 h-5 text-[var(--foreground)]" />;
        }
        if (isAuthenticated && user) {
            return (
                <div className="relative" ref={profileRef}>
                    <button onClick={() => setIsProfileOpen(prev => !prev)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--background)]">
                        <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50">
                            <div className="p-4 border-b border-[var(--border)]">
                                <p className="font-semibold text-sm text-[var(--foreground)] truncate">{user.name}</p>
                                <p className="text-xs text-[var(--foreground)] opacity-70 truncate">{user.email}</p>
                            </div>
                            <div className="p-2">
                                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[var(--foreground)] opacity-80 hover:bg-black/5 dark:hover:bg-white/5 hover:opacity-100 rounded-md transition-colors">
                                    <LogoutIcon className="w-5 h-5" />
                                    <span>Sair</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return (
            <button 
                onClick={login}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold bg-black/5 dark:bg-white/5 text-[var(--foreground)] rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
                <GoogleLoginIcon className="w-5 h-5" />
                <span>Login</span>
            </button>
        );
    };

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
                <div className="w-px h-6 bg-[var(--border)]" />
                {authContent()}
            </div>
        </header>
    );
};