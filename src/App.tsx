/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Compass, 
  Layers, 
  Trophy, 
  Settings, 
  LayoutDashboard,
  Wallet,
  Bell,
  Search,
  Sparkles,
  ChevronRight,
  RefreshCw,
  X,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { Location, UserProfile, UserStats, LeaderboardEntry } from './types';
import { INITIAL_LOCATIONS, INITIAL_USER, LEADERBOARD_DATA } from './data';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ExplorationView from './components/ExplorationView';
import StampsView from './components/StampsView';
import LeaderboardView from './components/LeaderboardView';
import SettingsView from './components/SettingsView';
import LandingView from './components/LandingView';
import { useLanguage } from './translations';
import LanguageSelector from './components/LanguageSelector';

export default function App() {
  const { t, translateLocation, translateUser, language } = useLanguage();

  // Landing and Onboarding State
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    return localStorage.getItem('passport_landing_entered') !== 'true';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Selected Route state for sub-navigation in Exploration menu
  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => {
    return localStorage.getItem('passport_selected_route_id') || 'alhambra';
  });

  useEffect(() => {
    localStorage.setItem('passport_selected_route_id', selectedRouteId);
  }, [selectedRouteId]);

  // Administrator lock state for Routes 3, 4, 5, 6
  const [routesLocked, setRoutesLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('passport_routes_locked');
    return saved === 'false' ? false : true; // Locked by default (true)
  });

  useEffect(() => {
    localStorage.setItem('passport_routes_locked', String(routesLocked));
  }, [routesLocked]);

  // If routes are locked and the selected route is a locked one, reset it back to alhambra
  useEffect(() => {
    if (routesLocked && ['acueducto_segovia', 'alcazar_sevilla', 'sagrada_familia', 'castillo_olite'].includes(selectedRouteId)) {
      setSelectedRouteId('alhambra');
    }
  }, [routesLocked, selectedRouteId]);
  
  // App States with LocalStorage Hydration
  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('passport_locations');
    if (!saved) return INITIAL_LOCATIONS;
    try {
      const parsed = JSON.parse(saved) as Location[];
      return parsed.map(loc => {
        const matchingInitial = INITIAL_LOCATIONS.find(initial => initial.id === loc.id);
        const places = loc.places && loc.places.length === 8 ? loc.places : (matchingInitial?.places || []);
        return {
          ...loc,
          places
        };
      });
    } catch (e) {
      return INITIAL_LOCATIONS;
    }
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('passport_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('passport_stats');
    if (saved) return JSON.parse(saved);
    
    // Default initial stats corresponding to 4 completed maps
    return {
      regionsVisited: 3,
      momentsCaptured: 12,
      sharedAchievements: 8
    };
  });

  const [isNFTClaimed, setIsNFTClaimed] = useState<boolean>(() => {
    return localStorage.getItem('passport_nft_claimed') === 'true';
  });

  const [txHash, setTxHash] = useState<string | null>(() => {
    return localStorage.getItem('passport_tx_hash');
  });

  // Action and Simulation states
  const [isLoadingClaim, setIsLoadingClaim] = useState<boolean>(false);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [leveledUpTo, setLeveledUpTo] = useState<number>(12);
  const [showClaimSuccessPopup, setShowClaimSuccessPopup] = useState<boolean>(false);

  // Dynamic on-the-fly translated entities
  const translatedLocations = locations.map(loc => translateLocation(loc));
  const translatedUser = translateUser(user);

  
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [showPhotoNotification, setShowPhotoNotification] = useState<boolean>(false);
  const [showRegionAlert, setShowRegionAlert] = useState<boolean>(false);

  // Sync state to local storage on edits
  useEffect(() => {
    localStorage.setItem('passport_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('passport_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('passport_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('passport_nft_claimed', String(isNFTClaimed));
  }, [isNFTClaimed]);

  useEffect(() => {
    if (txHash) {
      localStorage.setItem('passport_tx_hash', txHash);
    } else {
      localStorage.removeItem('passport_tx_hash');
    }
  }, [txHash]);

  // Handle click on location stamp in dashboard/stamps
  const handleSelectAndExploreLocation = (locationId: string) => {
    setSelectedRouteId(locationId);
    setActiveTab('exploration');
  };

  // Perform a Geolocation site Check-In for a specific place within a route
  const handlePerformCheckIn = (locationId: string, placeId: string) => {
    // 1. Identify location details
    const targetLoc = locations.find(loc => loc.id === locationId);
    if (!targetLoc) return;

    // Find the place
    const place = targetLoc.places?.find(p => p.id === placeId);
    if (!place || place.isCheckedIn) return;

    // Helper to evaluate progressive check-in rule:
    // "para obtener la insignia explorador principiante deberá completar la primera geolocalización de la ficha de ruta, y así sucesivamente..."
    const isRouteInsigniaUnlocked = (locId: string, completedCount: number): boolean => {
      if (locId === 'alhambra') return completedCount >= 1;
      if (locId === 'mezquita_cordoba') return completedCount >= 2;
      if (locId === 'acueducto_segovia') return completedCount >= 3;
      if (locId === 'alcazar_sevilla') return completedCount >= 4;
      if (locId === 'sagrada_familia') return completedCount >= 6;
      if (locId === 'castillo_olite') return completedCount >= 8;
      return completedCount >= 8;
    };

    // 2. Mark place as checked in
    const updatedLocations = locations.map(loc => {
      if (loc.id === locationId) {
        const updatedPlaces = (loc.places || []).map(p => {
          if (p.id === placeId) {
            return { ...p, isCheckedIn: true };
          }
          return p;
        });

        const completedCount = updatedPlaces.filter(p => p.isCheckedIn).length;
        const isBadgeUnlocked = isRouteInsigniaUnlocked(loc.id, completedCount);

        return { 
          ...loc, 
          places: updatedPlaces,
          isCheckedIn: isBadgeUnlocked
        };
      }
      return loc;
    });
    setLocations(updatedLocations);

    // 3. Compute score and XP increase, as well as levels
    const pointsAwarded = place.points || 500;
    let newXp = user.xp + pointsAwarded;
    let currentLvl = user.level;
    let didLevelUp = false;

    if (newXp >= user.xpToNextLevel) {
      newXp = newXp - user.xpToNextLevel;
      currentLvl = currentLvl + 1;
      didLevelUp = true;
    }

    setUser(prev => ({
      ...prev,
      xp: newXp,
      level: currentLvl
    }));

    // Check if the entire route was completed to increment regionsVisited
    const wasAlreadyCompleted = targetLoc.isCheckedIn;
    const isNowCompleted = updatedLocations.find(l => l.id === locationId)?.isCheckedIn || false;

    if (isNowCompleted && !wasAlreadyCompleted) {
      setStats(prev => ({
        ...prev,
        regionsVisited: prev.regionsVisited + 1
      }));
    }

    // Trigger level up animation overlay if state changed
    if (didLevelUp) {
      setLeveledUpTo(currentLvl);
      setShowLevelUp(true);
    }
  };

  // Reset/Clear Geolocation check-in for a specific place within a route
  const handleResetPlaceCheckIn = (locationId: string, placeId: string) => {
    let pointsAwarded = 500;
    const targetLoc = locations.find(loc => loc.id === locationId);
    if (targetLoc) {
       const place = targetLoc.places?.find(p => p.id === placeId);
       if (place) {
        pointsAwarded = place.points || 500;
         if (!place.isCheckedIn) return; // Already unchecked
       }
     }

    const isRouteInsigniaUnlocked = (locId: string, count: number): boolean => {
      if (locId === 'alhambra') return count >= 1;
      if (locId === 'mezquita_cordoba') return count >= 2;
      if (locId === 'acueducto_segovia') return count >= 3;
      if (locId === 'alcazar_sevilla') return count >= 4;
      if (locId === 'sagrada_familia') return count >= 6;
      if (locId === 'castillo_olite') return count >= 8;
      return count >= 8;
    };

    const updatedLocations = locations.map(loc => {
      if (loc.id === locationId) {
        const updatedPlaces = (loc.places || []).map(p => {
          if (p.id === placeId) {
            return { ...p, isCheckedIn: false };
          }
          return p;
        });

        const completedCount = updatedPlaces.filter(p => p.isCheckedIn).length;
        const isBadgeUnlocked = isRouteInsigniaUnlocked(loc.id, completedCount);

        return { 
          ...loc, 
          places: updatedPlaces,
          isCheckedIn: isBadgeUnlocked
        };
      }
      return loc;
    });
    setLocations(updatedLocations);

    // Deduct points since check-in has been cleared
    setUser(prev => {
      let newXp = prev.xp - pointsAwarded;
      let currentLvl = prev.level;
      if (newXp < 0) {
        if (currentLvl > 1) {
          currentLvl = currentLvl - 1;
          newXp = prev.xpToNextLevel + newXp;
        } else {
          newXp = 0;
        }
      }
      return {
        ...prev,
        xp: newXp,
        level: currentLvl
      };
    });

    // Check if the entire route was completed before, and decrement regionsVisited
    const wasAlreadyCompleted = targetLoc?.isCheckedIn;
    if (wasAlreadyCompleted) {
      setStats(prev => ({
        ...prev,
        regionsVisited: Math.max(0, prev.regionsVisited - 1)
      }));
    }
  };

  // Simulate crossmint Solana cNFT claim flow
  const handleClaimSolanacNFT = () => {
    if (isNFTClaimed || locations.filter(loc => loc.isCheckedIn).length < locations.length) return;

    setIsLoadingClaim(true);

    // Simulate 3-step blockchain protocol delay
    setTimeout(() => {
      const generatedHash = '3G14p87Qv8bFMyWkFqJn5UAs67Xm98DghrJt9e5WwXyz' + Math.floor(Math.random() * 1000);
      setTxHash(generatedHash);
      setIsNFTClaimed(true);
      setIsLoadingClaim(false);
      setShowClaimSuccessPopup(true);
    }, 2000);
  };

  // Share action stat count increment
  const handleShareAchievementIncrement = () => {
    setStats(prev => ({
      ...prev,
      sharedAchievements: prev.sharedAchievements + 1
    }));
  };

  // Toggle completion status of a location/badge
  const handleToggleLocationCheckIn = (locationId: string) => {
    const targetLoc = locations.find(loc => loc.id === locationId);
    if (!targetLoc) return;
    const nextStatus = !targetLoc.isCheckedIn;

    const updatedLocations = locations.map(loc => {
      if (loc.id === locationId) {
        const updatedPlaces = (loc.places || []).map(p => ({
          ...p,
          isCheckedIn: nextStatus
        }));
        return {
          ...loc,
          isCheckedIn: nextStatus,
          places: updatedPlaces
        };
      }
      return loc;
    });

    setLocations(updatedLocations);

    // Give some points on manual completion/uncompleting
    const xpDifference = nextStatus ? (targetLoc.points || 400) : -(targetLoc.points || 400);
    let newXp = user.xp + xpDifference;
    let currentLvl = user.level;
    let didLevelUp = false;

    if (newXp >= user.xpToNextLevel) {
      newXp = newXp - user.xpToNextLevel;
      currentLvl = currentLvl + 1;
      didLevelUp = true;
    } else if (newXp < 0) {
      if (currentLvl > 1) {
        currentLvl = currentLvl - 1;
        newXp = user.xpToNextLevel + newXp;
      } else {
        newXp = 0;
      }
    }

    setUser(prev => ({
      ...prev,
      xp: newXp,
      level: currentLvl
    }));

    if (didLevelUp) {
      setLeveledUpTo(currentLvl);
      setShowLevelUp(true);
    }

    setStats(prev => ({
      ...prev,
      regionsVisited: Math.max(0, prev.regionsVisited + (nextStatus ? 1 : -1))
    }));
  };

  // Photo selfie action stat increment
  const handleTriggerSelfiePhoto = () => {
    setStats(prev => ({
      ...prev,
      momentsCaptured: prev.momentsCaptured + 1
    }));
    setShowPhotoNotification(true);
    setTimeout(() => {
      setShowPhotoNotification(false);
    }, 2500);
  };

  // Update Settings from view
  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  // State Resets
  const handleResetToMockupState = () => {
    localStorage.clear();
    // In mockup state, Alhambra, Córdoba, and Segovia are fully checked in/completed
    const mockupLocations = INITIAL_LOCATIONS.map(loc => {
      const isCompletedInMockup = ['alhambra', 'mezquita_cordoba', 'acueducto_segovia'].includes(loc.id);
      return {
        ...loc,
        isCheckedIn: isCompletedInMockup,
        places: (loc.places || []).map(p => ({
          ...p,
          isCheckedIn: isCompletedInMockup
        }))
      };
    });
    setLocations(mockupLocations);
    setUser({
      ...INITIAL_USER,
      level: 4,
      xp: 1200,
      xpToNextLevel: 3000
    });
    setStats({
      regionsVisited: 3,
      momentsCaptured: 12,
      sharedAchievements: 8
    });
    setIsNFTClaimed(false);
    setTxHash(null);
    setActiveTab('dashboard');
    setShowLanding(true);
  };

  const handleResetToZeroState = () => {
    localStorage.clear();
    const zeroLocations = INITIAL_LOCATIONS.map(loc => ({
      ...loc,
      isCheckedIn: false,
      places: (loc.places || []).map(p => ({ ...p, isCheckedIn: false }))
    }));
    setLocations(zeroLocations);
    setUser({
      ...INITIAL_USER,
      level: 1,
      xp: 0,
      xpToNextLevel: 3000
    });
    setStats({
      regionsVisited: 0,
      momentsCaptured: 0,
      sharedAchievements: 0
    });
    setIsNFTClaimed(false);
    setTxHash(null);
    setActiveTab('dashboard');
    setShowLanding(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('passport_landing_entered');
    setShowLanding(true);
  };

  // Calculate generic unlocked count
  const unlockedCount = locations.filter(loc => loc.isCheckedIn).length;
  const totalCount = locations.length;

  if (showLanding) {
    return (
      <LandingView 
        user={translatedUser}
        onEnter={() => {
          setShowLanding(false);
          localStorage.setItem('passport_landing_entered', 'true');
        }} 
      />
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen selection:bg-[#43e5d4] selection:text-[#003732] font-sans pb-20 md:pb-0">
      
      {/* Upper Navigation Header Bar for both Mobile & Desktop */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-20 bg-[#001621]/90 backdrop-blur-xl border-b border-[#005049]/35 shadow-[0_0_20px_rgba(67,229,212,0.04)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/35 glow-mint animate-pulse">
            <span className="text-xl select-none">🧭</span>
          </div>
          <span className="font-headline text-base md:text-lg font-extrabold text-secondary uppercase tracking-wider select-none">
            PASAPORTE DIGITAL PINTA MAPAS
          </span>
        </div>

        {/* Outer navigation shortcuts and profile badge */}
        <div className="flex items-center gap-6">
          {/* Header navigation tabs (Hidden on smaller mobile, visible on tablet+) */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-semibold transition-colors focus:outline-none ${
                activeTab === 'dashboard' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              {t('dashboard')}
            </button>
            <button
              onClick={() => setActiveTab('exploration')}
              className={`text-sm font-semibold transition-colors focus:outline-none ${
                activeTab === 'exploration' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              {t('exploration')}
            </button>
            <button
              onClick={() => setActiveTab('stamps')}
              className={`text-sm font-semibold transition-colors focus:outline-none ${
                activeTab === 'stamps' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              {t('my_stamps')}
            </button>
          </nav>

          <div className="flex items-center gap-4 select-none">
            {/* Dynamic XP Pill indicator */}
            <div className="flex items-center gap-2 bg-[#001e2c] border border-secondary/30 px-4 py-2 rounded-xl text-secondary text-xs font-bold leading-none shadow-[0_0_15px_rgba(67,229,212,0.05)]">
              <Trophy className="w-3.5 h-3.5 text-secondary fill-secondary/10" />
              <span>{user.xpToNextLevel - user.xp} XP</span>
            </div>
            
            {/* Minimal Avatar widget reflecting Level subscript badge */}
            <div 
              onClick={() => setActiveTab('settings')}
              className="relative cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full border border-secondary/40 overflow-hidden bg-surface-container-high transition-all group-hover:border-secondary">
                <img 
                  alt="Profile" 
                  src={user.avatarUrl} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-tertiary text-on-tertiary text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-background shadow-md font-mono">
                {user.level}
              </div>
            </div>

            <LanguageSelector />

            {/* Logout button in header for fast navigation to home */}
            <button
              onClick={handleLogout}
              title={t('cerrar_sesion_title')}
              className="px-3.5 py-2 rounded-xl bg-red-950/15 border border-rose-500/25 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-500/55 transition-all text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.05)] select-none h-10 shrink-0"
            >
              <span>{t('salir_btn')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Persistence Left Sidebar Drawer for monitors (displays & xl screens) */}
      <Sidebar 
        user={translatedUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unlockedCount={unlockedCount}
        totalCount={totalCount}
        onReset={handleResetToMockupState}
        onUnlockNewRegion={() => setShowRegionAlert(true)}
        onLogout={handleLogout}
        locations={translatedLocations}
        selectedRouteId={selectedRouteId}
        onSelectRoute={setSelectedRouteId}
        routesLocked={routesLocked}
      />

      {/* Main Responsive Canvas Content wrapper */}
      <main className="md:ml-64 pt-28 px-4 md:px-20 pb-12 overflow-x-hidden">
        
        {/* Route Render Toggles */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            user={translatedUser}
            locations={translatedLocations}
            stats={stats}
            onExploreLocation={handleSelectAndExploreLocation}
            onClaimNFT={handleClaimSolanacNFT}
            isNFTClaimed={isNFTClaimed}
            isLoadingClaim={isLoadingClaim}
            txHash={txHash}
            onIncrementShare={handleShareAchievementIncrement}
            onTriggerPhoto={handleTriggerSelfiePhoto}
            routesLocked={routesLocked}
          />
        )}

        {activeTab === 'exploration' && (
          <ExplorationView 
            locations={translatedLocations}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
            onCheckIn={handlePerformCheckIn}
            onResetPlaceCheckIn={handleResetPlaceCheckIn}
            user={translatedUser}
            onTriggerPhoto={handleTriggerSelfiePhoto}
            routesLocked={routesLocked}
          />
        )}

        {activeTab === 'stamps' && (
          <StampsView 
            locations={translatedLocations}
            onExploreLocation={handleSelectAndExploreLocation}
            onToggleCheckIn={handleToggleLocationCheckIn}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView 
            entries={LEADERBOARD_DATA}
            user={translatedUser}
            userPoints={locations.filter(l => l.isCheckedIn).reduce((acc, curr) => acc + curr.points, 0)}
            unlockedCount={unlockedCount}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            user={translatedUser}
            onUpdateUser={handleUpdateUserProfile}
            onResetToMockupState={handleResetToMockupState}
            onResetToZeroState={handleResetToZeroState}
            onLogout={handleLogout}
            routesLocked={routesLocked}
            setRoutesLocked={setRoutesLocked}
          />
        )}

      </main>

      {/* Mobile-Only Bottom App Navigation Dock */}
      <nav id="mobile-navigation-dock" className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-xl md:hidden flex justify-around items-center h-20 z-50 border-t border-[#005049]/30">
        
        {/* Mobile Tab link Dashboard */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1.5 transition-all text-xs outline-none ${
            activeTab === 'dashboard' ? 'text-secondary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t('dashboard')}</span>
        </button>

        {/* Mobile Tab link Exploration */}
        <button 
          onClick={() => setActiveTab('exploration')}
          className={`flex flex-col items-center gap-1.5 transition-all text-xs relative outline-none ${
            activeTab === 'exploration' ? 'text-secondary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: activeTab === 'exploration' ? '12s' : '0s' }} />
          <span>{t('exploration')}</span>
          {unlockedCount < totalCount && (
            <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary text-[8px] font-bold px-1.5 py-0.5 rounded-full">
              {totalCount - unlockedCount}
            </span>
          )}
        </button>

        {/* Mobile Tab link Stamps */}
        <button 
          onClick={() => setActiveTab('stamps')}
          className={`flex flex-col items-center gap-1.5 transition-all text-xs outline-none ${
            activeTab === 'stamps' ? 'text-secondary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>{t('my_stamps')}</span>
        </button>

        {/* Mobile Tab link Rank */}
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center gap-1.5 transition-all text-xs outline-none ${
            activeTab === 'leaderboard' ? 'text-secondary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>{t('leaderboard')}</span>
        </button>

        {/* Mobile Tab link Profile (Settings) */}
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1.5 transition-all text-xs outline-none ${
            activeTab === 'settings' ? 'text-secondary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>{t('settings')}</span>
        </button>
      </nav>


      {/* LEVEL UP POP UP OVERLAY SCREEN */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-gradient-to-tr from-surface-container to-surface-container-high border-2 border-tertiary p-8 rounded-2xl text-center space-y-6 glow-tertiary animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-tertiary/15 border-2 border-tertiary flex items-center justify-center text-tertiary text-4xl animate-bounce">
              🏆
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-tertiary font-bold uppercase tracking-widest block">
                ¡LOGRO DESBLOQUEADO!
              </span>
              <h3 className="font-headline text-2xl font-black text-on-surface">
                ¡Subiste de Nivel!
              </h3>
              <p className="text-sm text-on-surface-variant">
                Por tu constante espíritu explorador, has alcanzado la categoría:
              </p>
              <div className="py-2 px-4 bg-tertiary text-on-tertiary font-extrabold text-base rounded-xl max-w-fit mx-auto mt-4 shadow-sm border border-tertiary/30">
                Nivel Explorador {leveledUpTo} 🌟
              </div>
            </div>

            <p className="text-xs text-on-surface-variant/80 italic leading-relaxed">
              "El conocimiento del mundo ensancha la mente y consagra el espíritu del viajero urbano."
            </p>

            <button
              onClick={() => setShowLevelUp(false)}
              className="w-full py-3 bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-bold rounded-xl text-xs uppercase cursor-pointer"
            >
              Aceptar Honor
            </button>
          </div>
        </div>
      )}

      {/* CLAIM NFT SUCCESS CELEBRATION BOX */}
      {showClaimSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md">
          <div className="w-full max-w-md bg-gradient-to-tr from-[#002332] to-[#005049]/90 border-2 border-[#43e5d4] p-8 rounded-2xl text-center space-y-6 glow-cyan animate-in zoom-in duration-300">
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 rounded-full blur-xl bg-secondary/35 animate-pulse" />
              <div className="relative w-28 h-28 mx-auto rounded-full bg-[#001621] border-2 border-secondary flex items-center justify-center text-5xl animate-bounce" style={{ animationDuration: '3s' }}>
                💎
              </div>
            </div>

            <div className="space-y-2 text-center text-left">
              <span className="inline-block bg-[#43e5d4]/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full border border-secondary/20 uppercase tracking-widest">
                Transacción Solana Verificada
              </span>
              <h3 className="font-headline text-2xl font-black text-on-surface">
                ¡cNFT Acuñado con Éxito!
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                La red Solana ha confirmado el bloque. Tu credencial como <strong className="text-secondary">Embajador Supremo</strong> se ha transferido a tu billetera vinculada.
              </p>
            </div>

            {/* Simulated on-chain hash details */}
            <div className="bg-background/80 p-4 rounded-xl border border-[#43e5d4]/20 text-xs font-mono text-on-surface-variant text-left space-y-1.5 overflow-hidden">
              <div className="flex justify-between font-sans font-bold text-[9px] uppercase text-secondary">
                <span>Solana Ledger Receipt</span>
                <span>cNFT (Compressed)</span>
              </div>
              <p className="truncate"><span className="text-secondary">Cuenta:</span> {user.email}</p>
              <p className="truncate"><span className="text-secondary">Wallet:</span> {user.linkedWallet}</p>
              <p className="truncate"><span className="text-secondary">Signature:</span> {txHash}</p>
            </div>

            <button
              onClick={() => setShowClaimSuccessPopup(false)}
              className="w-full py-3.5 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase tracking-wide glow-mint hover:scale-[1.02] transform active:scale-95 transition-all outline-none"
            >
              Completar Ceremonia
            </button>
          </div>
        </div>
      )}

      {/* TOP NOTIFICATION POPUPS FOR GAME ACTIONS */}
      {showPhotoNotification && (
        <div id="selfie-success-alert" className="fixed top-24 right-4 z-[90] bg-surface-container border border-secondary p-4 rounded-xl shadow-lg glow-mint text-left flex items-center gap-3 animate-in fade-in slide-in-from-right duration-250 max-w-xs">
          <div className="p-2 bg-[#43e5d4]/10 text-secondary border border-[#43e5d4]/15 rounded-lg shrink-0">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-on-surface">¡Momento Capturado! 📸</p>
            <p className="text-on-surface-variant mt-0.5">Has guardado un selfie de recuerdo en tu baúl. Sumaste +1 momento!</p>
          </div>
        </div>
      )}

      {showRegionAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-surface-container p-6 rounded-2xl border border-secondary text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 text-xl animate-spin" style={{ animationDuration: '4s' }}>
              🌎
            </div>
            
            <div className="space-y-1">
              <h3 className="font-headline text-lg font-bold text-on-surface">Próximas Regiones</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                ¡Sección Temporal de la Fase 2! Actualmente te encuentras en el mapa <strong className="text-secondary">"Landmarks Cumbres de México"</strong> con 6 ubicaciones. Pronto implementaremos regiones adicionales que incluyen "Pueblos Mágicos de Yucatán" y "Castillos Coloniales de Guanajuato".
              </p>
            </div>

            <button
              onClick={() => setShowRegionAlert(false)}
              className="w-full py-2 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* SVG filter globally used to key out solid white backgrounds from the generated badge PNGs */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="remove-white" colorInterpolationFilters="sRGB">
            <feColorMatrix 
              type="matrix" 
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      -4 -4 -4 12 0" 
              result="keyed"
            />
            <feComponentTransfer>
              <feFuncA type="linear" slope="4" intercept="-2.4" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

    </div>
  );
}
