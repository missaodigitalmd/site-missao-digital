import { useEffect } from 'react';
import { Navbar, Footer, WhatsAppButton } from '@/components/layout';
import { RouterProvider, useRouter } from '@/router';
import {
  HeroSection,
  CampoSection,
  MissaoSection,
  ProjetosSection,
  ImersaoSection,
  TestemunhosSection,
  RecursosSection,
  ApoieSection,
  CTAFinalSection,
} from '@/sections';
import {
  QuemSomosPage,
  ProjetosPage,
  DaoDPage,
  GankPage,
  NinivePage,
  CampeonatoPage,
  ImersaoPage,
  RecursosPage,
  ApoiePage,
  ContatoPage,
  AdminPage,
} from '@/pages';

function HomePage() {
  return (
    <>
      <HeroSection />
      <CampoSection />
      <MissaoSection />
      <ProjetosSection />
      <ImersaoSection />
      <TestemunhosSection />
      <RecursosSection />
      <ApoieSection />
      <CTAFinalSection />
    </>
  );
}

function AppContent() {
  const { currentRoute, navigate } = useRouter();

  // Deep link: navega para a rota correta na carga inicial
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modal = params.get('modal');
    const recurso = params.get('recurso');

    if (modal && ['orar', 'parceria', 'cooperar', 'oferta'].includes(modal)) {
      navigate('apoie');
    } else if (recurso) {
      navigate('recursos');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const renderPage = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'quem-somos':
        return <QuemSomosPage />;
      case 'projetos':
        return <ProjetosPage />;
      case 'projetos/daod':
        return <DaoDPage />;
      case 'projetos/gank':
        return <GankPage />;
      case 'projetos/ninive-digital':
        return <NinivePage />;
      case 'projetos/campeonatos-evangelisticos':
        return <CampeonatoPage />;
      case 'imersao-missionaria':
        return <ImersaoPage />;

      case 'recursos':
        return <RecursosPage />;
      case 'apoie':
        return <ApoiePage />;
      case 'contato':
        return <ContatoPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  const isAdmin = currentRoute === 'admin';

  return (
    <div className="min-h-screen bg-surface-primary">
      {!isAdmin && <Navbar transparent={currentRoute === 'home'} />}
      <main>
        {renderPage()}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}

export default App;
