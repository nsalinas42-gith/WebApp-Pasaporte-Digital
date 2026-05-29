/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Lock, 
  X, 
  ChevronRight,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { Location } from '../types';

interface StampsViewProps {
  locations: Location[];
  onExploreLocation: (locationId: string) => void;
}

export default function StampsView({ locations, onExploreLocation }: StampsViewProps) {
  const [selectedBadge, setSelectedBadge] = useState<Location | null>(null);

  const unlockedCount = locations.filter(loc => loc.isCheckedIn).length;
  const totalCount = locations.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Intro Header Stamp Album */}
      <div className="text-left space-y-2">
        <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2">
          <Layers className="w-6 h-6 text-secondary" />
          Álbum de Estampas Digitales
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Cada estampa digital corresponde a un hito geográfico verificado de tu mapa físico. Colecciona los 6 sellos haciendo check-in geolocalizado en cada monumento histórico para desbloquear el gran cNFT.
        </p>
      </div>

      {/* Progress visualizer block */}
      <div className="bg-surface-container-high/40 border border-[#005049]/15 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <span className="text-[10px] text-secondary font-black uppercase tracking-widest block mb-1">
            Tu Cuenta de Sello
          </span>
          <p className="font-headline text-lg font-bold text-on-surface">
            {unlockedCount} de {totalCount} canjeados
          </p>
        </div>

        {/* Dynamic quote */}
        <div className="text-left sm:text-right max-w-md">
          <p className="text-xs text-on-surface-variant italic leading-relaxed">
            {unlockedCount === totalCount 
              ? '¡Felicidades Explorador Supremo! Has dominado el mapa entero por completo. Tu cNFT de Solana te espera en la pantalla principal.' 
              : `Te faltan ${totalCount - unlockedCount} monumentos por recorrer para reclamar el título final de Embajador Supremo y acuñar tu cNFT.`
            }
          </p>
        </div>
      </div>

      {/* Grid of Stamps Album */}
      <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {locations.map((loc) => {
          const isUnlocked = loc.isCheckedIn;

          return (
            <div
              key={loc.id}
              onClick={() => setSelectedBadge(loc)}
              className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-3 relative overflow-hidden transition-all duration-300 filter group cursor-pointer ${
                isUnlocked
                  ? 'bg-gradient-to-b from-surface-container to-surface-container-high border-secondary glow-mint hover:scale-[1.03] select-none'
                  : 'bg-surface-container-longest/40 border-outline-variant/15 opacity-60 hover:opacity-100 hover:scale-[1.01] hover:border-outline-variant/40'
              }`}
            >
              {/* Unlock Indicator */}
              <div className="absolute top-2 right-2">
                {isUnlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-tertiary fill-background" />
                ) : (
                  <Lock className="w-3 h-3 text-on-surface-variant/40" />
                )}
              </div>

              {/* Stamp Graphic */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all overflow-hidden ${
                isUnlocked 
                  ? 'bg-secondary/10 border-secondary/40 shadow-[0_0_12px_rgba(67,229,212,0.1)]'
                  : 'bg-surface-container-highest/60 border-outline-variant/15'
              }`}>
                {loc.badgeImageUrl ? (
                  <img 
                    src={loc.badgeImageUrl} 
                    alt={loc.badgeName} 
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-all ${isUnlocked ? '' : 'grayscale opacity-30 bg-[#001c2a]'}`} 
                  />
                ) : (
                  <span className={`text-3.5xl ${isUnlocked ? '' : 'grayscale opacity-35'}`}>
                    {loc.badgeIcon === 'castle' && '🏰'}
                    {loc.badgeIcon === 'forest' && '🌲'}
                    {loc.badgeIcon === 'museum' && '🏛️'}
                    {loc.badgeIcon === 'landscape' && '🏔️'}
                    {loc.badgeIcon === 'waves' && '🌊'}
                    {loc.badgeIcon === 'night_sight_auto' && '💫'}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h4 className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-on-surface' : 'text-on-surface-variant/70'}`}>
                  {loc.badgeName}
                </h4>
                <p className="text-[9px] text-on-surface-variant/65">
                  {loc.badgeTitle}
                </p>
              </div>

              {isUnlocked ? (
                <span className="text-[8px] bg-tertiary/10 border border-tertiary/20 text-tertiary px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                  ACTIVE
                </span>
              ) : (
                <span className="text-[8px] bg-surface-container-high border border-outline-variant/10 text-on-surface-variant/40 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                  LOCKED
                </span>
              )}
            </div>
          );
        })}
      </main>

      {/* Badge Deep Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface-container border border-secondary p-6 rounded-2xl relative shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="space-y-6 text-center">
              
              {/* Big Sphere */}
              <div className="relative w-28 h-28 mx-auto">
                <div className={`absolute inset-0 rounded-full blur-xl opacity-35 bg-gradient-to-tr ${
                  selectedBadge.isCheckedIn ? 'from-secondary to-tertiary' : 'from-outline-variant to-outline-variant'
                }`} />
                <div className={`relative w-28 h-28 mx-auto rounded-full bg-background border-2 flex items-center justify-center overflow-hidden ${
                  selectedBadge.isCheckedIn ? 'border-secondary' : 'border-outline-variant/30 grayscale opacity-70'
                }`}>
                  {selectedBadge.badgeImageUrl ? (
                    <img 
                      src={selectedBadge.badgeImageUrl} 
                      alt={selectedBadge.badgeName} 
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-all ${selectedBadge.isCheckedIn ? '' : 'grayscale opacity-35 bg-[#001c2a]'}`} 
                    />
                  ) : (
                    <span className="text-5.5xl select-none">
                      {selectedBadge.badgeIcon === 'castle' && '🏰'}
                      {selectedBadge.badgeIcon === 'forest' && '🌲'}
                      {selectedBadge.badgeIcon === 'museum' && '🏛️'}
                      {selectedBadge.badgeIcon === 'landscape' && '🏔️'}
                      {selectedBadge.badgeIcon === 'waves' && '🌊'}
                      {selectedBadge.badgeIcon === 'night_sight_auto' && '💫'}
                    </span>
                  )}
                </div>
              </div>

              {/* Title info */}
              <div className="space-y-1">
                <span className="text-[10px] text-secondary font-black uppercase tracking-wider block">
                  {selectedBadge.category}
                </span>
                <h3 className="font-headline text-xl font-bold text-on-surface">
                  Insignia: {selectedBadge.badgeName}
                </h3>
                <p className="text-xs text-on-surface-variant/90 font-medium">
                  Rango otorgado: <strong className="text-secondary">{selectedBadge.badgeTitle}</strong>
                </p>
              </div>

              {/* Description box */}
              <div className="p-4 bg-surface-container-high/40 rounded-xl border border-[#005049]/15 text-xs text-on-surface-variant leading-relaxed text-left space-y-2">
                <div className="flex justify-between items-center border-b border-[#005049]/10 pb-1.5 font-bold text-[10px] text-on-surface uppercase tracking-wider">
                  <span>Detalles de Monumento Geográfico</span>
                  <span className="text-secondary">+{selectedBadge.points} xp</span>
                </div>
                <p><span className="text-secondary font-semibold">Ubicación física:</span> {selectedBadge.city}</p>
                <p><span className="text-secondary font-semibold">Coordenadas del satélite:</span> {selectedBadge.latitude}, {selectedBadge.longitude}</p>
                <p className="italic text-on-surface-variant/80 border-t border-[#005049]/10 pt-1.5 leading-relaxed">
                  "{selectedBadge.review[0].slice(0, 160)}..."
                </p>
              </div>

              {/* Action Link inside modal */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="flex-1 py-2.5 bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-semibold rounded-lg text-xs"
                >
                  Cerrar
                </button>
                
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onExploreLocation(selectedBadge.id);
                  }}
                  className="flex-1 py-2.5 bg-secondary text-on-secondary font-bold rounded-lg text-xs hover:brightness-105 flex items-center justify-center gap-1 uppercase"
                >
                  <span>Ir a Ficha / GPS</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
