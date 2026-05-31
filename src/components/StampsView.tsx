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
  CheckCircle2,
  MoreVertical,
  Share2,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { Location } from '../types';

import stampAlhambra from '../assets/images/01-Badge explorador principiante.png';
import stampCordoba from '../assets/images/02-explorador intermedio.png';
import stampSegovia from '../assets/images/03- explorador avanzado.png';
import stampSevilla from '../assets/images/04-Cazador de rutas.png';
import stampSagrada from '../assets/images/05-Guia Local.png';
import stampOlite from '../assets/images/06-Guia Local Experto.png';

const badgeImageMap: Record<string, string> = {
  castle: stampAlhambra,
  mosque: stampCordoba,
  aqueduct: stampSegovia,
  fortress: stampSevilla,
  cathedral: stampSagrada,
  tower: stampOlite,
  forest: stampSegovia,
  museum: stampSevilla,
  landscape: stampAlhambra,
  waves: stampCordoba,
  night_sight_auto: stampSegovia,
};

export function getRequiredPlacesLimit(id: string): number {
  if (id === 'alhambra') return 1;
  if (id === 'mezquita_cordoba') return 2;
  if (id === 'acueducto_segovia') return 3;
  if (id === 'alcazar_sevilla') return 4;
  if (id === 'sagrada_familia') return 6;
  if (id === 'castillo_olite') return 8;
  return 8;
}

interface StampsViewProps {
  locations: Location[];
  onExploreLocation: (locationId: string) => void;
  onToggleCheckIn?: (locationId: string) => void;
}

export default function StampsView({ locations, onExploreLocation, onToggleCheckIn }: StampsViewProps) {
  const [selectedBadge, setSelectedBadge] = useState<Location | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleShare = (platform: string, badge: Location) => {
    const text = `¡Acabo de desbloquear la insignia "${badge.badgeName}" en el mapa de geolocalización! 🗺️🚀`;
    const url = window.location.href;

    if (platform === 'twitter') {
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      triggerToast('Abriendo X (Twitter)...');
    } else if (platform === 'facebook') {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      triggerToast('Abriendo Facebook...');
    } else if (platform === 'whatsapp') {
      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      triggerToast('Abriendo WhatsApp...');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${text} ${url}`)
        .then(() => {
          triggerToast('¡Copiado al portapapeles!');
        })
        .catch(() => {
          triggerToast('Error al copiar enlace.');
        });
    }
    setShowShareMenu(false);
  };

  const unlockedCount = locations.filter(loc => loc.isCheckedIn).length;
  const totalCount = locations.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Intro Header Stamp Album */}
      <div className="text-left space-y-2">
        <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2">
          <Layers className="w-6 h-6 text-secondary" />
          Insignias Digitales (Badges)
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Cada insignia se desbloquea de forma sucesiva según tu progreso verificado. Para obtener la insignia <strong>Explorador Principiante</strong> deberás completar la primera geolocalización de la ficha de ruta, y así sucesivamente (2 para intermedia, 3 para avanzada, 4 para cazador, 6 para guía y las 8 fichas para el guía experto experto) hasta coleccionar las 6 insignias.
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
          const completedCount = loc.places?.filter(p => p.isCheckedIn).length || 0;
          const requiredCount = getRequiredPlacesLimit(loc.id);

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

              {/* Stamp Graphic with beautiful 3D RotateY and Zoom with Motion */}
              <div 
                className="relative flex items-center justify-center my-1" 
                style={{ perspective: 1000 }}
              >
                <motion.div
                  className="w-16 h-16 flex items-center justify-center select-none"
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{
                    scale: 1.25,
                    rotateY: [0, -90, 90, 0], // beautiful half spin left to right, then center
                    transition: {
                      scale: { type: "spring", stiffness: 200, damping: 12 },
                      rotateY: { duration: 1.2, ease: "easeInOut" }
                    }
                  }}
                  animate={isUnlocked ? {
                    scale: [1, 1.05, 1], // continuous breathing zoom-in / zoom-out
                    rotateY: [0, -10, 10, 0], // continuous 3D sway left to right
                  } : {}}
                  transition={isUnlocked ? {
                    scale: {
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    rotateY: {
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  } : undefined}
                >
                  <img 
                    src={loc.badgeImageUrl || badgeImageMap[loc.badgeIcon] || stampAlhambra} 
                    alt={loc.badgeName} 
                    referrerPolicy="no-referrer"
                    style={{ filter: isUnlocked ? "url(#remove-white)" : "url(#remove-white) grayscale(100%) opacity(0.35)" }}
                    className="w-full h-full object-contain transition-all drop-shadow-[0_0_10px_rgba(67,229,212,0.6)]" 
                  />
                </motion.div>
              </div>

              <div className="space-y-1">
                <h4 className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-on-surface' : 'text-on-surface-variant/70'}`}>
                  Insignia: {loc.badgeName}
                </h4>
                <p className={`text-[10px] font-mono leading-none ${isUnlocked ? 'text-secondary font-bold' : 'text-on-surface-variant/50'}`}>
                  {completedCount} de {requiredCount} fichas
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
          <div className="w-full max-w-sm bg-surface-container border border-secondary p-6 rounded-2xl relative shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close Button (Moved left) */}
            <button
              onClick={() => {
                setSelectedBadge(null);
                setShowShareMenu(false);
                setToastMessage(null);
              }}
              className="absolute top-4 left-4 text-on-surface-variant hover:text-secondary transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Three Dots More Menu on the Top-Right */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="text-on-surface-variant hover:text-secondary transition-colors p-1 rounded-full hover:bg-surface-container-high"
                title="Compartir"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Submenu for Sharing */}
              {showShareMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-2xl p-1.5 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-150 z-50">
                  <div className="px-2 py-1 text-[10px] font-black uppercase text-secondary tracking-widest border-b border-outline-variant/10 mb-1">
                    Compartir Logro
                  </div>
                  <button
                    onClick={() => handleShare('twitter', selectedBadge)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#005049]/15 text-on-surface flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-secondary" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>En X (Twitter)</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook', selectedBadge)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#005049]/15 text-on-surface flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-[#1877f2]" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg>
                    <span>En Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp', selectedBadge)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#005049]/15 text-on-surface flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-[#25d366]" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.022-.014-.508-.25-1.01-.497-.33-.162-.43-.197-.43-.197s-.103-.122-.164-.203c-.04-.055-.043-.071-.059-.092 0 0-.056-.073-.089-.136s-.044-.136-.011-.203c.033-.061.163-.19.231-.26.241-.25.32-.34.39-.442.062-.093.078-.17s-.011-.264-.092-.387-.71-1.077-.736-1.117c-.02-.031-.055-.05-.091-.05H15.4c-.053 0-.083.012-.1.026s-.11.085-.157.135c-.157.172-.442.502-.442.502s-.019.022-.05.04c-.035.019-.074.019-.115 0a10.66 10.66 0 0 1-2.92-2.92c-.019-.035-.019-.074 0-.115.018-.031.04-.05.04-.05s.33-.285.502-.442c.05-.047.121-.11.135-.157s.026-.047.026-.1v-.015c0-.036-.019-.071-.05-.091-.04-.026-1.077-.71-1.117-.736s-.077-.04-.092-.092-.17-.07-.387-.092c-.102-.07-.19-.392-.442-.392c-.07 0-.199.168-.26.231s-.33.241-.502.442c-.05.157-.121.11-.135.157l.092.387c.247.502.497 1.01.497 1.01zm-5.45-8.38c4.385 0 7.95 3.565 7.95 7.95s-3.565 7.95-7.95 7.95-7.95-3.565-7.95-7.95 3.565-7.95 7.95-7.95M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.86L2.5 22.5l4.81-1.34c1.58.82 3.38 1.28 5.29 1.28 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                    </svg>
                    <span>En WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy', selectedBadge)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#005049]/15 text-on-surface flex items-center gap-2 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-secondary" />
                    <span>Copiar Enlace</span>
                  </button>
                </div>
              )}
            </div>

            {/* Floating Toast Alert in the modal */}
            {toastMessage && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {toastMessage}
              </div>
            )}

            {/* Modal Body */}
            <div className="space-y-6 text-center pt-4">
              
              {/* Big Sphere */}
              <div 
                className="relative w-[162px] h-[162px] mx-auto"
                style={{ perspective: 1200 }}
              >
                <div className={`absolute inset-0 rounded-full blur-xl opacity-35 bg-gradient-to-tr ${
                  selectedBadge.isCheckedIn ? 'from-secondary to-tertiary' : 'hidden'
                }`} />
                <motion.div 
                  className="relative w-[162px] h-[162px] mx-auto flex items-center justify-center cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{
                    scale: 1.2,
                    rotateY: [0, -180, 180, 0], // dramatic 3D interactive turnaround
                    transition: {
                      scale: { type: "spring", stiffness: 180, damping: 10 },
                      rotateY: { duration: 1.6, ease: "easeInOut" }
                    }
                  }}
                  animate={selectedBadge.isCheckedIn ? {
                    scale: [1, 1.06, 1], // soft focus breath
                    rotateY: [0, -12, 12, 0], // soft premium rotation oscillation
                  } : {}}
                  transition={{
                    scale: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    rotateY: {
                      duration: 5.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <img 
                    src={selectedBadge.badgeImageUrl || badgeImageMap[selectedBadge.badgeIcon] || stampAlhambra} 
                    alt={selectedBadge.badgeName} 
                    referrerPolicy="no-referrer"
                    style={{ filter: selectedBadge.isCheckedIn ? "url(#remove-white)" : "url(#remove-white) grayscale(100%) opacity(0.35)" }}
                    className="w-full h-full object-contain transition-all drop-shadow-[0_0_15px_rgba(67,229,212,0.6)]" 
                  />
                </motion.div>
              </div>

              {/* Title info with monument category removed and complete button added */}
              <div className="space-y-2 flex flex-col items-center">
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Insignia: {selectedBadge.badgeName}
                </h3>
                
                {/* Small completed button with ready icon */}
                <button
                  onClick={() => {
                    if (onToggleCheckIn) {
                      onToggleCheckIn(selectedBadge.id);
                      setSelectedBadge(prev => prev ? { ...prev, isCheckedIn: !prev.isCheckedIn } : null);
                      triggerToast(!selectedBadge.isCheckedIn ? '¡Insignia Completada!' : 'Insignia marcada como pendiente');
                    }
                  }}
                  className={`px-3 py-1 rounded-full flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
                    selectedBadge.isCheckedIn 
                      ? 'bg-secondary/20 border-secondary/40 text-secondary' 
                      : 'bg-surface-container-highest/70 border-outline-variant/30 text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                  style={{ fontSize: '9px' }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{selectedBadge.isCheckedIn ? 'Listo' : 'Marcar Listo'}</span>
                </button>
              </div>

              {/* Action Link inside modal (Monument Details Box is removed) */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    setShowShareMenu(false);
                    setToastMessage(null);
                  }}
                  className="flex-1 py-2.5 bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-semibold rounded-lg text-xs transition-colors"
                >
                  Cerrar
                </button>
                
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    setShowShareMenu(false);
                    setToastMessage(null);
                    onExploreLocation(selectedBadge.id);
                  }}
                  className="flex-1 py-2.5 bg-secondary text-on-secondary font-bold rounded-lg text-xs hover:brightness-105 flex items-center justify-center gap-1 uppercase transition-all"
                >
                  <span>Ir a GPS</span>
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
