import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLoginIcon } from './icons/GoogleLoginIcon';
import { LogoIcon } from './icons/LogoIcon';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="bg-[var(--card)]/80 backdrop-blur-lg rounded-2xl p-8 sm:p-12 shadow-2xl border border-[var(--border)]">
        <LogoIcon className="w-20 h-20 mx-auto text-[var(--primary)]" />
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
          Bem-vindo ao Casa Vidro Studio
        </h1>
        <p className="mt-4 max-w-xl text-[var(--foreground)] opacity-90">
          Sua suíte de criação de mídia com IA para o mercado criativo. Faça login para começar a gerar imagens e vídeos incríveis.
        </p>
        <div className="mt-8">
          <button
            onClick={login}
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-white dark:bg-black text-slate-800 dark:text-white text-lg font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors shadow-lg"
          >
            <GoogleLoginIcon className="w-6 h-6" />
            <span>Fazer login com Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};