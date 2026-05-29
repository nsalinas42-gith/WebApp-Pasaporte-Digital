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
  BookOpen
} from 'lucide-react';
import { Location, UserProfile } from '../types';

interface ExplorationViewProps {
  locations: Location[];
  onCheckIn: (locationId: string) => void;
  user: UserProfile;
  onTriggerPhoto: () => void;
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
  onCheckIn,
  user,
  onTriggerPhoto
}: ExplorationViewProps) {
  // Let's start the simulated position at Madrid, Spain (Puerta del Sol)
  // Coordinates of Madrid: 40.4168, -3.7038
  const [gpsSimLat, setGpsSimLat] = useState<number>(40.4168);
  const [gpsSimLng, setGpsSimLng] = useState<number>(-3.7038);
  
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || '');
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);
  const [justUnlockedLoc, setJustUnlockedLoc] = useState<Location | null>(null);
  
  // Real browser geolocation state
  const [browserGpsInUse, setBrowserGpsInUse] = useState<boolean>(false);
  const [browserGpsError, setBrowserGpsError] = useState<string | null>(null);

  const selectedLoc = locations.find(loc => loc.id === selectedLocId) || locations[0];

  // Try to query real device GPS
  const useRealBrowserGps = () => {
    if (!navigator.geolocation) {
      setBrowserGpsError('La geolocalización no está soportada por tu navegador o iFrame.');
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
        let msg = 'Error desconocido al leer GPS.';
        if (error.code === 1) msg = 'Permiso denegado por el usuario o iFrame.';
        else if (error.code === 2) msg = 'Posición no disponible.';
        else if (error.code === 3) msg = 'Tiempo de espera agotado al conectar.';
        setBrowserGpsError(msg);
        setBrowserGpsInUse(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Teleport helper to monument with random minor fluctuation (e.g., 5-15 meters)
  const teleportToMonument = (loc: Location) => {
    // Approx displacement of 0.00008 degrees ~ 8 meters in CDMX
    const latFluct = (Math.random() - 0.5) * 0.00015;
    const lngFluct = (Math.random() - 0.5) * 0.00015;
    setGpsSimLat(Number((loc.latitude + latFluct).toFixed(5)));
    setGpsSimLng(Number((loc.longitude + lngFluct).toFixed(5)));
    setBrowserGpsError(null);
  };

  // Calculate distance from simulated position to selected landmark
  const distanceToSelected = selectedLoc 
    ? getHaversineDistance(gpsSimLat, gpsSimLng, selectedLoc.latitude, selectedLoc.longitude)
    : 0;

  // We consider that the physical colored card check-in holds a 100 meters range limit on phone GPS
  const isWithinCheckInRadius = distanceToSelected <= 100;

  const handlePerformCheckIn = () => {
    if (!isWithinCheckInRadius || !selectedLoc) return;

    setIsCheckingIn(true);
    
    // Simulate radio communication wait for satellite sync & smart contract precheck
    setTimeout(() => {
      onCheckIn(selectedLoc.id);
      setIsCheckingIn(false);
      setJustUnlockedLoc(selectedLoc);
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Upper Status Banner with Active simulated coordinates */}
      <div className="glass-panel border border-[#43e5d4]/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
            <span className="font-headline text-xs font-bold text-secondary uppercase tracking-wider">
              Servicio de Geolocalización Activo
            </span>
          </div>
          <h2 className="text-lg font-bold text-on-surface">
            Tus coordenadas actuales (Simuladas)
          </h2>
          <p className="font-mono text-xs text-on-surface-variant font-medium">
            Latitud: <span className="text-[#c8e7fb] font-extrabold select-all">{gpsSimLat}</span> | 
            Longitud: <span className="text-[#c8e7fb] font-extrabold select-all">{gpsSimLng}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={useRealBrowserGps}
            disabled={browserGpsInUse}
            className="flex-1 md:flex-none py-2 px-4 rounded-xl border border-secondary/20 bg-secondary/10 hover:bg-secondary/15 transition-all text-xs font-bold text-secondary flex items-center justify-center gap-1.5"
          >
            {browserGpsInUse ? (
              <div className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            Obtener GPS del Teléfono
          </button>
          
          <button
            onClick={() => {
              // Quick reset to central Mexico CDMX coords
              setGpsSimLat(19.4326);
              setGpsSimLng(-99.1332);
              setBrowserGpsError(null);
            }}
            className="flex-1 md:flex-none py-2 px-4 rounded-xl border border-on-surface-variant/20 hover:bg-surface-container-high transition-all text-xs font-semibold text-on-surface-variant flex items-center justify-center"
          >
            Resetear al Zócalo
          </button>
        </div>
      </div>

      {browserGpsError && (
        <div className="bg-error-container/35 border border-error/25 text-error p-3 rounded-xl text-xs flex items-center gap-2 animate-bounce">
          <span className="font-bold">Aviso GPS:</span> {browserGpsError}
          <span className="text-on-surface-variant">(Se ha mantenido la simulación manual para que puedas jugar sin problemas)</span>
        </div>
      )}

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left pane: Monument Selector List (5 Columns) */}
        <div id="monument-list-sidebar" className="lg:col-span-4 space-y-4">
          <h3 className="font-headline text-xs font-bold text-secondary uppercase tracking-wider pb-1">
            Lugares Disponibles
          </h3>

          <div className="space-y-3">
            {locations.map((loc) => {
              const isSelected = selectedLocId === loc.id;
              
              return (
                <div
                  id={`monument-card-${loc.id}`}
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocId(loc.id);
                    setBrowserGpsError(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-surface-container-high border-secondary shadow-[0_0_12px_rgba(67,229,212,0.1)] scale-[1.02]' 
                      : 'bg-surface-container border-outline-variant/20 hover:border-[#005049]/50 hover:bg-surface-container/80'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Tiny visual thumbnail preview */}
                    <div className="w-14 h-14 rounded-lg bg-background border border-[#005049]/20 overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={loc.imageUrl} 
                        alt={loc.name} 
                        className={`w-full h-full object-cover ${loc.isCheckedIn ? '' : 'brightness-75'}`} 
                      />
                      {loc.isCheckedIn && (
                        <div className="absolute inset-0 bg-tertiary/10 flex items-center justify-center text-tertiary">
                          <CheckCircle2 className="w-5 h-5 fill-background" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <span className="text-[9px] uppercase font-extrabold text-secondary tracking-wider block">
                        {loc.category}
                      </span>
                      <h4 className="font-headline text-sm font-bold text-on-surface truncate">
                        {loc.name}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant font-medium truncate">
                        {loc.city}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#005049]/15 flex justify-between items-center text-[10px]">
                    <span className="text-on-surface-variant font-semibold">
                      Recompensa: <strong className="text-secondary font-bold">+{loc.points} XP</strong>
                    </span>
                    
                    {loc.isCheckedIn ? (
                      <span className="text-tertiary font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Stamp Canjeado
                      </span>
                    ) : (
                      <span className="text-secondary font-bold flex items-center gap-0.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Pendiente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Selected Monument Ficha & GPS Simulator (7 Columns) */}
        <div id="monument-details-fiche" className="lg:col-span-8 bg-surface-container rounded-2xl border border-[#005049]/20 overflow-hidden shadow-lg flex flex-col">
          {/* Top cover image of monument */}
          <div className="h-48 md:h-60 relative overflow-hidden">
            <img 
              src={selectedLoc.imageUrl} 
              alt={selectedLoc.name} 
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlap */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent z-10" />
            
            {/* Floating state badge inside image */}
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-block bg-background/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-secondary/25 text-xs text-secondary font-bold">
                {selectedLoc.category}
              </span>
            </div>

            {selectedLoc.isCheckedIn && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-tertiary text-on-tertiary px-3 py-1.5 rounded-full font-bold text-xs shadow-md">
                <CheckCircle2 className="w-4 h-4 fill-on-tertiary" /> Desbloqueado
              </div>
            )}
          </div>

          {/* Deep Ficha details */}
          <div className="p-6 md:p-8 space-y-6 flex-1 text-left">
            <div>
              <span className="text-xs text-secondary font-bold uppercase tracking-wider">
                {selectedLoc.city} &bull; Coordinadas: {selectedLoc.latitude}, {selectedLoc.longitude}
              </span>
              <h2 className="font-headline text-xl md:text-2xl font-black text-[#c8e7fb] mt-1">
                {selectedLoc.name}
              </h2>
            </div>

            {/* Two short educational review paragraphs */}
            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <p>{selectedLoc.review[0]}</p>
              <p>{selectedLoc.review[1]}</p>
            </div>

            {/* GPS Range Validation Box */}
            <div className="mt-8 bg-background/50 p-5 rounded-xl border border-[#005049]/20 space-y-4">
              <div className="flex items-center justify-between border-b border-[#005049]/15 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-secondary animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="font-headline text-xs font-bold text-on-surface uppercase tracking-wider">
                    Filtro de Proximidad GPS
                  </span>
                </div>
                
                {/* Distance visual warning */}
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                    isWithinCheckInRadius 
                      ? 'bg-tertiary/15 text-tertiary border border-tertiary/25'
                      : 'bg-error/10 text-error border border-error/20'
                  }`}>
                    {distanceToSelected > 1000 
                      ? `${(distanceToSelected / 1000).toFixed(1)} km de distancia`
                      : `${Math.round(distanceToSelected)} metros de distancia`
                    }
                  </span>
                </div>
              </div>

              {selectedLoc.isCheckedIn ? (
                // Successfully unlocked and Checked-in state
                <div className="p-4 bg-tertiary/10 border border-tertiary/30 rounded-lg flex items-center gap-3.5 text-tertiary">
                  <Sparkles className="w-6 h-6 text-tertiary shrink-0 animate-bounce" />
                  <div className="text-xs">
                    <p className="font-bold text-sm">¡Puntos e Insignia Desbloqueados!</p>
                    <p className="mt-0.5">Ya has validado tu presencia geofísica en este monumento. Ganaste <strong className="font-bold underline">{selectedLoc.points} XP</strong> y el sello <strong className="font-bold">"{selectedLoc.badgeName}"</strong> brilla en tu pasaporte.</p>
                  </div>
                </div>
              ) : (
                // Locked, can simulate or try check-in
                <div className="space-y-4">
                  {/* Info panel */}
                  <div className="text-xs text-on-surface-variant/90 leading-relaxed md:flex md:items-center md:gap-4">
                    <div className="bg-surface-container-high/60 p-3 rounded-lg border border-secondary/15 flex-1 space-y-1">
                      <p className="font-bold text-on-surface flex items-center gap-1 text-secondary">
                        <Target className="w-3.5 h-3.5" /> Distancia Requerida: &lt; 100 metros
                      </p>
                      <p>Para canjear, debes estar físicamente cerca de las coordenadas con tu teléfono. Desde la comodidad de tu casa, usa el botón de abajo para "Teletransportarte".</p>
                    </div>
                  </div>

                  {/* Teleport simulated GPS button of custom app */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      id="btn-teleport-simulator"
                      onClick={() => teleportToMonument(selectedLoc)}
                      className="flex-1 py-3 bg-[#43e5d4]/10 border border-secondary/35 text-secondary font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-[#43e5d4]/20 transition-all cursor-pointer transform active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-secondary/10" />
                      Simular Visita Física (Teletransportarse)
                    </button>

                    <button
                      id="btn-perform-checkin"
                      disabled={!isWithinCheckInRadius || isCheckingIn}
                      onClick={handlePerformCheckIn}
                      className={`flex-1 py-3 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all ${
                        isWithinCheckInRadius
                          ? isCheckingIn
                            ? 'bg-secondary/10 border border-secondary text-secondary cursor-wait'
                            : 'bg-secondary text-on-secondary hover:brightness-105 active:scale-95 shadow-[0_0_15px_rgba(67,229,212,0.25)] cursor-pointer'
                          : 'bg-[#43e5d4]/5 border border-on-surface-variant/20 text-on-surface-variant/40 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isCheckingIn ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent animate-spin rounded-full"></div>
                          <span>Validando Satélite GPS...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Fichar en Pasaporte (Check-In)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Pop Up Banner when a stamp is unlocked! */}
      {justUnlockedLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-surface-container border-2 border-secondary p-8 rounded-2xl text-center space-y-6 glow-cyan animate-in zoom-in duration-300">
            <div className="relative w-32 h-32 mx-auto rounded-full bg-secondary/15 flex items-center justify-center text-secondary border-2 border-secondary animate-bounce overflow-hidden">
              {justUnlockedLoc.badgeImageUrl ? (
                <img 
                  src={justUnlockedLoc.badgeImageUrl} 
                  alt={justUnlockedLoc.badgeName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-6xl select-none">
                  {justUnlockedLoc.badgeIcon === 'castle' && '🏰'}
                  {justUnlockedLoc.badgeIcon === 'forest' && '🌲'}
                  {justUnlockedLoc.badgeIcon === 'museum' && '🏛️'}
                  {justUnlockedLoc.badgeIcon === 'landscape' && '🏔️'}
                  {justUnlockedLoc.badgeIcon === 'waves' && '🌊'}
                  {justUnlockedLoc.badgeIcon === 'night_sight_auto' && '💫'}
                </span>
              )}
              <div className="absolute -bottom-2 right-0 bg-tertiary text-on-tertiary text-[10px] font-black px-2.5 py-0.5 rounded-full">
                ¡NUEVO SELLO!
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-secondary font-black uppercase tracking-widest block bg-secondary/10 w-fit mx-auto px-2.5 py-0.5 rounded-full border border-secondary/15">
                {justUnlockedLoc.badgeTitle} Unlocked
              </span>
              <h3 className="font-headline text-2xl font-black text-on-surface">
                {justUnlockedLoc.badgeName}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                ¡Check-in GPS verificado correctamente a {justUnlockedLoc.latitude}, {justUnlockedLoc.longitude}! Has sumado <strong className="text-secondary font-bold">+{justUnlockedLoc.points} de XP</strong> a tu bitácora de viaje.
              </p>
            </div>

            {/* Fast Photo button integrated for premium micro-experience */}
            <div className="bg-background/40 p-3 rounded-xl border border-secondary/10 flex items-center justify-between text-xs text-on-surface-variant">
              <span>¿Quieres guardar este recuerdo?</span>
              <button
                onClick={() => {
                  onTriggerPhoto();
                  // Trigger small simulated notification
                }}
                className="bg-secondary text-on-secondary py-1.5 px-3 rounded font-bold text-[10px] flex items-center gap-1 uppercase"
              >
                <Camera className="w-3.5 h-3.5" /> Foto instantánea
              </button>
            </div>

            <button
              onClick={() => setJustUnlockedLoc(null)}
              className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase tracking-wide glow-mint hover:brightness-105 transition-all"
            >
              Continuar Explorando
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
