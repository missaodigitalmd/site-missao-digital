import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Route =
  | 'home'
  | 'quem-somos'
  | 'projetos'
  | 'projetos/daod'
  | 'projetos/gank'
  | 'projetos/ninive-digital'
  | 'projetos/campeonatos-evangelisticos'
  | 'imersao-missionaria'
  | 'recursos'
  | 'apoie'
  | 'contato'
  | 'imersao-v1'
  | 'imersao-v2'
  | 'imersao-v3'
  | 'admin';

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [, setHistory] = useState<Route[]>(['home']);

  const navigate = useCallback((route: Route) => {
    setCurrentRoute(route);
    setHistory(prev => [...prev, route]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const newHistory = prev.slice(0, -1);
      setCurrentRoute(newHistory[newHistory.length - 1]);
      return newHistory;
    });
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // Simple handling - just go to home for now
      setCurrentRoute('home');
      setHistory(['home']);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ currentRoute, navigate, goBack }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
}

// Link component for navigation
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: Route;
  children: React.ReactNode;
}

export function Link({ to, children, className = '', onClick, ...props }: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to);
    onClick?.(e);
  };

  return (
    <a href={`#${to}`} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
