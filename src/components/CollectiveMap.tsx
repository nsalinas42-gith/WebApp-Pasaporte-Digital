/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { collection, query, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useLanguage } from '../translations';
import { MapPin, Users, Compass, Navigation, Info, Award, Layers, Eye, RefreshCw, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { Location, UserProfile } from '../types';

// Preset avatar assets (matching UserProfilesCarousel fallback choices)
import avatarHombre1 from '../assets/images/avatar_hombre_1.png';
import avatarHombre2 from '../assets/images/avatar_hombre_2.png';
import avatarJoven1 from '../assets/images/avatar_joven_1.png';
import avatarJoven2 from '../assets/images/avatar_joven_2.png';
import avatarMujer1 from '../assets/images/avatar_mujer_1.png';
import avatarMujer2 from '../assets/images/avatar_mujer_2.png';
import CustomCaracasMapImg from '../assets/images/mapa_pinta_mapas.png';

interface MapUser {
  uid: string;
  name: string;
  pseudonym: string;
  bio: string;
  avatarUrl: string;
  title?: string;
  latitude: number;
  longitude: number;
  isMock?: boolean;
  isLocalActiveUser?: boolean;
}

// Bounding box for mapping coordinates to the physical vector map of Caracas Casco Central
const LAT_MIN = 10.495;
const LAT_MAX = 10.518;
const LNG_MIN = -66.928;
const LNG_MAX = -66.898;

// 6 beautiful mock profiles with exact, beautiful Caracas historical center coordinates
const MOCK_PROFILES_WITH_COORDS: MapUser[] = [
  {
    uid: 'mock-1',
    name: 'Félix Rodríguez',
    pseudonym: '@felix_voyager',
    bio: 'Apasionado por la historia colonial y la fotografía urbana en la gran Caracas.',
    avatarUrl: avatarHombre1,
    title: 'Explorador Supremo',
    latitude: 10.506085,
    longitude: -66.914631, // Plaza Bolívar
    isMock: true
  },
  {
    uid: 'mock-2',
    name: 'Sofía Mendoza',
    pseudonym: '@sofia_avila',
    bio: 'Coleccionista de atardeceres desde el Ávila y entusiasta del arte moderno e histórico.',
    avatarUrl: avatarMujer1,
    title: 'Guía Local Experta',
    latitude: 10.5115,
    longitude: -66.9030, // Foothills of Avila
    isMock: true
  },
  {
    uid: 'mock-3',
    name: 'Mateo Crespo',
    pseudonym: '@mateo_crespo',
    bio: 'Cazador de rutas gastronómicas y senderos históricos. Conectando lo físico y digital.',
    avatarUrl: avatarHombre2,
    title: 'Cazador de Rutas',
    latitude: 10.5020,
    longitude: -66.9180, // El Silencio
    isMock: true
  },
  {
    uid: 'mock-4',
    name: 'Camila Pérez',
    pseudonym: '@camilap_fotos',
    bio: 'Fotógrafa documental de Caracas. Registrando contrastes, fachadas y tesoros del casco central.',
    avatarUrl: avatarMujer2,
    title: 'Exploradora Avanzada',
    latitude: 10.5075,
    longitude: -66.9110, // Santa Altagracia
    isMock: true
  },
  {
    uid: 'mock-5',
    name: 'Elena Rostova',
    pseudonym: '@elena_exp',
    bio: 'Antropóloga urbana. Buscando rastrear memorias y cartografía viva en cada parada.',
    avatarUrl: avatarJoven2,
    title: 'Exploradora de Reinos',
    latitude: 10.4990,
    longitude: -66.9080, // San Agustín / Parque Central
    isMock: true
  },
  {
    uid: 'mock-6',
    name: 'Diego Alarcón',
    pseudonym: '@diego_arq',
    bio: 'Estudiante de arquitectura fascinado por la conservación patrimonial y el urbanismo.',
    avatarUrl: avatarJoven1,
    title: 'Explorador Fluvial',
    latitude: 10.5055,
    longitude: -66.9155, // Santa Teresa
    isMock: true
  }
];

// Helper to get checked-in places for a specific locations list
const getValidatedPlaces = (locs: Location[] | null) => {
  if (!locs) return [];
  const validated: { placeName: string; routeName: string }[] = [];
  locs.forEach(loc => {
    if (loc.places) {
      loc.places.forEach(place => {
        if (place.isCheckedIn) {
          validated.push({
            placeName: place.name,
            routeName: loc.name
          });
        }
      });
    }
  });
  return validated;
};

// Helper to get mock validated places for mock users
const getMockValidatedPlaces = (uid: string) => {
  if (uid === 'mock-1') {
    return [
      { placeName: 'Plaza Bolívar', routeName: 'Casco Histórico' },
      { placeName: 'Catedral de Caracas', routeName: 'Casco Histórico' },
      { placeName: 'Casa Natal del Libertador', routeName: 'Casco Histórico' }
    ];
  }
  if (uid === 'mock-2') {
    return [
      { placeName: 'Panteón Nacional', routeName: 'Ruta del Panteón' },
      { placeName: 'Biblioteca Nacional', routeName: 'Ruta del Panteón' }
    ];
  }
  if (uid === 'mock-3') {
    return [
      { placeName: 'Teatro Teresa Carreño', routeName: 'Circuito Museos' },
      { placeName: 'Museo de Bellas Artes', routeName: 'Circuito Museos' },
      { placeName: 'Parque Los Caobos', routeName: 'Circuito Museos' }
    ];
  }
  if (uid === 'mock-4') {
    return [
      { placeName: 'Iglesia de San Francisco', routeName: 'Casco Histórico' },
      { placeName: 'Palacio de las Academias', routeName: 'Casco Histórico' }
    ];
  }
  if (uid === 'mock-5') {
    return [
      { placeName: 'Museo de Ciencias', routeName: 'Circuito Museos' },
      { placeName: 'Galería de Arte Nacional', routeName: 'Circuito Museos' }
    ];
  }
  return [
    { placeName: 'Capitolio Federal', routeName: 'Casco Histórico' },
    { placeName: 'Plaza Bolívar', routeName: 'Casco Histórico' }
  ];
};

interface CollectiveMapProps {
  activeUser?: UserProfile;
  activeLocations?: Location[];
}

export default function CollectiveMap({ activeUser, activeLocations }: CollectiveMapProps) {
  const { t } = useLanguage();
  const [explorers, setExplorers] = useState<MapUser[]>(MOCK_PROFILES_WITH_COORDS);
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(MOCK_PROFILES_WITH_COORDS[0]); // default to first mock for beautiful preview state
  const [mapMode, setMapMode] = useState<'artistic' | 'google'>('google'); // Defaulting standard Google view directly
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedUserProgress, setSelectedUserProgress] = useState<Location[] | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Merge activeUser into the explorers list dynamically
  const mergedExplorers = React.useMemo(() => {
    let list = [...explorers];
    
    if (activeUser) {
      const activeLat = activeUser.latitude ?? 10.506085;
      const activeLng = activeUser.longitude ?? -66.914631;
      
      const localMapUser: MapUser = {
        uid: 'local-active-user',
        name: activeUser.name || 'Félix Rodríguez',
        pseudonym: '@' + (activeUser.name || 'aventurero').toLowerCase().replace(/\s+/g, '_'),
        bio: activeUser.bio || '¡Explorando nuevos mapas históricos físicos-digitales!',
        avatarUrl: activeUser.avatarUrl || avatarHombre1,
        title: activeUser.title || 'Explorador',
        latitude: activeLat,
        longitude: activeLng,
        isLocalActiveUser: true,
        isMock: false
      };

      // Check if there is an existing user in explorers with the same pseudonym or name
      const existingIndex = list.findIndex(u => u.uid === 'local-active-user' || u.name === localMapUser.name);
      if (existingIndex >= 0) {
        list[existingIndex] = {
          ...list[existingIndex],
          ...localMapUser
        };
      } else {
        // Put the active explorer at the top of the list!
        list.unshift(localMapUser);
      }
    }
    
    return list;
  }, [explorers, activeUser]);

  // Whenever the activeUser coordinates or details update, sync selectedUser if they are the active user
  useEffect(() => {
    if (activeUser) {
      const activeLat = activeUser.latitude ?? 10.506085;
      const activeLng = activeUser.longitude ?? -66.914631;
      
      const updatedActiveUser: MapUser = {
        uid: 'local-active-user',
        name: activeUser.name || 'Félix Rodríguez',
        pseudonym: '@' + (activeUser.name || 'aventurero').toLowerCase().replace(/\s+/g, '_'),
        bio: activeUser.bio || '¡Explorando nuevos mapas históricos físicos-digitales!',
        avatarUrl: activeUser.avatarUrl || avatarHombre1,
        title: activeUser.title || 'Explorador',
        latitude: activeLat,
        longitude: activeLng,
        isLocalActiveUser: true,
        isMock: false
      };

      // If no user is selected, or if the selected user is the active user, set/update selectedUser
      if (!selectedUser || selectedUser.uid === 'local-active-user' || selectedUser.name === activeUser.name) {
        setSelectedUser(updatedActiveUser);
      }
    }
  }, [activeUser?.latitude, activeUser?.longitude, activeUser?.name]);

  // Fetch or subscribe to selectedUser progress validated places
  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserProgress(null);
      return;
    }

    if (selectedUser.uid === 'local-active-user' || selectedUser.name === activeUser?.name) {
      setSelectedUserProgress(activeLocations || null);
      return;
    }

    if (selectedUser.isMock) {
      setSelectedUserProgress(null);
      return;
    }

    // Fetch real user's progress from Firestore
    setIsLoadingProgress(true);
    const progressDocRef = doc(db, 'user_progress', selectedUser.uid);
    getDoc(progressDocRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.locations) {
          try {
            const parsed = JSON.parse(data.locations);
            setSelectedUserProgress(parsed);
          } catch (e) {
            console.error("Error parsing user progress locations:", e);
            setSelectedUserProgress(null);
          }
        } else {
          setSelectedUserProgress(null);
        }
      } else {
        setSelectedUserProgress(null);
      }
      setIsLoadingProgress(false);
    }).catch((err) => {
      console.warn("Failed to fetch selected user progress:", err);
      setSelectedUserProgress(null);
      setIsLoadingProgress(false);
    });
  }, [selectedUser?.uid, activeLocations, activeUser?.name]);

  const filteredExplorers = (mergedExplorers || []).filter((user) => {
    if (!user) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return true;
    const name = (user.name || '').toLowerCase();
    const pseudonym = (user.pseudonym || '').toLowerCase();
    return name.includes(q) || pseudonym.includes(q);
  });
  
  // Local map zoom/navigation states
  const [artisticZoom, setArtisticZoom] = useState(1.1);
  const [artisticPan, setArtisticPan] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Listen to real-time users collection in Firestore
  useEffect(() => {
    const q = query(collection(db, 'users'), limit(500));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let dbUsers: MapUser[] = [];
      if (!querySnapshot.empty) {
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // We only display users on the map who have registered coordinate geolocations
          if (data.latitude != null && data.longitude != null) {
            const name = data.name || 'Viajero Misterioso';
            let pseudo = data.pseudonym || data.title || '';
            if (!pseudo || pseudo.includes(' ')) {
              pseudo = '@' + name.toLowerCase().replace(/\s+/g, '_');
            } else if (!pseudo.startsWith('@')) {
              pseudo = '@' + pseudo;
            }

            dbUsers.push({
              uid: docSnap.id,
              name: name,
              pseudonym: pseudo,
              bio: data.bio || '¡Explorando nuevos mapas históricos físicos-digitales!',
              avatarUrl: data.avatarUrl || avatarJoven1,
              title: data.title || 'Explorador',
              latitude: Number(data.latitude),
              longitude: Number(data.longitude)
            });
          }
        });
      }

      // Mix database users with mock profiles (excluding if a real user has duplicate pseudonym)
      const combined = [...dbUsers];
      MOCK_PROFILES_WITH_COORDS.forEach((mock) => {
        if (!combined.some((u) => u.pseudonym === mock.pseudonym)) {
          combined.push(mock);
        }
      });

      setExplorers(combined);
    }, (err) => {
      console.log('Firebase users query restricted / fallback active for map:', err);
      setExplorers(MOCK_PROFILES_WITH_COORDS);
    });

    return () => unsubscribe();
  }, []);

  const handleFocusUser = (user: MapUser) => {
    setSelectedUser(user);

    if (mapMode === 'artistic') {
      // Pin relative map placement
      const xPercent = ((user.longitude - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
      const yPercent = 100 - ((user.latitude - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
      // Animate/pan vector map to this user's general center area
      setArtisticZoom(1.5);
      setArtisticPan({
        x: (50 - xPercent) * 4,
        y: (50 - yPercent) * 4,
      });
    }
  };

  const getPositionOnArtMap = (lat: number, lng: number) => {
    // Bound input coordinate values to range limits
    const safeLat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
    const safeLng = Math.max(LNG_MIN, Math.min(LNG_MAX, lng));

    const x = ((safeLng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
    const y = 100 - ((safeLat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;

    return { x, y };
  };

  // Helper for drag gestures
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX - artisticPan.x, y: e.clientY - artisticPan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Keep it bounded reasonably
    setArtisticPan({
      x: Math.max(-200, Math.min(200, dx)),
      y: Math.max(-200, Math.min(200, dy))
    });
  };

  const handleMouseUpOrLeave = () => {
    dragStartRef.current = null;
  };

  const resetArtisticMap = () => {
    setArtisticZoom(1.1);
    setArtisticPan({ x: 0, y: 0 });
    setSelectedUser(null);
  };

  // Generate dynamic, billing-free embed URL showcasing real location
  // Changed "t=k" (satellite) to "t=m" (roadmap view) per user requirement
  const currentLat = selectedUser?.latitude || 10.506085;
  const currentLng = selectedUser?.longitude || -66.914631;
  const currentAvatar = selectedUser?.avatarUrl || avatarJoven1;
  const currentName = selectedUser?.name || 'Aventurero';
  const embedUrl = `https://maps.google.com/maps?q=${currentLat},${currentLng}&t=m&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full bg-surface-variant/40 rounded-none overflow-hidden shadow-none backdrop-blur-md p-6 md:p-8" id="collective-map-section">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-primary/10 text-primary border border-primary/20 uppercase mb-2">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            {t('comunidad')}
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-medium text-on-surface tracking-tight">
            {t('mapa_colectivo_titulo')}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-xl">
            {t('mapa_colectivo_desc')}
          </p>
        </div>

        {/* Search dynamic field field replaced successfully */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[240px]">
            <input
              type="text"
              placeholder="Buscar por nombre o seudónimo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/60 border border-[#005049]/30 rounded-xl px-3.5 py-2 pl-9 text-xs text-on-surface placeholder:text-on-surface-variant/65 focus:outline-none focus:border-[#00E676]/60 focus:ring-1 focus:ring-[#00E676]/30 transition-all font-sans"
            />
            <Search className="w-3.5 h-3.5 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs font-bold font-sans p-1"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 border border-[#005049]/30 text-xs font-mono text-on-surface-variant">
            <Users className="w-4 h-4 text-primary animate-pulse" />
            <span>
              {searchQuery ? `${filteredExplorers.length} de ` : ''}
              {mergedExplorers.length} {mergedExplorers.length === 1 ? 'Viajero' : 'Viajeros'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Sidebar list of active explorers */}
        <div className="lg:col-span-1 flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar bg-surface/20 rounded-2xl p-3 border border-[#005049]/30 order-2 lg:order-1">
          <div className="text-xs font-semibold tracking-widest text-primary/80 uppercase px-2 py-1 flex items-center gap-1.5 border-b border-[#005049]/30 pb-2 mb-1 justify-between">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              Exploradores Activos
            </span>
            {mapMode === 'artistic' && (
              <button onClick={resetArtisticMap} title="Reiniciar visualización" className="p-1 hover:bg-surface/60 rounded text-on-surface-variant hover:text-primary transition">
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {filteredExplorers.map((user) => (
              <button
                key={user.uid}
                onClick={() => handleFocusUser(user)}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-left border transition ${
                  selectedUser?.uid === user.uid
                    ? 'bg-primary/15 border-[#00E676] text-on-surface shadow-md'
                    : 'bg-surface/40 hover:bg-surface/80 border-[#005049]/30 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-outline/15 object-cover bg-background"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = avatarJoven1;
                    }}
                  />
                  {user.isMock ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border border-surface flex items-center justify-center text-[8px] text-white" title="Guía Local">
                      ★
                    </span>
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-teal-500 rounded-full border border-surface flex items-center justify-center text-[7px]" title="Miembro Real Dapp">
                      ✓
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-4 truncate">{user.name}</div>
                  <div className="text-xs font-mono text-on-surface-variant truncate mt-0.5">{user.pseudonym}</div>
                  {user.title && (
                    <div className="text-[9px] px-1.5 py-0.5 uppercase tracking-wider bg-outline/10 text-on-surface-variant rounded mt-1.5 inline-block font-sans font-medium">
                      {user.title}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Map Frame representing coordinates perfectly */}
        <div className="lg:col-span-3 h-[450px] rounded-2xl overflow-hidden border border-[#005049]/30 shadow-inner relative bg-slate-950 order-1 lg:order-2">
          {mapMode === 'artistic' ? (
            /* Map canvas using custom base illustrated Caracas Map */
            <div 
              className="w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-1.5 text-[10px] font-mono text-primary select-none pointer-events-none">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                <span>CASCO HISTÓRICO DE CARACAS (MODO ILUSTRADO)</span>
              </div>

              <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5">
                <button 
                  onClick={() => setArtisticZoom(prev => Math.min(3, prev + 0.2))}
                  className="p-2 bg-black/75 hover:bg-black border border-outline/20 rounded-lg text-white hover:text-primary transition shadow-md"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setArtisticZoom(prev => Math.max(1, prev - 0.2))}
                  className="p-2 bg-black/75 hover:bg-black border border-outline/20 rounded-lg text-white hover:text-primary transition shadow-md"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={resetArtisticMap}
                  className="p-2 bg-black/75 hover:bg-black border border-outline/20 rounded-lg text-white hover:text-primary transition shadow-md text-[9px] font-mono"
                >
                  Reajustar
                </button>
              </div>

              {/* Scaled/Panned Container */}
              <div 
                className="absolute inset-0 transition-transform duration-300 ease-out origin-center animate-fade-in"
                style={{
                  transform: `scale(${artisticZoom}) translate(${artisticPan.x}px, ${artisticPan.y}px)`,
                }}
              >
                <img 
                  src={CustomCaracasMapImg} 
                  alt="Mapa de Caracas Pinta Mapas" 
                  className="w-full h-full object-cover opacity-80"
                  draggable={false}
                />

                {/* Plotting User GPS Coordinates accurately on the map canvas */}
                {filteredExplorers.map((user) => {
                  const { x, y } = getPositionOnArtMap(user.latitude, user.longitude);
                  return (
                    <div
                      key={user.uid}
                      className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(user);
                      }}
                    >
                      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping scale-150 opacity-75"></span>
                      
                      <div className={`relative p-0.5 rounded-full border-2 transition-all ${
                        selectedUser?.uid === user.uid 
                          ? 'bg-amber-500 scale-125 border-amber-300 shadow-lg z-30' 
                          : 'bg-background hover:scale-115 border-primary shadow-md hover:border-accent'
                      }`}>
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full object-cover bg-surface"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = avatarJoven1;
                          }}
                        />
                        {/* Selected/focused label (Always visible) or Hover Label */}
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 whitespace-nowrap bg-black/95 text-[9px] rounded-lg border border-primary/30 text-white flex flex-col items-center shadow-lg transition-all ${
                          selectedUser?.uid === user.uid
                            ? 'opacity-100 scale-100 pointer-events-auto'
                            : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none'
                        }`}>
                          <span className="font-semibold text-[10px] text-white leading-none mb-0.5">{user.name}</span>
                          <span className="font-mono text-[8px] text-primary leading-none">{user.pseudonym}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail Info Card */}
              {selectedUser && (
                <div className="absolute bottom-4 left-4 right-16 md:right-auto md:max-w-xs z-30 bg-black/85 backdrop-blur-lg border border-primary/30 p-4 rounded-xl shadow-2xl text-white select-text animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedUser.avatarUrl} 
                        alt={selectedUser.name} 
                        className="w-11 h-11 rounded-full border border-amber-500 bg-slate-900 object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = avatarJoven1;
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-semibold tracking-tight text-white">{selectedUser.name}</h4>
                        <div className="text-xs font-mono text-primary font-semibold">{selectedUser.pseudonym}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedUser(null)} 
                      className="text-white/40 hover:text-white transition font-bold text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedUser.title && (
                    <div className="mt-2 text-[8px] bg-primary/15 border border-primary/30 text-primary uppercase tracking-wider font-bold px-1.5 py-0.5 rounded self-start inline-flex items-center gap-1.5">
                      <Award className="w-3 h-3" />
                      {selectedUser.title}
                    </div>
                  )}

                  <p className="text-xs font-sans text-neutral-300 mt-2 leading-relaxed border-t border-neutral-800 pt-2 italic">
                    "{selectedUser.bio}"
                  </p>

                  {/* CHECK-IN VALIDATIONS SECTION */}
                  <div className="mt-3 pt-3 border-t border-neutral-800 text-left">
                    <div className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
                      Lugares Validados (Check-Ins)
                    </div>
                    {isLoadingProgress ? (
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <div className="w-3 h-3 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin"></div>
                        <span>Cargando validaciones...</span>
                      </div>
                    ) : (
                      (() => {
                        const places = selectedUser.isMock 
                          ? getMockValidatedPlaces(selectedUser.uid)
                          : getValidatedPlaces(selectedUserProgress);
                        
                        if (places.length === 0) {
                          return (
                            <p className="text-[10px] text-neutral-400 italic">
                              Ningún lugar validado todavía.
                            </p>
                          );
                        }

                        return (
                          <div className="max-h-[105px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            {places.map((p, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[10px] text-neutral-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 shadow-sm">
                                <span className="text-[#00E676] font-extrabold shrink-0">✓</span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold truncate text-white leading-tight">{p.placeName}</p>
                                  <p className="text-[8px] text-neutral-400 truncate leading-none mt-0.5">{p.routeName}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center gap-1.5 text-[9px] text-neutral-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Lat: {selectedUser.latitude.toFixed(5)}, Lng: {selectedUser.longitude.toFixed(5)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* GUARANTEED NO BILLING ERROR: Custom Avatar-equipped google roadmap layout */
            <div className="w-full h-full relative bg-slate-900">
              <iframe
                title="Google Maps Caracas Standard"
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'contrast(1.02) brightness(0.98)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full animate-fade-in"
              ></iframe>

              {/* OVERLAY: Beautiful avatar pin floating perfectly above the centered Google Maps location pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+14px)] pointer-events-none z-20 flex flex-col items-center">
                
                {/* Floating Name & Pseudonym label above the avatar pin */}
                <div className="mb-2 px-3 py-1.5 bg-black/95 border border-primary/40 rounded-xl text-center shadow-2xl flex flex-col items-center select-none pointer-events-none min-w-[125px] animate-fade-in animate-bounce-slow">
                  <span className="text-[10px] font-bold text-white tracking-tight leading-none mb-1">{currentName}</span>
                  <span className="text-[9px] font-mono text-primary font-semibold leading-none">{selectedUser?.pseudonym || '@aventurero'}</span>
                </div>

                {/* Ping wave effect radiating from the pin base */}
                <span className="absolute bottom-0 w-8 h-8 rounded-full bg-primary/45 animate-ping -mb-4"></span>
                
                {/* Floating active avatar bubble */}
                <div className="relative p-0.5 bg-primary rounded-full shadow-2xl border-2 border-white animate-bounce-slow flex-shrink-0">
                  <img 
                    src={currentAvatar} 
                    alt={currentName} 
                    className="w-12 h-12 rounded-full object-cover bg-surface shadow-inner"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = avatarJoven1;
                    }}
                  />
                  {selectedUser?.isMock ? (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold shadow-md">
                      ★
                    </span>
                  ) : (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold shadow-md">
                      ✓
                    </span>
                  )}
                </div>
                {/* Cute pointer stem */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary -mt-1 drop-shadow-md"></div>
              </div>

              {/* Float status badge */}
              <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/20 flex flex-col gap-0.5 text-[10px] font-mono text-white max-w-xs">
                <span className="flex items-center gap-1.5 text-primary font-bold">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  GOOGLE MAPAS ACTIVO
                </span>
                <span className="text-[9px] text-neutral-400">Ubicación de {selectedUser?.name || 'Aventurero'}</span>
              </div>

              {/* Absolute Detail Info Overlay on top of embed */}
              {selectedUser && (
                <div className="absolute bottom-4 left-4 right-16 md:right-auto md:max-w-xs z-30 bg-black/90 backdrop-blur-lg border border-primary/30 p-4 rounded-xl shadow-2xl text-white select-text animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedUser.avatarUrl} 
                        alt={selectedUser.name} 
                        className="w-11 h-11 rounded-full border border-amber-500 bg-slate-900 object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = avatarJoven1;
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-semibold tracking-tight text-white">{selectedUser.name}</h4>
                        <div className="text-xs font-mono text-primary font-semibold">{selectedUser.pseudonym}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedUser(null)} 
                      className="text-white/40 hover:text-white transition font-bold text-xs p-1"
                      aria-label="Cerrar ficha"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedUser.title && (
                    <div className="mt-2 text-[8px] bg-primary/15 border border-primary/30 text-primary uppercase tracking-wider font-bold px-1.5 py-0.5 rounded self-start inline-flex items-center gap-1.5">
                      <Award className="w-3 h-3" />
                      {selectedUser.title}
                    </div>
                  )}

                  <p className="text-xs font-sans text-neutral-300 mt-2 leading-relaxed border-t border-neutral-800 pt-2 italic">
                    "{selectedUser.bio}"
                  </p>

                  {/* CHECK-IN VALIDATIONS SECTION */}
                  <div className="mt-3 pt-3 border-t border-neutral-800 text-left">
                    <div className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
                      Lugares Validados (Check-Ins)
                    </div>
                    {isLoadingProgress ? (
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <div className="w-3 h-3 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin"></div>
                        <span>Cargando validaciones...</span>
                      </div>
                    ) : (
                      (() => {
                        const places = selectedUser.isMock 
                          ? getMockValidatedPlaces(selectedUser.uid)
                          : getValidatedPlaces(selectedUserProgress);
                        
                        if (places.length === 0) {
                          return (
                            <p className="text-[10px] text-neutral-400 italic">
                              Ningún lugar validado todavía.
                            </p>
                          );
                        }

                        return (
                          <div className="max-h-[105px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            {places.map((p, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[10px] text-neutral-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 shadow-sm">
                                <span className="text-[#00E676] font-extrabold shrink-0">✓</span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold truncate text-white leading-tight">{p.placeName}</p>
                                  <p className="text-[8px] text-neutral-400 truncate leading-none mt-0.5">{p.routeName}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between gap-1.5 text-[9px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      Lat: {selectedUser.latitude.toFixed(5)}, Lng: {selectedUser.longitude.toFixed(5)}
                    </span>
                    {selectedUser.isMock && (
                      <span className="text-amber-500 uppercase font-bold text-[8px]">★ GUÍA</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
