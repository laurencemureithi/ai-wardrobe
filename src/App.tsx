import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Navigation, type Tab } from '@/components/ui/Navigation';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { OnboardingScreen } from '@/components/screens/OnboardingScreen';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { DigitalTwinScreen } from '@/components/screens/DigitalTwinScreen';
import { WardrobeScreen } from '@/components/screens/WardrobeScreen';
import { StylistScreen } from '@/components/screens/StylistScreen';
import { PlannerScreen } from '@/components/screens/PlannerScreen';
import { InsightsScreen } from '@/components/screens/InsightsScreen';
import { LooksScreen } from '@/components/screens/LooksScreen';
import { HistoryScreen } from '@/components/screens/HistoryScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { OutfitDetail } from '@/components/screens/OutfitDetail';
import { Spinner } from '@/components/ui/Spinner';
import type { Recommendation, ClothingItem } from '@/lib/types';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { analyzeLaundry } from '@/lib/plannerService';

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [outfitDetail, setOutfitDetail] = useState<Recommendation | null>(null);
  const [twinOutfit, setTwinOutfit] = useState<Recommendation | null>(null);
  const [laundryCount, setLaundryCount] = useState<number>(0);

  useEffect(() => {
    fetchClothingItems().then((items) => {
      const diag = analyzeLaundry(items);
      setLaundryCount(diag.itemsNeedingWash.length);
    }).catch(() => {});
  }, [activeTab]);

  const handleTryInDigitalTwin = (rec: Recommendation) => {
    setTwinOutfit(rec);
    setActiveTab('twin');
  };

  const handleTryItemInTwin = (item: ClothingItem) => {
    const slot = item.category === 'tops' ? 'top' : item.category === 'bottoms' ? 'bottom' : item.category === 'shoes' ? 'shoes' : 'outerwear';
    setTwinOutfit({
      items: [{ item, slot }],
      confidence: 0.95,
      reason: `Direct try on of ${item.name}`,
      style: `${item.name} Focus`,
    });
    setActiveTab('twin');
  };

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
    <div className="min-h-screen bg-ink-50 text-ink-950 flex flex-col md:flex-row">
      {/* Responsive Navigation: Desktop Sidebar + Mobile Bottom Bar */}
      <Navigation
        active={activeTab}
        onChange={setActiveTab}
        laundryBadgeCount={laundryCount}
      />

      {/* Main Content Area (offset on desktop by sidebar width) */}
      <main className="flex-1 md:pl-64 min-w-0">
        {activeTab === 'home' && (
          <HomeScreen
            onNavigate={(tab) => setActiveTab(tab)}
            onOutfitTap={(rec) => setOutfitDetail(rec)}
            onTryInDigitalTwin={handleTryInDigitalTwin}
          />
        )}

        {activeTab === 'twin' && (
          <DigitalTwinScreen
            initialOutfit={twinOutfit}
            onNavigateHome={() => setActiveTab('home')}
            onNavigateWardrobe={() => setActiveTab('wardrobe')}
          />
        )}

        {activeTab === 'wardrobe' && (
          <WardrobeScreen
            onTryInTwin={handleTryItemInTwin}
          />
        )}

        {activeTab === 'stylist' && (
          <StylistScreen
            onTryInDigitalTwin={handleTryInDigitalTwin}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'planner' && (
          <PlannerScreen
            onTryInDigitalTwin={handleTryInDigitalTwin}
            onNavigateWardrobe={() => setActiveTab('wardrobe')}
          />
        )}

        {activeTab === 'insights' && <InsightsScreen />}

        {activeTab === 'looks' && (
          <LooksScreen onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'history' && <HistoryScreen />}

        {activeTab === 'profile' && <ProfileScreen />}

        {outfitDetail && (
          <OutfitDetail
            recommendation={outfitDetail}
            onClose={() => setOutfitDetail(null)}
            onTryInTwin={handleTryInDigitalTwin}
          />
        )}
      </main>
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
