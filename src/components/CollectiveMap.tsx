/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useLanguage } from '../translations';
import { MapPin, Users, Compass, Navigation, Info, Award, Layers, Eye, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

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

export default function CollectiveMap() {
  const { t } = useLanguage();
  const [explorers, setExplorers] = useState<MapUser[]>(MOCK_PROFILES_WITH_COORDS);
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 10.506085, lng: -66.912 });
  const [zoom, setZoom] = useState(14);
  const [mapMode, setMapMode] = useState<'artistic' | 'google'>('artistic'); // default to 'artistic' to always preserve stellar custom UX with ZERO billing errors
  
  // Local map zoom/navigation states
  const [artisticZoom, setArtisticZoom] = useState(1.1);
  const [artisticPan, setArtisticPan] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

  // Listen to real-time users collection in Firestore
  useEffect(() => {
    const q = query(collection(db, 'users'), limit(50));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let dbUsers: MapUser[] = [];
      if (!querySnapshot.empty) {
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // We only display users on the map who have registered coordinate geolocations
          if (data.latitude !== undefined && data.longitude !== undefined) {
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
    setMapCenter({ lat: user.latitude, lng: user.longitude });
    setZoom(15);

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

  // Helper for artistic drag gestures
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

  return (
    <div className="w-full bg-surface-variant/40 rounded-3xl border border-outline/30 overflow-hidden shadow-2xl backdrop-blur-md p-6 md:p-8" id="collective-map-section">
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

        {/* Dynamic selector to switch map engines beautifully */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="inline-flex rounded-xl bg-surface/60 border border-outline/20 p-1">
            <button
              onClick={() => { setMapMode('artistic'); setSelectedUser(null); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mapMode === 'artistic'
                  ? 'bg-primary text-on-primary shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mapa Ilustrado</span>
            </button>
            <button
              onClick={() => { setMapMode('google'); setSelectedUser(null); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mapMode === 'google'
                  ? 'bg-primary text-on-primary shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 border border-outline/20 text-xs font-mono text-on-surface-variant">
            <Users className="w-4 h-4 text-primary animate-pulse" />
            <span>{explorers.length} {explorers.length === 1 ? 'Viajero' : 'Viajeros'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Sidebar list of active explorers */}
        <div className="lg:col-span-1 flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar bg-surface/20 rounded-2xl p-3 border border-outline/15 order-2 lg:order-1">
          <div className="text-xs font-semibold tracking-widest text-primary/80 uppercase px-2 py-1 flex items-center gap-1.5 border-b border-outline/10 pb-2 mb-1 justify-between">
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
            {explorers.map((user) => (
              <button
                key={user.uid}
                onClick={() => handleFocusUser(user)}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-left border transition ${
                  selectedUser?.uid === user.uid
                    ? 'bg-primary/15 border-primary text-on-surface shadow-md'
                    : 'bg-surface/40 hover:bg-surface/80 border-outline/10 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-outline/15 object-cover bg-background"
                    referrerPolicy="no-referrer"
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
        <div className="lg:col-span-3 h-[450px] rounded-2xl overflow-hidden border border-outline/25 shadow-inner relative bg-slate-950 order-1 lg:order-2">
          {mapMode === 'artistic' ? (
            /* CRITICAL UPGRADE: Stellar custom Offline-friendly, zero-billing Caracas Cartography Canvas */
            <div 
              className="w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {/* Outer Coordinates Frame */}
              <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-1.5 text-[10px] font-mono text-primary select-none pointer-events-none">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                <span>CASCO HISTÓRICO DE CARACAS (MODO ILUSTRADO)</span>
              </div>

              {/* Viewport Control Panel representing zoom buttons */}
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
                className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
                style={{
                  transform: `scale(${artisticZoom}) translate(${artisticPan.x}px, ${artisticPan.y}px)`,
                }}
              >
                {/* Physical Base Illustrated Caracas Map Asset */}
                <img 
                  src={CustomCaracasMapImg} 
                  alt="Mapa de Caracas Pinta Mapas" 
                  className="w-full h-full object-cover opacity-80"
                  draggable={false}
                />

                {/* Plotting User GPS Coordinates accurately on the map canvas */}
                {explorers.map((user) => {
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
                      {/* Pulse Radial Effect */}
                      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping scale-150 opacity-75"></span>
                      
                      {/* Anchor pin head containing avatar */}
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
                        />
                        {/* Micro Label appearing on hover */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 whitespace-nowrap bg-black/90 text-[9px] font-mono rounded border border-outline/30 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {user.pseudonym}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Interactive Custom Leaflet-Style Detail Dialog box */}
              {selectedUser && (
                <div className="absolute bottom-4 left-4 right-16 md:right-auto md:max-w-xs z-30 bg-black/85 backdrop-blur-lg border border-primary/30 p-4 rounded-xl shadow-2xl text-white select-text animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedUser.avatarUrl} 
                        alt={selectedUser.name} 
                        className="w-11 h-11 rounded-full border border-amber-500 bg-slate-900 object-cover"
                        referrerPolicy="no-referrer"
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

                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center gap-1.5 text-[9px] text-neutral-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Lat: {selectedUser.latitude.toFixed(5)}, Lng: {selectedUser.longitude.toFixed(5)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : apiKey ? (
            /* Satellite Map Engine utilizing the configured platform key */
            <APIProvider apiKey={apiKey}>
              <Map
                center={mapCenter}
                zoom={zoom}
                onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
                onZoomChanged={(ev) => setZoom(ev.detail.zoom)}
                mapId="DEMO_MAP_ID"
                className="w-full h-full"
                gestureHandling="cooperative"
                disableDefaultUI={false}
              >
                {explorers.map((user) => (
                  <Marker
                    key={user.uid}
                    position={{ lat: user.latitude, lng: user.longitude }}
                    onClick={() => setSelectedUser(user)}
                    title={`${user.name} (${user.pseudonym})`}
                  />
                ))}

                {selectedUser && (
                  <InfoWindow
                    position={{ lat: selectedUser.latitude, lng: selectedUser.longitude }}
                    onCloseClick={() => setSelectedUser(null)}
                  >
                    <div className="flex flex-col p-2 max-w-[240px] text-zinc-900 font-sans">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedUser.avatarUrl}
                          alt={selectedUser.name}
                          className="w-10 h-10 rounded-full border border-amber-500 bg-slate-50 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-sm leading-tight text-slate-900">{selectedUser.name}</div>
                          <div className="text-xs font-mono text-indigo-600 font-bold">{selectedUser.pseudonym}</div>
                        </div>
                      </div>

                      {selectedUser.title && (
                        <div className="mt-2 text-[9px] bg-indigo-50 text-indigo-700 uppercase tracking-widest font-bold px-1.5 py-0.5 rounded self-start flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {selectedUser.title}
                        </div>
                      )}

                      <p className="text-xs text-slate-700 mt-2 italic leading-relaxed border-t border-slate-100 pt-1.5">
                        "{selectedUser.bio}"
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-150 flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="truncate">{selectedUser.latitude.toFixed(5)}, {selectedUser.longitude.toFixed(5)}</span>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            /* Fallback warning if user switches to Google Maps but key is completely empty */
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-[80px]"></div>
              
              <div className="relative border border-primary/20 bg-background/60 backdrop-blur-md p-6 rounded-2xl max-w-md shadow-xl z-10 flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full border border-primary/20 text-primary">
                  <MapPin className="w-7 h-7 animate-bounce" />
                </div>
                <h3 className="text-md font-semibold text-on-surface font-sans">
                  Visualización de Mapa de Google Maps
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed font-sans max-w-sm">
                  {t('no_key_warning')}
                </p>
                <div className="mt-3 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-md w-full flex items-center gap-2 justify-center">
                  <Info className="w-3.5 h-3.5" />
                  <span>Configura GOOGLE_MAPS_PLATFORM_KEY en tus variables de entorno</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
