/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  Zap, 
  Navigation, 
  Clock, 
  ThumbsUp, 
  HelpCircle,
  Camera,
  Layers,
  Award,
  BookOpen,
  Lock
} from 'lucide-react';
import { Location, SubLocation, UserProfile } from '../types';
import { useLanguage } from '../translations';

interface ExplorationViewProps {
  locations: Location[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  onCheckIn: (locationId: string, placeId: string) => void;
  onResetPlaceCheckIn?: (locationId: string, placeId: string) => void;
  user: UserProfile;
  onTriggerPhoto: () => void;
  lockedRouteIds?: string[];
}

// Haversine formula to compute geodesic distance in meters
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const q1 = (lat1 * Math.PI) / 180;
  const q2 = (lat2 * Math.PI) / 180;
  const dq = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dq / 2) * Math.sin(dq / 2) +
    Math.cos(q1) * Math.cos(q2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export default function ExplorationView({
  locations,
  selectedRouteId,
  onSelectRoute,
  onCheckIn,
  onResetPlaceCheckIn,
  user,
  onTriggerPhoto,
  lockedRouteIds = []
}: ExplorationViewProps) {
  const { t, translateLocation } = useLanguage();
  const translatedLocations = locations.map(translateLocation) as Location[];

  // Let's start the simulated position at Madrid, Spain (Puerta del Sol)
  const [gpsSimLat, setGpsSimLat] = useState<number>(40.4168);
  const [gpsSimLng, setGpsSimLng] = useState<number>(-3.7038);
  
  // Checking in state tracked per placeId
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [justUnlockedPlace, setJustUnlockedPlace] = useState<{ parentLoc: Location; place: SubLocation } | null>(null);
  
  // Real browser geolocation state
  const [browserGpsInUse, setBrowserGpsInUse] = useState<boolean>(false);
  const [browserGpsError, setBrowserGpsError] = useState<string | null>(null);

  const selectedLoc = translatedLocations.find(loc => loc.id === selectedRouteId) || translatedLocations[0];

  // Try to query real device GPS
  const useRealBrowserGps = () => {
    if (!navigator.geolocation) {
      setBrowserGpsError(t('geolocalizacion_no_soportada'));
      return;
    }

    setBrowserGpsInUse(true);
    setBrowserGpsError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsSimLat(Number(position.coords.latitude.toFixed(5)));
        setGpsSimLng(Number(position.coords.longitude.toFixed(5)));
        setBrowserGpsInUse(false);
      },
      (error) => {
        let msg = t('gps_error_unknown');
        if (error.code === 1) msg = t('gps_permiso_denegado');
        else if (error.code === 2) msg = t('gps_no_disponible');
        else if (error.code === 3) msg = t('gps_timeout');
        setBrowserGpsError(msg);
        setBrowserGpsInUse(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Teleport helper with minor fluctuation to simulate GPS inaccuracy
  const teleportToPlace = (place: SubLocation) => {
    const latFluct = (Math.random() - 0.5) * 0.0001;
    const lngFluct = (Math.random() - 0.5) * 0.0001;
    setGpsSimLat(Number((place.latitude + latFluct).toFixed(5)));
    setGpsSimLng(Number((place.longitude + lngFluct).toFixed(5)));
    setBrowserGpsError(null);
  };

  const handlePerformCheckIn = (place: SubLocation) => {
    if (!place || !selectedLoc) return;

    setCheckingInId(place.id);
    
    // Simulate radio communication wait for satellite sync & smart contract precheck
    setTimeout(() => {
      onCheckIn(selectedLoc.id, place.id);
      setCheckingInId(null);
      setJustUnlockedPlace({
        parentLoc: selectedLoc,
        place: place
      });
    }, 1800);
  };

  // Calculations for route checkin counters
  const getCompletedPlacesCount = (loc: Location) => {
    return loc.places?.filter(p => p.isCheckedIn).length || 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      
      {browserGpsError && (
        <div className="bg-error-container/35 border border-error/25 text-error p-3 rounded-xl text-xs flex items-center gap-2">
          <span className="font-bold">{t('aviso_gps_title')}</span> {browserGpsError}
          <span className="text-on-surface-variant">{t('aviso_gps_desc')}</span>
        </div>
      )}

      {/* Sub Menu / Horizontal Tabs list of Routes (Ruta 1, Ruta 2, ...) */}
      <div className="space-y-3">
        <h3 className="font-headline text-xs font-bold text-secondary uppercase tracking-wider pl-1 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-secondary animate-pulse" /> {t('sub_menu_rutas')}
        </h3>
        
        {/* Horizontal tabs list of Routes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {translatedLocations.map((loc, idx) => {
            const isSelected = selectedRouteId === loc.id;
            const completedCount = getCompletedPlacesCount(loc);
            const totalCount = loc.places?.length || 8;
            const percentage = Math.round((completedCount / totalCount) * 100);
            const isLockedRouteState = lockedRouteIds.includes(loc.id);

            return (
              <button
                key={loc.id}
                disabled={isLockedRouteState}
                onClick={() => {
                  if (isLockedRouteState) return;
                  onSelectRoute(loc.id);
                  setBrowserGpsError(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between h-[90px] ${
                  isLockedRouteState
                    ? 'opacity-40 cursor-not-allowed bg-black/25 border-[#005049]/10 text-on-surface-variant/40'
                    : isSelected 
                      ? 'bg-surface-container border-secondary shadow-[0_0_15px_rgba(26, 86, 219,0.12)] scale-[1.03] z-10' 
                      : 'bg-surface-container-low border-outline-variant/20 hover:border-secondary/40 hover:bg-surface-container transition-all cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] uppercase font-black text-secondary tracking-wider flex items-center gap-1">
                      {isLockedRouteState && <Lock className="w-3 h-3 text-secondary" />}
                      {t('ruta_label').replace('{num}', String(idx + 1))}
                    </span>
                    {percentage === 100 && !isLockedRouteState && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-tertiary fill-background shrink-0" />
                    )}
                    {isLockedRouteState && (
                      <span className="text-[10px]">🔒</span>
                    )}
                  </div>
                  <h4 className="font-headline text-xs font-bold text-on-surface truncate group-hover:text-secondary mt-0.5">
                    {isLockedRouteState ? 'BLOQUEADO' : loc.name}
                  </h4>
                </div>

                <div className="w-full space-y-1">
                  <div className="flex justify-between items-center text-[9px] text-on-surface-variant font-mono">
                    <span>{t('progreso_label')}</span>
                    <span className="font-bold text-secondary">
                      {isLockedRouteState ? '🔒' : `${completedCount}/${totalCount}`}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#001521] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${isLockedRouteState ? 'bg-[#01222b]' : percentage === 100 ? 'bg-tertiary' : 'bg-secondary'}`}
                      style={{ width: `${isLockedRouteState ? 0 : percentage}%` }}
                    />
                  </div>
                </div>

                {isSelected && !isLockedRouteState && (
                  <div className="absolute right-0 top-0 h-full w-1 bg-secondary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Route Information Card Block */}
      <div className="bg-surface-container rounded-2xl border border-[#005049]/20 overflow-hidden shadow-lg flex flex-col md:flex-row">
         {/* Cover image of monument */}
        <div className="w-full md:w-72 aspect-[16/10] relative overflow-hidden shrink-0">
          <img 
            src={selectedLoc.imageUrl} 
            alt={selectedLoc.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ficha details */}
        <div className="p-5 md:p-6 flex-1 flex flex-col justify-between gap-4">
          <div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs text-secondary font-bold uppercase tracking-wider block">
                {t('fichas_historicas_label')}
              </span>
              
              {getCompletedPlacesCount(selectedLoc) === 8 ? (
                <span className="bg-tertiary/10 border border-tertiary/25 text-tertiary px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('ruta_certificada')}
                </span>
              ) : (
                <span className="bg-secondary/10 border border-secondary/25 text-secondary px-3 py-1 rounded-full text-[11px] font-bold">
                  {t('completados_label').replace('{num}', String(getCompletedPlacesCount(selectedLoc)))}
                </span>
              )}
            </div>

            <h2 className="font-headline text-xl md:text-2xl font-black text-[#c8e7fb] mt-1.5">
              {selectedLoc.name}
            </h2>
            
            <p className="text-xs text-on-surface-variant leading-relaxed mt-2.5 max-w-2xl whitespace-pre-line">
              {selectedLoc.review[0]}
            </p>
          </div>

          <div className="pt-3 border-t border-[#005049]/15 flex flex-wrap gap-4 items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-secondary" />
              {t('suma_total_xp').replace('{xp}', '4000')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Render the 8 historical cards (fichas) synchronously as requested! */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface">
              {t('fichas_historicas_title')}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {t('fichas_historicas_desc')}
            </p>
          </div>
          <span className="bg-[#002732] border border-secondary/25 text-secondary font-mono text-xs py-1 px-3 rounded-full font-bold">
            {t('completados_listas_label').replace('{num}', String(getCompletedPlacesCount(selectedLoc)))}
          </span>
        </div>

        {/* 8 Fichas grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {selectedLoc.places?.map((place, idx) => {
            const isCompleted = place.isCheckedIn;
            const dist = getHaversineDistance(gpsSimLat, gpsSimLng, place.latitude, place.longitude);
            const isWithinCheckIn = dist <= 150;
            const isCheckingThisOne = checkingInId === place.id;

            return (
              <div 
                key={place.id}
                id={`ficha-historica-${place.id}`}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[300px] relative ${
                  isCompleted
                    ? 'bg-gradient-to-br from-[#012623]/25 to-[#001019] border-tertiary/40 shadow-[0_0_12px_rgba(0,180,140,0.05)]'
                    : 'bg-surface-container border-outline-variant/15 hover:border-[#005049]/50'
                }`}
              >
                {/* Visual verified watermark */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 overflow-hidden rounded-tr-2xl w-20 h-20 pointer-events-none select-none">
                    <div className="bg-tertiary text-on-tertiary text-[9px] font-black uppercase tracking-wider text-center py-1 absolute top-4 -right-6 w-24 rotate-45 border-y border-[#c8e7fb]/20 shadow-md">
                      OK
                    </div>
                  </div>
                )}

                {/* Header Segment */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-black text-secondary bg-secondary/10 w-6 h-6 rounded-full flex items-center justify-center border border-secondary/15 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold bg-[#001e2c] border border-secondary/15 text-secondary px-2.5 py-0.5 rounded font-mono">
                      +{place.points} XP
                    </span>
                  </div>

                  <div className="text-left space-y-1 pr-14">
                    <h4 className="font-headline text-base font-black text-[#c8e7fb] leading-snug">
                      {place.name}
                    </h4>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed text-left">
                    {place.description}
                  </p>
                </div>

                {/* Distance & GPS information */}
                <div className="space-y-4 pt-4 border-t border-[#005049]/15 mt-4">
                  <div className="flex justify-between items-center text-[11px] font-mono text-on-surface-variant">
                    <span>{t('coordenadas_ficha')}</span>
                    <span className="text-on-surface font-semibold">{place.latitude}, {place.longitude}</span>
                  </div>

                  {/* Servicio de Geolocalización Integrado */}
                  <div className="bg-[#001c27] border border-[#1A56DB]/10 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] animate-ping"></span>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                          {t('gps_activo')}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-on-surface-variant">
                        {t('tus_coordenadas')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono bg-background/50 px-2 py-1 rounded">
                      <span className="text-on-surface-variant">Lat: <strong className="text-secondary select-all">{gpsSimLat}</strong></span>
                      <span className="text-on-surface-variant">Lng: <strong className="text-secondary select-all">{gpsSimLng}</strong></span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={useRealBrowserGps}
                        disabled={browserGpsInUse}
                        className="flex-1 py-1 px-2 rounded bg-secondary/10 hover:bg-secondary/15 border border-secondary/15 transition-all text-[9.5px] font-bold text-secondary flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {browserGpsInUse ? (
                          <div className="w-2.5 h-2.5 border border-secondary border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                          <Navigation className="w-2.5 h-2.5" />
                        )}
                        {t('gps_real_btn')}
                      </button>
                      <button
                        onClick={() => {
                          setGpsSimLat(40.4168);
                          setGpsSimLng(-3.7038);
                          setBrowserGpsError(null);
                          if (onResetPlaceCheckIn) {
                            onResetPlaceCheckIn(selectedLoc.id, place.id);
                          }
                        }}
                        className="py-1 px-2 rounded hover:bg-surface-container-high border border-on-surface-variant/10 transition-all text-[9.5px] font-semibold text-on-surface-variant cursor-pointer"
                      >
                        {t('resetear_btn')}
                      </button>
                    </div>
                  </div>

                  {/* Geolocation visual telemetry */}
                  {isCompleted ? (
                    <div className="p-3 bg-tertiary/10 border border-tertiary/25 text-tertiary text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 fill-background" />
                      <div className="leading-tight">
                        <p className="font-bold">{t('lugar_validado_title')}</p>
                        <p className="text-[10px] opacity-80 mt-0.5">{t('lugar_validado_desc')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 font-sans ${
                      isWithinCheckIn
                        ? 'bg-tertiary/10 border-tertiary/30 text-tertiary'
                        : 'bg-error-container/10 border-error/20 text-error'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold flex items-center gap-1 shrink-0">
                          <Target className="w-3.5 h-3.5" /> 
                          {isWithinCheckIn ? t('posicion_correcta_title') : t('presencia_fisica_title')}
                        </span>
                        <span className="font-mono text-[10px] bg-background/50 px-1.5 py-0.5 rounded border border-current/15 shrink-0">
                          {dist > 1000 
                            ? `${(dist / 1000).toFixed(2)} km`
                            : t('metros_number').replace('{num}', String(Math.round(dist)))
                          }
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant opacity-85 leading-normal">
                        {isWithinCheckIn 
                          ? t('posicion_correcta_desc') 
                          : t('presencia_fisica_desc')
                        }
                      </p>
                    </div>
                  )}

                  {/* Dynamic control actions for simulation & Satellite verification */}
                  {!isCompleted && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => teleportToPlace(place)}
                        className="py-2 px-3 bg-secondary/10 border border-secondary/35 text-secondary font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-secondary/20 transition-all cursor-pointer active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {t('simular_visita_btn')}
                      </button>

                      <button
                        disabled={!isWithinCheckIn || isCheckingThisOne}
                        onClick={() => handlePerformCheckIn(place)}
                        className={`py-2 px-3 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center ${
                          isWithinCheckIn
                            ? isCheckingThisOne
                              ? 'bg-secondary/10 border border-secondary text-secondary cursor-wait'
                              : 'bg-secondary text-on-secondary hover:brightness-105 active:scale-95 shadow-[0_0_8px_rgba(26, 86, 219,0.2)] cursor-pointer'
                            : 'bg-background/20 border border-on-surface-variant/15 text-on-surface-variant/40 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {isCheckingThisOne ? (
                          <>
                            <div className="w-3 h-3 border-2 border-secondary border-t-transparent animate-spin rounded-full"></div>
                            <span>{t('validando_btn')}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('fichar_lugar_btn')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pop Up Banner when a location/place is unlocked! */}
      {justUnlockedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-surface-container border-2 border-secondary p-8 rounded-2xl text-center space-y-6 glow-cyan animate-in zoom-in duration-300 text-left">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center animate-bounce">
              {justUnlockedPlace.parentLoc.badgeImageUrl ? (
                <img 
                  src={justUnlockedPlace.parentLoc.badgeImageUrl} 
                  alt={justUnlockedPlace.parentLoc.badgeName} 
                  referrerPolicy="no-referrer"
                  style={{ filter: "url(#remove-white)" }}
                  className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(26, 86, 219,0.6)]" 
                />
              ) : (
                <span className="text-5xl select-none">
                  {justUnlockedPlace.parentLoc.badgeIcon === 'castle' && '🏰'}
                  {justUnlockedPlace.parentLoc.badgeIcon === 'forest' && '🌲'}
                  {justUnlockedPlace.parentLoc.badgeIcon === 'museum' && '🏛️'}
                  {justUnlockedPlace.parentLoc.badgeIcon === 'landscape' && '🏔️'}
                  {justUnlockedPlace.parentLoc.badgeIcon === 'waves' && '🌊'}
                  {justUnlockedPlace.parentLoc.badgeIcon === 'night_sight_auto' && '💫'}
                </span>
              )}
              <div className="absolute -bottom-1.5 right-0 bg-tertiary text-on-tertiary text-[9px] font-black px-2 py-0.5 rounded-full z-10">
                {t('ubicacion_ok')}
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h3 className="font-headline text-xl font-black text-on-surface leading-tight">
                {justUnlockedPlace.place.name}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('checkin_verificado_desc').replace('{name}', justUnlockedPlace.place.name).replace('{points}', String(justUnlockedPlace.place.points))}
              </p>
            </div>

            {/* Fast Photo button integrated for premium micro-experience */}
            <div className="bg-background/40 p-3 rounded-xl border border-secondary/10 flex items-center justify-between text-xs text-on-surface-variant">
              <span>{t('registrar_foto')}</span>
              <button
                onClick={() => {
                  onTriggerPhoto();
                }}
                className="bg-secondary text-on-secondary py-1.5 px-3 rounded font-bold text-[10px] flex items-center gap-1 uppercase cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" /> {t('foto_instantanea_btn')}
              </button>
            </div>

            <button
              onClick={() => setJustUnlockedPlace(null)}
              className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase tracking-wide glow-mint hover:brightness-105 transition-all text-center block cursor-pointer"
            >
              {t('continuar_ruta_btn')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
