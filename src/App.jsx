import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/AppLayout';
import TourGuide from '@/components/TourGuide';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';
import WorldMap from '@/pages/WorldMap';
import { lazy, Suspense } from 'react';
const GameWorld = lazy(() => import('@/game/GameWorld'));
const Farm3D = lazy(() => import('@/game/Farm3D'));
import Dashboard from '@/pages/Dashboard';
import Activities from '@/pages/Activities';
import PlayActivity from '@/pages/PlayActivity';
import MyReport from '@/pages/MyReport';
import Medals from '@/pages/Medals';
import Groups from '@/pages/Groups';
import ActivityManager from '@/pages/ActivityManager';
import Attendance from '@/pages/Attendance';
import Reports from '@/pages/Reports';
import Teachers from '@/pages/Teachers';
import Classes from '@/pages/Classes';
import CharacterCreation from '@/pages/CharacterCreation';
import GameMap from '@/pages/GameMap';
import Farm from '@/pages/Farm';
import FarmShop from '@/pages/FarmShop';
import FarmMissions from '@/pages/FarmMissions';
import FarmRanking from '@/pages/FarmRanking';
import FarmAdmin from '@/pages/FarmAdmin';
import Curriculum from '@/pages/Curriculum';
import Profile from '@/pages/Profile';
import PainelUsuario from '@/pages/PainelUsuario';
import Users from '@/pages/Users';
import Mural from '@/pages/Mural';
import Acesso from '@/pages/Acesso';
import RequireRole from '@/components/RequireRole';
import InstallBanner from '@/components/InstallBanner';

import React, { useState, useEffect } from 'react';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding needed (students only, first time)
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'aluno') return;
    const gameRoutes = ['/World3D', '/Farm3D', '/GameMap'];
    if (gameRoutes.some((r) => location.pathname.startsWith(r))) return;
    try {
      if (!localStorage.getItem('iara_onboarding_done')) {
        setShowOnboarding(true);
      }
    } catch (e) { /* ignore */ }
  }, [isAuthenticated, user, location.pathname]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // If not authenticated, redirect to login (except on /acesso)
  if (!isAuthenticated && !location.pathname.startsWith('/acesso')) {
    return <Navigate to="/acesso" replace />;
  }

  // Render the main app
  return (
    <>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      <Routes>
        <Route path="/" element={<AppLayout currentPageName="Home">
          {user?.role === 'aluno' ? <WorldMap /> : <Home />}
        </AppLayout>} />
        <Route path="/acesso" element={<Acesso />} />
        <Route path="/WorldMap" element={<AppLayout currentPageName="WorldMap"><WorldMap /></AppLayout>} />
        <Route path="/painel-usuario" element={<AppLayout currentPageName="painel-usuario"><PainelUsuario /></AppLayout>} />
      <Route path="/Dashboard" element={<AppLayout currentPageName="Dashboard"><RequireRole level="admin"><Dashboard /></RequireRole></AppLayout>} />
      <Route path="/Activities" element={<AppLayout currentPageName="Activities"><Activities /></AppLayout>} />
      <Route path="/PlayActivity" element={<AppLayout currentPageName="PlayActivity"><PlayActivity /></AppLayout>} />
      <Route path="/MyReport" element={<AppLayout currentPageName="MyReport"><MyReport /></AppLayout>} />
      <Route path="/Medals" element={<AppLayout currentPageName="Medals"><Medals /></AppLayout>} />
      <Route path="/Groups" element={<AppLayout currentPageName="Groups"><Groups /></AppLayout>} />
      <Route path="/ActivityManager" element={<AppLayout currentPageName="ActivityManager"><RequireRole level="admin"><ActivityManager /></RequireRole></AppLayout>} />
      <Route path="/Attendance" element={<AppLayout currentPageName="Attendance"><RequireRole level="admin"><Attendance /></RequireRole></AppLayout>} />
      <Route path="/Reports" element={<AppLayout currentPageName="Reports"><RequireRole level="admin"><Reports /></RequireRole></AppLayout>} />
      <Route path="/Teachers" element={<AppLayout currentPageName="Teachers"><RequireRole level="admin"><Teachers /></RequireRole></AppLayout>} />
      <Route path="/Classes" element={<AppLayout currentPageName="Classes"><RequireRole level="admin"><Classes /></RequireRole></AppLayout>} />
      <Route path="/Users" element={<AppLayout currentPageName="Users"><RequireRole level="admin"><Users /></RequireRole></AppLayout>} />
      <Route path="/Mural" element={<AppLayout currentPageName="Mural"><Mural /></AppLayout>} />
      <Route path="/CharacterCreation" element={<AppLayout currentPageName="CharacterCreation"><CharacterCreation /></AppLayout>} />
      <Route path="/GameMap" element={<AppLayout currentPageName="GameMap"><GameMap /></AppLayout>} />
      <Route path="/Farm" element={<AppLayout currentPageName="Farm"><Farm /></AppLayout>} />
      <Route path="/FarmShop" element={<AppLayout currentPageName="FarmShop"><FarmShop /></AppLayout>} />
      <Route path="/FarmMissions" element={<AppLayout currentPageName="FarmMissions"><FarmMissions /></AppLayout>} />
      <Route path="/FarmRanking" element={<AppLayout currentPageName="FarmRanking"><FarmRanking /></AppLayout>} />
      <Route path="/FarmAdmin" element={<AppLayout currentPageName="FarmAdmin"><FarmAdmin /></AppLayout>} />
      <Route path="/Curriculum" element={<AppLayout currentPageName="Curriculum"><Curriculum /></AppLayout>} />
<Route path="/Profile" element={<AppLayout currentPageName="Profile"><Profile /></AppLayout>} />
        <Route path="/World3D" element={
          <Suspense fallback={<div className="fixed inset-0 z-[100] bg-gradient-to-b from-blue-400 to-green-400 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">🏫</div><p className="text-white font-bold">Carregando mundo 3D...</p></div></div>}>
            <GameWorld onClose={() => navigate('/')} />
          </Suspense>
        } />
        <Route path="/Farm3D" element={
          <Suspense fallback={<div className="fixed inset-0 z-[100] bg-gradient-to-b from-sky-400 to-green-400 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">🌾</div><p className="text-white font-bold">Carregando Fazendinha 3D...</p></div></div>}>
            <Farm3D onClose={() => navigate('/Farm')} onOpenClassic={() => navigate('/Farm')} />
          </Suspense>
        } />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
          <TourGuide />
        </Router>
        <Toaster />
        <VisualEditAgent />
        <InstallBanner />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
