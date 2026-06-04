/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
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
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { Location } from '../types';
import { useLanguage } from '../translations';
import { calculateUserProgress, UnlockedBadgeState } from './GamificationEngine';

interface StampsViewProps {
  locations: Location[];
  onExploreLocation: (locationId: string) => void;
  onToggleCheckIn?: (locationId: string) => void;
}

export default function StampsView({ locations, onExploreLocation }: StampsViewProps) {
  const { t, translateLocation } = useLanguage();
  
  const { 
    unlockedBadges, 
    totalUniqueUnlocked, 
    overallCompletedPlaces,
    completedRoutesCount
  } = calculateUserProgress(locations);

  const [selectedBadge, setSelectedBadge] = useState<UnlockedBadgeState | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleShare = (platform: string, badgeState: UnlockedBadgeState) => {
    const badgeName = t(badgeState.badge.titleKey);
    const text = `¡Acabo de desbloquear la insignia "${badgeName}" (X${badgeState.multiplier}) en mi Bitácora Digital Pintamapas! 🗺️🚀`;
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
          triggerToast(t('copiado_exito'));
        })
        .catch(() => {
          triggerToast('Error.');
        });
    }
    setShowShareMenu(false);
  };

  // Check if supreme explorer is reached
  const isSupreme = totalUniqueUnlocked === 6;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Intro Header Stamp Album */}
      <div className="text-left space-y-2">
        <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2">
          <Layers className="w-6 h-6 text-secondary" />
          {t('insignias_digitales_title')}
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          {t('insignias_digitales_desc')}
        </p>
      </div>

      {/* Progress visualizer block */}
      <div className="bg-surface-container-high/40 border border-[#005049]/15 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <span className="text-[10px] text-secondary font-black uppercase tracking-widest block mb-1">
            {t('tu_cuenta_sello')}
          </span>
          <p className="font-headline text-lg font-bold text-on-surface">
            {t('canjeados_label').replace('{completed}', String(totalUniqueUnlocked)).replace('{total}', '6')}
          </p>
          <span className="text-[11px] font-mono text-on-surface-variant/70">
            Puntos obtenidos en fichas completadas ({overallCompletedPlaces}): <strong className="text-secondary">{overallCompletedPlaces * 500} XP</strong>
          </span>
        </div>

        {/* Dynamic quote */}
        <div className="text-left sm:text-right max-w-md">
          <p className="text-xs text-on-surface-variant italic leading-relaxed">
            {isSupreme 
              ? t('album_supremo_congrats') 
              : t('album_supremo_missing').replace('{num}', String(3000)) // general missing feedback 
            }
          </p>
          {!isSupreme && (
            <p className="text-[10px] text-secondary font-semibold font-mono mt-1">
              Rutas totalmente completadas: {completedRoutesCount} / 6
            </p>
          )}
        </div>
      </div>

      {/* Grid of Stamps Album matching the 6 base dynamic badges */}
      <main className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {unlockedBadges.map((badgeState) => {
          const { badge, isUnlocked, multiplier, progressPercent } = badgeState;

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badgeState)}
              className={`p-3 sm:p-4 rounded-xl border flex flex-col items-center text-center space-y-3 relative overflow-hidden transition-all duration-300 filter group cursor-pointer ${
                isUnlocked
                  ? 'bg-gradient-to-b from-surface-container to-surface-container-high border-secondary glow-mint hover:scale-[1.03] select-none'
                  : 'bg-surface-container-longest/40 border-outline-variant/15 opacity-60 hover:opacity-100 hover:scale-[1.01] hover:border-outline-variant/40'
              }`}
            >
              {/* Dynamic Multiplier / Lock Indicator */}
              <div className="absolute top-2 right-2">
                {isUnlocked ? (
                  <span className="bg-secondary text-on-secondary px-1.5 py-0.5 rounded-md text-[9px] font-black font-mono shadow-[0_0_8px_rgba(67,229,212,0.4)]">
                    X{multiplier}
                  </span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-on-surface-variant/40" />
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
                    src={badge.imageUrl} 
                    alt={t(badge.titleKey)} 
                    referrerPolicy="no-referrer"
                    style={{ filter: isUnlocked ? "url(#remove-white)" : "url(#remove-white) grayscale(100%) opacity(0.35)" }}
                    className="w-full h-full object-contain transition-all drop-shadow-[0_0_10px_rgba(67,229,212,0.6)]" 
                  />
                </motion.div>
              </div>

              {/* Title info */}
              <div className="space-y-1">
                <h4 className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-on-surface' : 'text-on-surface-variant/70'}`}>
                  {t(badge.titleKey)}
                </h4>
                <p className={`text-[9px] font-mono leading-none ${isUnlocked ? 'text-secondary font-bold' : 'text-on-surface-variant/50'}`}>
                  {isUnlocked 
                    ? `Certificado X${multiplier}` 
                    : `${progressPercent}% completado`
                  }
                </p>
              </div>

              {/* Unlocked / Locked tag badge */}
              {isUnlocked ? (
                <span className="text-[8px] bg-tertiary/10 border border-tertiary/20 text-tertiary px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                  {t('desbloqueado_caps')}
                </span>
              ) : (
                <span className="text-[8px] bg-surface-container-high border border-outline-variant/10 text-on-surface-variant/40 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                  {t('bloqueado_caps')}
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
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedBadge(null);
                setShowShareMenu(false);
                setToastMessage(null);
              }}
              className="absolute top-4 left-4 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
              title={t('cerrar_popup')}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Three Dots More Menu on the Top-Right */}
            <div className="absolute top-4 right-4 z-50">
              <button
                disabled={!selectedBadge.isUnlocked}
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`transition-colors p-1 rounded-full ${
                  selectedBadge.isUnlocked 
                    ? 'text-on-surface-variant hover:text-secondary hover:bg-surface-container-high cursor-pointer' 
                    : 'text-on-surface-variant/30 cursor-not-allowed'
                }`}
                title="Compartir"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Submenu for Sharing */}
              {showShareMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-2xl p-1.5 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-150 z-50">
                  <div className="px-2 py-1 text-[10px] font-black uppercase text-secondary tracking-widest border-b border-outline-variant/10 mb-1">
                    {t('compartir_logro')}
                  </div>
                  <button
                    onClick={() => handleShare('twitter', selectedBadge)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#005049]/15 text-on-surface flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-secondary" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>{t('en_twitter')}</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook', selectedBadge)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#005049]/15 text-on-surface flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-[#1877f2]" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg>
                    <span>{t('en_facebook')}</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp', selectedBadge)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#005049]/15 text-on-surface flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-[#25d366]" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.022-.014-.508-.25-1.01-.497-.33-.162-.43-.197-.43-.197s-.103-.122-.164-.203c-.04-.055-.043-.071-.059-.092 0 0-.056-.073-.089-.136s-.044-.136-.011-.203c.033-.061.163-.19.231-.26.241-.25.32-.34.39-.442.062-.093.078-.17s-.011-.264-.092-.387-.71-1.077-.736-1.117c-.02-.031-.055-.05-.091-.05H15.4c-.053 0-.083.012-.1.026s-.11.085-.157.135c-.157.172-.442.502-.442.502s-.019.022-.05.04c-.035.019-.074.019-.115 0a10.66 10.66 0 0 1-2.92-2.92c-.019-.035-.019-.074 0-.115.018-.031.04-.05.04-.05s.33-.285.502-.442c.05-.047.121-.11.135-.157s.026-.047.026-.1v-.015c0-.036-.019-.071-.05-.091-.04-.026-1.077-.71-1.117-.736s-.077-.04-.092-.092-.17-.07-.387-.092c-.102-.07-.19-.392-.442-.392c-.07 0-.199.168-.26.231s-.33.241-.502.442c-.05.157-.121.11-.135.157l.092.387c.247.502.497 1.01.497 1.01zm-5.45-8.38c4.385 0 7.95 3.565 7.95 7.95s-3.565 7.95-7.95 7.95-7.95-3.565-7.95-7.95 3.565-7.95 7.95-7.95M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.86L2.5 22.5l4.81-1.34c1.58.82 3.38 1.28 5.29 1.28 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                    </svg>
                    <span>{t('en_whatsapp')}</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy', selectedBadge)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#005049]/15 text-on-surface flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-secondary" />
                    <span>{t('copiar_enlace')}</span>
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
                className="relative w-[140px] h-[140px] mx-auto"
                style={{ perspective: 1200 }}
              >
                <div className={`absolute inset-0 rounded-full blur-xl opacity-35 bg-gradient-to-tr ${
                  selectedBadge.isUnlocked ? 'from-secondary to-tertiary' : 'hidden'
                }`} />
                <motion.div 
                  className="relative w-[140px] h-[140px] mx-auto flex items-center justify-center"
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{
                    scale: 1.2,
                    rotateY: [0, -180, 180, 0], // dramatic 3D interactive turnaround
                    transition: {
                      scale: { type: "spring", stiffness: 180, damping: 10 },
                      rotateY: { duration: 1.6, ease: "easeInOut" }
                    }
                  }}
                  animate={selectedBadge.isUnlocked ? {
                    scale: [1, 1.06, 1], // soft focus breath
                    rotateY: [0, -12, 12, 0], // soft premium rotation oscillation
                  } : {}}
                  transition={{
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotateY: { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <img 
                    src={selectedBadge.badge.imageUrl} 
                    alt={t(selectedBadge.badge.titleKey)} 
                    referrerPolicy="no-referrer"
                    style={{ filter: selectedBadge.isUnlocked ? "url(#remove-white)" : "url(#remove-white) grayscale(100%) opacity(0.35)" }}
                    className="w-full h-full object-contain transition-all drop-shadow-[0_0_15px_rgba(67,229,212,0.6)]" 
                  />
                </motion.div>
              </div>

              {/* Title info with dynamic progress details */}
              <div className="space-y-2 flex flex-col items-center text-left">
                <span className="text-[10px] text-secondary font-black uppercase tracking-widest block bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/15 mx-auto">
                  {t(selectedBadge.badge.subtitleKey)}
                </span>
                <h3 className="font-headline text-lg font-bold text-on-surface text-center w-full">
                  {t(selectedBadge.badge.titleKey)}
                </h3>
                
                <p className="text-xs text-on-surface-variant leading-relaxed text-center w-full whitespace-pre-line mt-1">
                  {selectedBadge.isUnlocked 
                    ? `¡Has desbloqueado esta medalla con un multiplicador de X${selectedBadge.multiplier}! Esto certifica que has alcanzado el grado correspondiente en la exploración.`
                    : `Para ganar esta medalla, debes completar al menos ${selectedBadge.badge.requiredChips} geolocalizaciones (fichas) en cualquiera de las 6 rutas activas del pasaporte.`
                  }
                </p>

                {/* Show routes earned */}
                {selectedBadge.isUnlocked && (
                  <div className="w-full bg-[#001c27] border border-[#005049]/20 p-3 rounded-xl space-y-2.5 mt-3">
                    <p className="text-[10.5px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-secondary" />
                      Rutas de desbloqueo ({selectedBadge.multiplier}/6)
                    </p>
                    <ul className="text-xs space-y-1.5 text-on-surface-variant font-medium">
                      {selectedBadge.unlockedRouteNames.map((routeName, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" />
                          <span className="truncate">{routeName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Show progress towards next unlock */}
                {!selectedBadge.isUnlocked && (
                  <div className="w-full bg-[#001c27] border border-outline-variant/10 p-3 rounded-xl mt-3 space-y-1.5 ">
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono">
                      <span>{t('progreso_label')}</span>
                      <span className="font-bold text-secondary">{selectedBadge.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1 w-full bg-[#000f16] rounded-full overflow-hidden">
                      <div 
                        className="bg-secondary h-full rounded-full transition-all duration-300"
                        style={{ width: `${selectedBadge.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[9.5px] text-on-surface-variant/70 italic text-center w-full">
                      (Nivel de fichas requerido: {selectedBadge.badge.requiredChips} en una sola ruta)
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    setShowShareMenu(false);
                    setToastMessage(null);
                  }}
                  className="flex-1 py-2.5 bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {t('cerrar_modal')}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    setShowShareMenu(false);
                    setToastMessage(null);
                    // Open the main route exploration view
                    onExploreLocation(locations[0]?.id || 'alhambra');
                  }}
                  className="flex-1 py-2.5 bg-secondary text-on-secondary font-bold rounded-lg text-xs hover:brightness-105 flex items-center justify-center gap-1 uppercase transition-all cursor-pointer"
                >
                  <span>{t('comenzar_exploracion')}</span>
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
