import React, { createContext, useContext, useState, useEffect, ReactNode, FC, useRef } from 'react';
import { UserProfile } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: () => void;
  logout: () => void;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const tokenClientRef = useRef<any>(null);

  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        const response = await fetch('./secrets.json');
        if (!response.ok) {
          throw new Error(`A resposta da rede não foi 'ok': ${response.statusText}`);
        }
        const secrets = await response.json();
        
        if (secrets.GOOGLE_CLIENT_ID && secrets.GOOGLE_CLIENT_ID !== "SEU_ID_DE_CLIENTE_DO_GOOGLE_VAI_AQUI.apps.googleusercontent.com") {
          setGoogleClientId(secrets.GOOGLE_CLIENT_ID);
        } else {
          console.warn("ID de Cliente do Google não encontrado ou é um placeholder em secrets.json. A autenticação será desativada.");
          setIsReady(true);
        }
      } catch (error) {
        console.error("Erro ao buscar ou analisar secrets.json:", error);
        setIsReady(true); // Desbloqueia a UI mesmo se a configuração de autenticação falhar
      }
    };
    fetchSecrets();
  }, []);


  useEffect(() => {
    if (!googleClientId) return;

    const SCOPES = 'https://www.googleapis.com/auth/drive.file';
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    const initializeGsi = () => {
      let attempt = 0;
      const maxAttempts = 5;
      const delay = 200; // ms

      const tryToInitialize = () => {
        if (window.google?.accounts?.oauth2) {
          // Success
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: SCOPES,
            callback: handleTokenResponse,
          });
          setIsReady(true);
        } else {
          // Retry
          attempt++;
          if (attempt < maxAttempts) {
            setTimeout(tryToInitialize, delay * attempt);
          } else {
            // Failure after retries
            console.error(`Falha ao inicializar o GSI após ${maxAttempts} tentativas.`);
            alert("Não foi possível inicializar a autenticação do Google. Por favor, recarregue a página e tente novamente.");
            setIsReady(true); // Unlock UI, login will fail but app is usable
          }
        }
      };
      tryToInitialize();
    };
    
    script.onload = initializeGsi;
    script.onerror = () => {
      console.error("Falha ao carregar o script de autenticação do Google.");
      alert("Falha ao carregar o script de autenticação do Google. Verifique sua conexão e tente recarregar a página.");
      setIsReady(true);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    
  }, [googleClientId]);

  const handleTokenResponse = async (response: any) => {
    if (response.error) {
        console.error('Erro no token do Google:', response.error);
        return;
    }
    setToken(response);
    try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${response.access_token}` },
        });
        if (!userInfoResponse.ok) {
            throw new Error(`Falha ao buscar informações do usuário: ${userInfoResponse.statusText}`);
        }
        const userInfo: UserProfile = await userInfoResponse.json();
        setUser(userInfo);
    } catch (error) {
        console.error('Falha ao obter o perfil do usuário', error);
        setUser(null);
        setToken(null);
    }
  };
  
  const login = () => {
    if (!isReady || !tokenClientRef.current) {
        console.error("O cliente de Autenticação do Google não está pronto.");
        alert("O serviço de login não está pronto. Por favor, verifique se o ID de Cliente do Google está configurado corretamente em secrets.json e tente novamente.");
        return;
    }
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  };

  const logout = () => {
    if (token && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            setUser(null);
            setToken(null);
        });
    } else {
        setUser(null);
        setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};