import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { BottomNav, type Tab } from '@/components/ui/BottomNav';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { OnboardingScreen } from '@/components/screens/OnboardingScreen';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { WardrobeScreen } from '@/components/screens/WardrobeScreen';
import { LooksScreen } from '@/components/screens/LooksScreen';
import { HistoryScreen } from '@/components/screens/HistoryScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { OutfitDetail } from '@/components/screens/OutfitDetail';
import { Spinner } from '@/components/ui/Spinner';
import type { Recommendation } from '@/lib/types';

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [outfitDetail, setOutfitDetail] = useState<Recommendation | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (profile && !profile.onboarding_complete) {
    return <OnboardingScreen />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-ink-50">
      {activeTab === 'home' && (
        <HomeScreen
          onNavigate={(tab) => setActiveTab(tab)}
          onOutfitTap={(rec) => setOutfitDetail(rec)}
        />
      )}
      {activeTab === 'wardrobe' && <WardrobeScreen />}
      {activeTab === 'looks' && (
        <LooksScreen onNavigate={(tab) => setActiveTab(tab)} />
      )}
      {activeTab === 'history' && <HistoryScreen />}
      {activeTab === 'profile' && <ProfileScreen />}

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {outfitDetail && (
        <OutfitDetail
          recommendation={outfitDetail}
          onClose={() => setOutfitDetail(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
