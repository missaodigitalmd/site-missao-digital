import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

  const isAdmin = currentRoute === 'admin';

  return (
    <div className="min-h-screen bg-surface-primary">
      {!isAdmin && <Navbar transparent={currentRoute === 'home'} />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quem-somos" element={<QuemSomosPage />} />
          <Route path="/projetos" element={<ProjetosPage />} />
          <Route path="/projetos/daod" element={<DaoDPage />} />
          <Route path="/projetos/gank" element={<GankPage />} />
          <Route path="/projetos/ninive-digital" element={<NinivePage />} />
          <Route path="/projetos/campeonatos-evangelisticos" element={<CampeonatoPage />} />
          <Route path="/imersao-missionaria" element={<ImersaoPage />} />
          <Route path="/recursos" element={<RecursosPage />} />
          <Route path="/apoie" element={<ApoiePage />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
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
