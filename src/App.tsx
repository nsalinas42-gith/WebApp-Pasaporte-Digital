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
  CheckCircle2,
  LogOut,
  Image
} from 'lucide-react';
import { Location, UserProfile, UserStats, LeaderboardEntry } from './types';
import { INITIAL_LOCATIONS, INITIAL_USER, LEADERBOARD_DATA } from './data';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ExplorationView from './components/ExplorationView';
import StampsView from './components/StampsView';
import PostalesDigitalesView from './components/PostalesDigitalesView';
import LeaderboardView from './components/LeaderboardView';
import SettingsView from './components/SettingsView';
import LandingView from './components/LandingView';
import AdminHiddenView from './components/AdminHiddenView';
import TermsOfServiceView from './components/TermsOfServiceView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import ProyectoView from './components/ProyectoView';
import { useLanguage } from './translations';
import LanguageSelector from './components/LanguageSelector';
import logoPintaMapas from './assets/images/Logo Pinta Mapas2.png';
import { calculateUserProgress } from './components/GamificationEngine';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  logoutFirebase, 
  saveUserProfileAndProgress, 
  getUserProfileAndProgress 
} from './utils/firebase';
import { resolveAvatar } from './utils/avatars';


export default function App() {
  const { t, translateLocation, translateUser, language } = useLanguage();

  // Profile submenu dropdown show/hide state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleDocumentClick = () => {
      setIsProfileMenuOpen(false);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Landing and Onboarding State
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    return localStorage.getItem('passport_landing_entered') !== 'true';
  });

  // Terms of Service Page state
  const [showTerms, setShowTerms] = useState<boolean>(false);

  // Privacy Policy Page state
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);

  // Proyecto Page state
  const [showProyecto, setShowProyecto] = useState<boolean>(false);

  // Simple client-side routing effect for clean URLs (/terminos, /privacidad, and /proyecto)
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/terminos' || path === '/terminos/' || hash === '#/terminos' || hash === '#terminos') {
        setShowTerms(true);
        setShowPrivacy(false);
        setShowProyecto(false);
      } else if (path === '/privacidad' || path === '/privacidad/' || hash === '#/privacidad' || hash === '#privacidad') {
        setShowPrivacy(true);
        setShowTerms(false);
        setShowProyecto(false);
      } else if (path === '/proyecto' || path === '/proyecto/' || hash === '#/proyecto' || hash === '#proyecto') {
        setShowProyecto(true);
        setShowTerms(false);
        setShowPrivacy(false);
      } else {
        setShowTerms(false);
        setShowPrivacy(false);
        setShowProyecto(false);
      }
    };

    // Check routing on load
    handleUrlRouting();

    // Listen to history popstate changes
    window.addEventListener('popstate', handleUrlRouting);
    return () => {
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, []);

  const handleShowTerms = () => {
    window.history.pushState(null, '', '/terminos');
    setShowTerms(true);
    setShowPrivacy(false);
    setShowProyecto(false);
  };

  const handleShowPrivacy = () => {
    window.history.pushState(null, '', '/privacidad');
    setShowPrivacy(true);
    setShowTerms(false);
    setShowProyecto(false);
  };

  const handleShowProyecto = () => {
    window.history.pushState(null, '', '/proyecto');
    setShowProyecto(true);
    setShowTerms(false);
    setShowPrivacy(false);
  };

  const handleCloseTermsOrPrivacy = () => {
    window.history.pushState(null, '', '/');
    setShowTerms(false);
    setShowPrivacy(false);
    setShowProyecto(false);
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Selected Route state for sub-navigation in Exploration menu
  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => {
    return localStorage.getItem('passport_selected_route_id') || 'alhambra';
  });

  useEffect(() => {
    localStorage.setItem('passport_selected_route_id', selectedRouteId);
  }, [selectedRouteId]);

  // Administrator multi-select individual locked routes state list
  const [lockedRouteIds, setLockedRouteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('passport_locked_route_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Backward compatibility or default state: routes 3,4,5,6 locked initially
    const legacyRoutesLocked = localStorage.getItem('passport_routes_locked');
    if (legacyRoutesLocked === 'false') {
      return [];
    }
    return ['acueducto_segovia', 'alcazar_sevilla', 'sagrada_familia', 'castillo_olite'];
  });

  useEffect(() => {
    localStorage.setItem('passport_locked_route_ids', JSON.stringify(lockedRouteIds));
    localStorage.setItem('passport_routes_locked', String(lockedRouteIds.length > 0));
  }, [lockedRouteIds]);

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

  // If currently active route gets locked, revert to first available unlocked route
  useEffect(() => {
    if (lockedRouteIds.includes(selectedRouteId)) {
      const firstUnlocked = locations.find(loc => !lockedRouteIds.includes(loc.id))?.id || 'alhambra';
      setSelectedRouteId(firstUnlocked);
    }
  }, [lockedRouteIds, selectedRouteId, locations]);

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('passport_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.avatarUrl && parsed.avatarUrl.includes('unsplash.com')) {
          parsed.avatarUrl = INITIAL_USER.avatarUrl;
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_USER;
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

  // Synchronize dynamic XP and level stats whenever locations are checked/unchecked
  useEffect(() => {
    const { totalXP, level, xpToNextLevel } = calculateUserProgress(locations);
    setUser(prev => {
      if (prev.xp === totalXP && prev.level === level) {
        return prev;
      }
      return {
        ...prev,
        xp: totalXP,
        level: level,
        xpToNextLevel: xpToNextLevel
      };
    });
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

  // Synchronize User Session State with Firebase Auth when active, and set up state
  const [firebaseUid, setFirebaseUid] = useState<string | null>(() => {
    return localStorage.getItem('passport_firebase_uid');
  });

  // Synchronize Firebase Auth state on boot and perform automatic restoration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUid(firebaseUser.uid);
        localStorage.setItem('passport_firebase_uid', firebaseUser.uid);
        
        // Auto-restore progress from Firestore if available
        try {
          const cloudData = await getUserProfileAndProgress(firebaseUser.uid);
          if (cloudData) {
            setUser(cloudData.profile);
            setStats(cloudData.stats);
            setLocations(cloudData.locations);
          }
        } catch (err) {
          console.error("Failed to restore progress from cloud:", err);
        }
      } else {
        setFirebaseUid(null);
        localStorage.removeItem('passport_firebase_uid');
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync session automatically inside in-wallet dApp browsers on mobile via secure link sync parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const syncUid = urlParams.get('sync_uid');
    if (syncUid) {
      // Remove sync_uid from the URL without triggering a reload so it remains clean
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);

      console.log("[MÓVIL] Intentando restaurar sesión sincronizada para:", syncUid);
      
      const performMobileSessionSync = async () => {
        try {
          if (syncUid.includes('@')) {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('./utils/firebase');
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', syncUid.trim()));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const userDoc = snap.docs[0];
              const uid = userDoc.id;
              const cloudData = await getUserProfileAndProgress(uid);
              if (cloudData) {
                setUser(cloudData.profile);
                setStats(cloudData.stats);
                setLocations(cloudData.locations);
                setFirebaseUid(uid);
                localStorage.setItem('passport_firebase_uid', uid);
                localStorage.setItem('passport_user', JSON.stringify(cloudData.profile));
                setShowLanding(false);
                localStorage.setItem('passport_landing_entered', 'true');
                console.log("[MÓVIL] Sincronización exitosa por Correo:");
              }
            }
          } else {
            const cloudData = await getUserProfileAndProgress(syncUid);
            if (cloudData) {
              setUser(cloudData.profile);
              setStats(cloudData.stats);
              setLocations(cloudData.locations);
              setFirebaseUid(syncUid);
              localStorage.setItem('passport_firebase_uid', syncUid);
              localStorage.setItem('passport_user', JSON.stringify(cloudData.profile));
              setShowLanding(false);
              localStorage.setItem('passport_landing_entered', 'true');
              console.log("[MÓVIL] Sincronización exitosa por UID:");
            }
          }
        } catch (err) {
          console.error("[MÓVIL] Error en la sincronización de sesión móvil:", err);
        }
      };
      performMobileSessionSync();
    }
  }, []);

  // Sync state changes to cloud for verified users (Debounced)
  const userEmail = user.email;
  const userName = user.name;
  const userAvatarUrl = user.avatarUrl;
  const userTitle = user.title;
  const userLevel = user.level;
  const userXp = user.xp;
  const userXpToNextLevel = user.xpToNextLevel;
  const userLinkedWallet = user.linkedWallet;
  const userJoinedDate = user.joinedDate;
  const statsSerialized = JSON.stringify(stats);
  const locationsSerialized = JSON.stringify(locations);

  useEffect(() => {
    if (firebaseUid && userEmail && userEmail !== 'felix.voyager@gmail.com') {
      const timeout = setTimeout(() => {
        saveUserProfileAndProgress(
          firebaseUid,
          {
            name: userName,
            email: userEmail,
            avatarUrl: userAvatarUrl,
            title: userTitle,
            level: userLevel,
            xp: userXp,
            xpToNextLevel: userXpToNextLevel,
            joinedDate: userJoinedDate,
            linkedWallet: userLinkedWallet,
          },
          JSON.parse(statsSerialized),
          JSON.parse(locationsSerialized)
        ).catch(err => console.error("Database sync failed:", err));
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [
    firebaseUid,
    userEmail,
    userName,
    userAvatarUrl,
    userTitle,
    userLevel,
    userXp,
    userXpToNextLevel,
    userLinkedWallet,
    userJoinedDate,
    statsSerialized,
    locationsSerialized
  ]);

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

    // 2. Mark place as checked in
    const updatedLocations = locations.map(loc => {
      if (loc.id === locationId) {
        const updatedPlaces = (loc.places || []).map(p => {
          if (p.id === placeId) {
            return { ...p, isCheckedIn: true };
          }
          return p;
        });

        // A route is fully completed when all 8 places are checked in
        const completedCount = updatedPlaces.filter(p => p.isCheckedIn).length;
        const isRouteFullyCompleted = completedCount === 8;

        return { 
          ...loc, 
          places: updatedPlaces,
          isCheckedIn: isRouteFullyCompleted
        };
      }
      return loc;
    });

    // Calculate level up triggers dynamically
    const previousCompletedCount = locations.reduce((sum, l) => sum + (l.places?.filter(p => p.isCheckedIn).length || 0), 0);
    const newCompletedCount = updatedLocations.reduce((sum, l) => sum + (l.places?.filter(p => p.isCheckedIn).length || 0), 0);
    
    const previousXP = previousCompletedCount * 500;
    const currentXP = newCompletedCount * 500;
    
    const oldLevel = Math.floor(previousXP / 2000) + 1;
    const currentLvl = Math.floor(currentXP / 2000) + 1;

    setLocations(updatedLocations);

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
    if (currentLvl > oldLevel) {
      setLeveledUpTo(currentLvl);
      setShowLevelUp(true);
    }
  };

  // Reset/Clear Geolocation check-in for a specific place within a route
  const handleResetPlaceCheckIn = (locationId: string, placeId: string) => {
    const targetLoc = locations.find(loc => loc.id === locationId);
    if (!targetLoc) return;

    const place = targetLoc.places?.find(p => p.id === placeId);
    if (!place || !place.isCheckedIn) return; // Already unchecked

    const updatedLocations = locations.map(loc => {
      if (loc.id === locationId) {
        const updatedPlaces = (loc.places || []).map(p => {
          if (p.id === placeId) {
            return { ...p, isCheckedIn: false };
          }
          return p;
        });

        const completedCount = updatedPlaces.filter(p => p.isCheckedIn).length;
        const isRouteFullyCompleted = completedCount === 8;

        return { 
          ...loc, 
          places: updatedPlaces,
          isCheckedIn: isRouteFullyCompleted
        };
      }
      return loc;
    });
    setLocations(updatedLocations);

    // Check if the entire route was completed before, and decrement regionsVisited
    const wasAlreadyCompleted = targetLoc.isCheckedIn;
    if (wasAlreadyCompleted) {
      setStats(prev => ({
        ...prev,
        regionsVisited: Math.max(0, prev.regionsVisited - 1)
      }));
    }
  };

  // Simulate crossmint Solana cNFT claim flow
  const handleClaimSolanacNFT = () => {
    const { completedRoutesCount } = calculateUserProgress(locations);
    if (isNFTClaimed || completedRoutesCount < 6) return;

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
    // Firebase Auth session signout
    logoutFirebase().catch(e => console.error("Firebase logout error:", e));
    setFirebaseUid(null);
    localStorage.removeItem('passport_firebase_uid');

    // Clear authentication and user data from storage
    localStorage.removeItem('passport_landing_entered');
    localStorage.removeItem('passport_user');

    // 3. Reset state back to a clean guest profile structure 
    setUser({
      name: '',
      title: 'Invitado',
      email: '',
      avatarUrl: '',
      level: 1,
      xp: 0,
      xpToNextLevel: 2000,
      joinedDate: 'Miembro desde: Reciente',
      linkedWallet: ''
    });

    setShowLanding(true);
  };

  const handleAuthSuccess = async (email: string, name: string) => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) {
        throw new Error("No authenticated Firebase user found.");
      }
      
      const updatedUser: UserProfile = {
        name: name || fbUser.displayName || email.split('@')[0],
        email: fbUser.email || email,
        avatarUrl: fbUser.photoURL || user.avatarUrl || '',
        title: user.title || 'Explorador',
        level: user.level,
        xp: user.xp,
        xpToNextLevel: user.xpToNextLevel,
        joinedDate: user.joinedDate || 'Miembro desde: Reciente',
        linkedWallet: user.linkedWallet || '',
      };
      
      // 2. See if there is existing progress in the cloud
      const cloudData = await getUserProfileAndProgress(fbUser.uid);
      if (cloudData) {
        // Merge name/avatar if updated, or restore completely
        setUser({
          ...cloudData.profile,
          name: updatedUser.name,
          avatarUrl: updatedUser.avatarUrl || cloudData.profile.avatarUrl,
        });
        setStats(cloudData.stats);
        setLocations(cloudData.locations);
      } else {
        // First-time user profile registration: establish initial database entries
        setUser(updatedUser);
        await saveUserProfileAndProgress(fbUser.uid, updatedUser, stats, locations);
      }

      setFirebaseUid(fbUser.uid);
      localStorage.setItem('passport_firebase_uid', fbUser.uid);
      localStorage.setItem('passport_user', JSON.stringify(updatedUser));
      
      // Smoothly transition off landing page and enter dashboard
      setShowLanding(false);
      localStorage.setItem('passport_landing_entered', 'true');
    } catch (e) {
      console.error("Auth sync error, falling back to local localstorage session:", e);
      // Fallback local login
      const updatedUser: UserProfile = {
        ...user,
        name: name || user.name,
        email: email || user.email,
        avatarUrl: user.avatarUrl || '',
      };
      setUser(updatedUser);
      localStorage.setItem('passport_user', JSON.stringify(updatedUser));
      setShowLanding(false);
      localStorage.setItem('passport_landing_entered', 'true');
    }
  };

  // Calculate generic unlocked count
  const unlockedCount = locations.filter(loc => loc.isCheckedIn).length;
  const totalCount = locations.length;

  if (activeTab === 'admin_hidden') {
    return (
      <AdminHiddenView 
        locations={locations}
        user={translatedUser}
        lockedRouteIds={lockedRouteIds}
        setLockedRouteIds={setLockedRouteIds}
        onResetToMockupState={handleResetToMockupState}
        onResetToZeroState={handleResetToZeroState}
        onToggleLocationCheckIn={handleToggleLocationCheckIn}
        onClose={() => {
          setShowLanding(true);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  if (showTerms) {
    return (
      <TermsOfServiceView onClose={handleCloseTermsOrPrivacy} />
    );
  }

  if (showPrivacy) {
    return (
      <PrivacyPolicyView onClose={handleCloseTermsOrPrivacy} />
    );
  }

  if (showProyecto) {
    return (
      <ProyectoView onClose={handleCloseTermsOrPrivacy} />
    );
  }

  if (showLanding) {
    return (
      <LandingView 
        user={translatedUser}
        locations={locations}
        lockedRouteIds={lockedRouteIds}
        setLockedRouteIds={setLockedRouteIds}
        onResetToMockupState={handleResetToMockupState}
        onResetToZeroState={handleResetToZeroState}
        onAuthSuccess={handleAuthSuccess}
        onEnterHiddenAdminPage={() => {
          setShowLanding(false);
          setActiveTab('admin_hidden');
        }}
        onEnter={() => {
          setShowLanding(false);
          localStorage.setItem('passport_landing_entered', 'true');
        }} 
        onShowTerms={handleShowTerms}
        onShowPrivacy={handleShowPrivacy}
        onShowProyecto={handleShowProyecto}
      />
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen selection:bg-[#1A56DB] selection:text-[#003732] font-sans pb-20 md:pb-0">
      
      {/* Upper Navigation Header Bar for both Mobile & Desktop */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-3 sm:px-6 md:px-12 h-16 sm:h-20 bg-[#001621]/90 backdrop-blur-xl border-b border-[#005049]/35 shadow-[0_0_20px_rgba(26, 86, 219,0.04)]">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <img 
            src={logoPintaMapas} 
            alt="Pinta Mapas" 
            referrerPolicy="no-referrer"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
          />
        </div>

        {/* Outer navigation shortcuts and profile badge */}
        <div className="flex items-center gap-2 sm:gap-6">
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
            <button
              onClick={() => setActiveTab('postales_digitales')}
              className={`text-sm font-semibold transition-colors focus:outline-none ${
                activeTab === 'postales_digitales' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              {t('postales_digitales')}
            </button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-4 select-none">
            {/* Dynamic XP Pill indicator */}
            <div className="hidden xs:flex items-center gap-1.5 sm:gap-2 bg-[#001e2c] border border-secondary/30 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-secondary text-[10px] sm:text-xs font-bold leading-none shadow-[0_0_15px_rgba(26, 86, 219,0.05)] shrink-0">
               <Trophy className="w-3 h-3 text-secondary fill-secondary/10" />
               <span>{user.xpToNextLevel - user.xp} XP</span>
            </div>

            <LanguageSelector />
            
            {/* Minimal Avatar widget reflecting Level subscript badge with absolute Submenu Dropdown */}
            <div className="relative shrink-0 select-none">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="relative cursor-pointer group shrink-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-secondary/40 overflow-hidden bg-surface-container-high transition-all group-hover:border-[#1A56DB] group-active:scale-95 duration-150 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img 
                      alt="Profile" 
                      src={resolveAvatar(user.avatarUrl)} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-secondary text-xs sm:text-xs font-black font-mono">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'I'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-tertiary text-on-tertiary text-[8px] sm:text-[10px] font-black w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-background shadow-md font-mono">
                  {user.level}
                </div>
              </div>

              {/* Absolute Flying Submenu Dropdown */}
              {isProfileMenuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-3 w-52 bg-[#001019]/95 backdrop-blur-xl border border-[#1A56DB]/45 rounded-2xl shadow-[0_10px_35px_rgba(26, 86, 219,0.25)] py-2.5 z-50 text-left animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <div className="px-4 pb-2.5 pt-1.5 border-b border-[#005049]/20">
                    <p className="text-xs font-black text-on-surface truncate tracking-wide">{user.name}</p>
                    <p className="text-[10px] text-secondary font-mono truncate">{user.email || 'explorador@pintamapas.ve'}</p>
                  </div>
                  
                  <div className="p-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-extrabold text-on-surface hover:text-[#1A56DB] hover:bg-[#1A56DB]/10 transition-colors flex items-center gap-2.5 rounded-lg outline-none cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-secondary" style={{ display: 'inline' }} />
                      <span className="ml-2">{t('settings')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-extrabold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-2.5 rounded-lg border-t border-[#005049]/15 mt-1 outline-none cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" style={{ display: 'inline' }} />
                      <span className="ml-2">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
        lockedRouteIds={lockedRouteIds}
      />

      {/* Main Responsive Canvas Content wrapper */}
      <main className="md:ml-64 pt-20 sm:pt-28 px-3 sm:px-6 md:px-12 lg:px-20 pb-24 md:pb-12 overflow-x-hidden">
        
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
            lockedRouteIds={lockedRouteIds}
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
            lockedRouteIds={lockedRouteIds}
          />
        )}

        {activeTab === 'stamps' && (
          <StampsView 
            locations={translatedLocations}
            onExploreLocation={handleSelectAndExploreLocation}
            onToggleCheckIn={handleToggleLocationCheckIn}
          />
        )}

        {activeTab === 'postales_digitales' && (
          <PostalesDigitalesView 
            locations={translatedLocations}
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
            lockedRouteIds={lockedRouteIds}
            setLockedRouteIds={setLockedRouteIds}
            locations={translatedLocations}
          />
        )}

      </main>

      {/* Mobile-Only Bottom App Navigation Dock */}
      <nav id="mobile-navigation-dock" className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-background/90 backdrop-blur-xl md:hidden flex justify-around items-center h-16 z-50 rounded-2xl border border-[#005049]/35 shadow-[0_12px_40px_rgba(0,16,25,0.85)] px-3">
        
        {/* Mobile Tab link Dashboard */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all outline-none ${
            activeTab === 'dashboard' ? 'text-secondary bg-secondary/15 font-bold' : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/5'
          }`}
        >
          <LayoutDashboard className="w-5.5 h-5.5" />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus:scale-100 transition-all bg-[#002e3b] text-[#1A56DB] text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border border-secondary/30 shadow-[0_4px_16px_rgba(26, 86, 219,0.15)] pointer-events-none whitespace-nowrap z-[60] duration-200">
            {t('dashboard')}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#002e3b]"></div>
          </div>
        </button>

        {/* Mobile Tab link Exploration */}
        <button 
          onClick={() => setActiveTab('exploration')}
          className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all outline-none ${
            activeTab === 'exploration' ? 'text-secondary bg-secondary/15 font-bold' : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/5'
          }`}
        >
          <Compass className="w-5.5 h-5.5 animate-spin" style={{ animationDuration: activeTab === 'exploration' ? '12s' : '0s' }} />
          {unlockedCount < totalCount && (
            <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-background">
              {totalCount - unlockedCount}
            </span>
          )}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus:scale-100 transition-all bg-[#002e3b] text-[#1A56DB] text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border border-secondary/30 shadow-[0_4px_16px_rgba(26, 86, 219,0.15)] pointer-events-none whitespace-nowrap z-[60] duration-200">
            {t('exploration')}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#002e3b]"></div>
          </div>
        </button>

        {/* Mobile Tab link Stamps */}
        <button 
          onClick={() => setActiveTab('stamps')}
          className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all outline-none ${
            activeTab === 'stamps' ? 'text-secondary bg-secondary/15 font-bold' : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/5'
          }`}
        >
          <Layers className="w-5.5 h-5.5" />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus:scale-100 transition-all bg-[#002e3b] text-[#1A56DB] text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border border-secondary/30 shadow-[0_4px_16px_rgba(26, 86, 219,0.15)] pointer-events-none whitespace-nowrap z-[60] duration-200">
            {t('my_stamps')}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#002e3b]"></div>
          </div>
        </button>

        {/* Mobile Tab link Postales Digitales */}
        <button 
          onClick={() => setActiveTab('postales_digitales')}
          className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all outline-none ${
            activeTab === 'postales_digitales' ? 'text-secondary bg-secondary/15 font-bold' : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/5'
          }`}
        >
          <Image className="w-5.5 h-5.5" />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus:scale-100 transition-all bg-[#002e3b] text-[#1A56DB] text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border border-secondary/30 shadow-[0_4px_16px_rgba(26, 86, 219,0.15)] pointer-events-none whitespace-nowrap z-[60] duration-200">
            Postales
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#002e3b]"></div>
          </div>
        </button>

        {/* Mobile Tab link Rank */}
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all outline-none ${
            activeTab === 'leaderboard' ? 'text-secondary bg-secondary/15 font-bold' : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/5'
          }`}
        >
          <Trophy className="w-5.5 h-5.5" />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus:scale-100 transition-all bg-[#002e3b] text-[#1A56DB] text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border border-secondary/30 shadow-[0_4px_16px_rgba(26, 86, 219,0.15)] pointer-events-none whitespace-nowrap z-[60] duration-200">
            {t('leaderboard')}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#002e3b]"></div>
          </div>
        </button>

        {/* Mobile Tab link Profile (Settings) */}
        <button 
          onClick={() => setActiveTab('settings')}
          className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all outline-none ${
            activeTab === 'settings' ? 'text-secondary bg-secondary/15 font-bold' : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/5'
          }`}
        >
          <Settings className="w-5.5 h-5.5" />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus:scale-100 transition-all bg-[#002e3b] text-[#1A56DB] text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border border-secondary/30 shadow-[0_4px_16px_rgba(26, 86, 219,0.15)] pointer-events-none whitespace-nowrap z-[60] duration-200">
            {t('settings')}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#002e3b]"></div>
          </div>
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
          <div className="w-full max-w-md bg-gradient-to-tr from-[#002332] to-[#005049]/90 border-2 border-[#1A56DB] p-8 rounded-2xl text-center space-y-6 glow-cyan animate-in zoom-in duration-300">
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 rounded-full blur-xl bg-secondary/35 animate-pulse" />
              <div className="relative w-28 h-28 mx-auto rounded-full bg-[#001621] border-2 border-secondary flex items-center justify-center text-5xl animate-bounce" style={{ animationDuration: '3s' }}>
                💎
              </div>
            </div>

            <div className="space-y-2 text-center text-left">
              <span className="inline-block bg-[#1A56DB]/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full border border-secondary/20 uppercase tracking-widest">
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
            <div className="bg-background/80 p-4 rounded-xl border border-[#1A56DB]/20 text-xs font-mono text-on-surface-variant text-left space-y-1.5 overflow-hidden">
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
          <div className="p-2 bg-[#1A56DB]/10 text-secondary border border-[#1A56DB]/15 rounded-lg shrink-0">
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
