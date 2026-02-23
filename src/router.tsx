import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink, BrowserRouter } from 'react-router-dom';

export type Route =
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

export function RouterProvider({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {children}
    </BrowserRouter>
  );
}

// Automatically scroll to top on navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export function useRouter(): RouterContextType {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the path from the URL, defaulting to 'home' if we are at '/'
  let currentRoute: string = 'home';
  if (location.pathname && location.pathname !== '/') {
    // Remove leading slash
    currentRoute = location.pathname.substring(1);
  }

  const navigateWrapper = (route: Route) => {
    // Navigate with the existing search params to not break deep links if any
    const search = window.location.search;
    if (route === 'home') {
      navigate('/' + search);
    } else {
      navigate('/' + route + search);
    }
  };

  const goBackWrapper = () => {
    navigate(-1);
  };

  return {
    currentRoute: currentRoute as Route,
    navigate: navigateWrapper,
    goBack: goBackWrapper
  };
}

// Link component for navigation
interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: Route;
  children: React.ReactNode;
}

export function Link({ to, children, className = '', onClick, ...props }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
  };

  const path = to === 'home' ? '/' : `/${to}`;

  return (
    <RouterLink to={path} onClick={handleClick} className={className} {...props}>
      {children}
    </RouterLink>
  );
}
