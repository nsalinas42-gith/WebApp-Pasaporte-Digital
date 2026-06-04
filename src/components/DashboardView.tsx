/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { calculateUserProgress, BASE_GAMIFIED_BADGES } from './GamificationEngine';
import { 
  Trophy,
  Award, 
  Sparkles, 
  MapPin, 
  Compass, 
  ChevronRight,
  Shield,
  Clock,
  Camera,
  Share2,
  ExternalLink,
  Wallet,
  Activity,
  CheckCircle,
  HelpCircle,
  Lock,
  ArrowRight,
  Globe,
  Tv
} from 'lucide-react';
import { Location, UserProfile, UserStats } from '../types';
import { useLanguage } from '../translations';

import stampAlhambra from '../assets/images/01A_explorador_principiante.png';
import stampCordoba from '../assets/images/02B_explorador_intermedio.png';
import stampSegovia from '../assets/images/03C_explorador_avanzado.png';
import stampSevilla from '../assets/images/04D_Cazador_de_rutas.png';
import stampSagrada from '../assets/images/05E_Guia_Local.png';
import stampOlite from '../assets/images/06F_guia_local_experto.png';

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

function getRequiredPlacesLimit(id: string): number {
  if (id === 'alhambra') return 1;
  if (id === 'mezquita_cordoba') return 2;
  if (id === 'acueducto_segovia') return 3;
  if (id === 'alcazar_sevilla') return 4;
  if (id === 'sagrada_familia') return 6;
  if (id === 'castillo_olite') return 8;
  return 8;
}

interface DashboardViewProps {
  user: UserProfile;
  locations: Location[];
  stats: UserStats;
  onExploreLocation: (locationId: string) => void;
  onClaimNFT: () => void;
  isNFTClaimed: boolean;
  isLoadingClaim: boolean;
  txHash: string | null;
  onIncrementShare: () => void;
  onTriggerPhoto: () => void;
  lockedRouteIds?: string[];
}

export default function DashboardView({
  user,
  locations,
  stats,
  onExploreLocation,
  onClaimNFT,
  isNFTClaimed,
  isLoadingClaim,
  txHash,
  onIncrementShare,
  onTriggerPhoto,
  lockedRouteIds = []
}: DashboardViewProps) {
  const { t, translateLocation } = useLanguage();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute stats dynamically from the Gamification Engine
  const { 
    totalXP, 
    level, 
    xpInLevel, 
    xpToNextLevel, 
    percentageToNextLevel, 
    unlockedBadges, 
    totalUniqueUnlocked, 
    overallCompletedPlaces,
    completedRoutesCount 
  } = calculateUserProgress(locations);

  const unlockedCount = totalUniqueUnlocked;
  const totalCount = 6;
  const globalProgressPercent = Math.round((unlockedCount / totalCount) * 100);
  const isEligibleForNFT = unlockedCount === totalCount;

  // Find next/recommended destination
  const nextDestination = locations.find(loc => loc.id === 'castillo_olite') || locations.find(loc => !loc.isCheckedIn) || locations[0];

  const handleShareClick = () => {
    setShowShareModal(true);
    onIncrementShare();
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Teasers for dynamic locations mapped inside "Inicia tu exploración"
  const teaserMap: Record<string, string> = {
    alhambra: 'Mapa casco histórico de Caracas vol.1 ver. 1.0',
    mezquita_cordoba: 'Mapa casco histórico de Caracas vol.2 ver. 2.0',
    acueducto_segovia: 'Mapa casco histórico de Caracas vol.3 ver. 3.0',
    alcazar_sevilla: 'Mapa casco histórico de Caracas vol.4 ver. 4.0',
    sagrada_familia: 'Mapa casco histórico de Caracas vol.5 ver. 5.0',
    castillo_olite: 'Mapa casco histórico de Caracas vol.6 ver. 6.0'
  };

  // SVG Progress circle values
  const strokeDasharray = 251.327; // 2 * pi * 40
  const progressPercent = (unlockedCount / totalCount) * 100;
  const strokeDashoffset = strokeDasharray - (progressPercent / 100) * strokeDasharray;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Styles Injection for specific Glass design features */}
      <style>{`
        .glass-card {
          background: rgba(26, 56, 72, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(67, 229, 212, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          border-color: rgba(67, 229, 212, 0.45);
          box-shadow: 0 0 24px rgba(67, 229, 212, 0.08);
          transform: translateY(-2px);
        }
        .glow-secondary {
          box-shadow: 0 0 15px rgba(67, 229, 212, 0.25);
        }
      `}</style>

      {/* 1. HERO BLOCK */}
      <section className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-on-secondary-fixed-variant/40 group shadow-lg">
        <img 
          alt="Hero image for digital tourist passport" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsQHg6caflVmaOx_rC9dOwHEJHyEVhQh5QkG7Ji8dxOpM1KCEk4a3U5HP5WbbMyKIe8A72_S33rtiaOqMUbFZZ72nYi8SmxJrNZoMLP3je81iFDfdjt0l_ElNTbGkIj2HOL8w2DNHu6Qsm504T3iOeYuQaZc_l9DOF0f6QVoXjXjPpqfEij6Pvf6jq8a9--yoyFMPClrr_T8uNx5wW7ftfAFksc5HDdmaHBWx01KMeHdm_4r4ovtd-n65oZv46Pop-Qiq0fZVo7nK-"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent"></div>
        <div className="absolute inset-0 bg-black/25"></div>
        <div className="relative h-full flex flex-col justify-center px-8 md:px-12 max-w-2xl text-left">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-[2px] w-12 bg-secondary/85"></span>
            <span className="text-[11px] font-black leading-none text-secondary tracking-[0.2em] uppercase font-sans">
              {t('explorador_digital')}
            </span>
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md tracking-tight leading-tight">
            {t('tu_pasaporte_al_mundo')}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-md leading-relaxed">
            {t('tu_pasaporte_desc')}
          </p>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => onExploreLocation(nextDestination.id)}
              className="px-6 py-3 bg-secondary text-on-secondary rounded-xl font-extrabold flex items-center gap-2 hover:bg-secondary-fixed active:scale-95 transition-all glow-secondary cursor-pointer border-none outline-none"
            >
              <span>{t('empezar_aventura')}</span>
              <Compass className="w-4 h-4 animate-spin-slow" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 p-8 hidden sm:flex">
          <div className="flex items-center gap-4 text-secondary/40 select-none">
            <Globe className="w-8 h-8" />
            <Tv className="w-8 h-8" />
          </div>
        </div>
      </section>
      {/* 3. INICIA TU EXPLORACIÓN SECTION */}
      <section className="w-full space-y-6">
        <div className="text-left">
          <h2 className="font-headline text-xl md:text-2xl font-black text-on-surface">
            {t('inicia_tu_exploracion')}
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            {t('inicia_tu_exploracion_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {locations.map((loc, idx) => {
            const isLockedRouteState = lockedRouteIds.includes(loc.id);
            return (
              <div 
                key={loc.id} 
                onClick={() => {
                  if (isLockedRouteState) return;
                  onExploreLocation(loc.id);
                }}
                className={`glass-card rounded-xl overflow-hidden group w-full flex flex-col text-left transition-all ${
                  isLockedRouteState
                    ? 'opacity-40 cursor-not-allowed bg-black/25 relative border-error/5'
                    : 'cursor-pointer hover:border-secondary/40'
                }`}
              >
                <div className="h-44 relative overflow-hidden">
                  <img 
                    alt={loc.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${!isLockedRouteState ? 'group-hover:scale-105' : ''}`} 
                    src={loc.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                  
                  {isLockedRouteState && (
                    <div className="absolute top-3 right-3 bg-black/75 border border-[#8ba7b3]/40 p-2 rounded-full text-secondary shadow-md animate-pulse">
                      <Lock className="w-5 h-5" />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="font-headline font-bold text-white text-base md:text-lg tracking-tight flex items-center gap-1.5">
                      {isLockedRouteState && <Lock className="w-4 h-4 text-secondary shrink-0" />}
                      {t('ruta_label').replace('{num}', String(idx + 1))}: {isLockedRouteState ? 'BLOQUEADO' : loc.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant/90 font-medium mt-1 truncate">
                      {isLockedRouteState ? 'Sección bloqueada por administración' : (teaserMap[loc.id] || loc.category)}
                    </p>
                  </div>
                </div>
                <div className="p-4 mt-auto">
                  <button 
                    disabled={isLockedRouteState}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLockedRouteState) return;
                      onExploreLocation(loc.id);
                    }}
                    className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all outline-none ${
                      isLockedRouteState
                        ? 'bg-black/25 text-on-surface-variant/40 cursor-not-allowed border border-on-surface-variant/10'
                        : 'bg-secondary/15 hover:bg-secondary text-secondary hover:text-on-secondary cursor-pointer'
                    }`}
                  >
                    {isLockedRouteState ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t('bloqueado_caps')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('iniciar_ruta')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. INSIGNIAS RECIENTES SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-center text-left">
          <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface flex items-center gap-2">
            <Award className="w-6 h-6 text-secondary" />
            {t('insignias_recientes')}
          </h3>
          <button 
            onClick={() => onExploreLocation(locations[0].id)}
            className="text-secondary font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer outline-none bg-transparent border-none"
          >
            <span>{t('ver_coleccion_completa')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Badges Grid displaying correct asset icons or fallbacks */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {unlockedBadges.map((badgeState) => {
            const { badge, isUnlocked, multiplier, progressPercent } = badgeState;
            return (
              <div 
                key={badge.id}
                onClick={() => onExploreLocation(locations[0].id)}
                className={`glass-card p-4 sm:p-5 rounded-xl flex flex-col items-center group border transition-all ${
                  isUnlocked ? 'border-tertiary/40 cursor-pointer' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all border-outline-variant/15 cursor-pointer'
                }`}
              >
                 <div className="w-20 h-20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 relative">
                  <img 
                    src={badge.imageUrl} 
                    alt={t(badge.titleKey)} 
                    referrerPolicy="no-referrer"
                    style={{ filter: isUnlocked ? "url(#remove-white)" : "url(#remove-white) grayscale(100%) opacity(0.35)" }}
                    className="w-full h-full object-contain transition-all drop-shadow-[0_0_10px_rgba(67,229,212,0.5)]" 
                  />
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-1.5 py-0.5 rounded-md text-[9px] font-black font-mono shadow-[0_0_8px_rgba(67,229,212,0.4)]">
                      X{multiplier}
                    </div>
                  )}
                </div>
                 <p className="font-headline font-bold text-on-surface text-center text-xs truncate max-w-full leading-tight">
                  {t(badge.titleKey)}
                </p>
                <p className="font-sans text-[10px] text-on-surface-variant/70 text-center leading-normal">
                  {isUnlocked ? `Certificado: X${multiplier}` : `${progressPercent}% completado`}
                </p>
                <p className={`font-sans font-bold text-[10px] uppercase tracking-wider mt-1.5 flex items-center gap-1 ${
                  isUnlocked ? 'text-tertiary' : 'text-on-surface-variant/60'
                }`}>
                  {isUnlocked ? t('desbloqueado_caps') : t('bloqueado_caps')}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. INTERACTIVE SOLANA WEB3 PORTAL */}
      <section id="campaign-nft-claim-row" className="bg-gradient-to-tr from-[#001d2a] to-[#003732] border border-secondary/20 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
        {/* Subtle pulsating backdrop beam */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

        <div className="flex items-center gap-4 text-left max-w-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#001019] border border-secondary/35 flex items-center justify-center text-3xl select-none shadow-md hidden sm:flex shrink-0">
            💎
          </div>
          <div>
            <span className="bg-secondary/15 text-secondary text-[9px] font-black px-2.5 py-0.5 rounded-full border border-secondary/20 uppercase tracking-widest block max-w-max mb-1.5">
              {t('solana_reward')}
            </span>
            <h4 className="font-headline text-lg font-bold text-on-surface">
              {t('completa_cnft_title')}
            </h4>
            <p className="text-xs text-on-surface-variant/80 leading-relaxed mt-0.5">
              {t('completa_cnft_desc')}
            </p>
          </div>
        </div>

        {/* Claim actions controls */}
        <div className="shrink-0 w-full md:w-auto space-y-2">
          {isNFTClaimed ? (
            <div className="space-y-1.5 text-right">
              <a
                href={`https://solscan.io/tx/${txHash || '3G14p87Qv...'}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full md:w-auto px-6 py-3 bg-secondary/10 border border-secondary/30 text-secondary font-bold rounded-xl items-center justify-center gap-2 text-xs uppercase cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t('verificar_receipt')}</span>
              </a>
              <p className="text-[10px] text-center text-on-surface-variant/60 italic font-mono select-all">
                TX: {txHash?.slice(0, 8)}...{txHash?.slice(-8)}
              </p>
            </div>
          ) : (
            <button
              onClick={onClaimNFT}
              disabled={!isEligibleForNFT || isLoadingClaim}
              className={`w-full md:w-auto px-8 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all cursor-pointer outline-none ${
                isEligibleForNFT 
                  ? isLoadingClaim 
                    ? 'bg-secondary/10 border border-secondary text-secondary cursor-wait'
                    : 'bg-secondary text-on-secondary hover:brightness-105 active:scale-95 shadow-[0_0_12px_rgba(67,229,212,0.25)]'
                  : 'bg-[#43e5d4]/5 border border-[#43e5d4]/15 text-secondary/30 cursor-not-allowed opacity-50'
              }`}
            >
              {isLoadingClaim ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
                  <span>{t('acuñando_cnft')}</span>
                </>
              ) : (
                <>
                  {isEligibleForNFT ? <Sparkles className="w-3.5 h-3.5 animate-bounce" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{t('reclamar_cnft_btn').replace('{unlocked}', String(unlockedCount))}</span>
                </>
              )}
            </button>
          )}
        </div>
      </section>
      {/* Title block */}
      <div className="w-full text-left mt-8 mb-6">
        <h2 className="font-headline text-2xl md:text-3.5xl font-extrabold text-on-surface mb-2">
          {t('hola_explorador')}
        </h2>
        <p className="text-sm md:text-base text-on-surface-variant">
          {t('tu_viaje_continua')}
        </p>
      </div>

      {/* Moved Stacked Row Layout (Puntos Totales & Tu Progreso) */}
      <div className="flex flex-col gap-6 items-stretch w-full">
        {/* Puntos Totales Card (Full Row) */}
        <div className="glass-card p-6 sm:p-8 rounded-xl flex flex-row items-center gap-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.02] select-none pointer-events-none">
            <Trophy className="w-32 h-32 text-on-surface" />
          </div>
          <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/15 shrink-0">
            <Trophy className="w-8 h-8 text-secondary fill-secondary/5" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest leading-none pb-1.5">
              {t('puntos_totales')}
            </p>
            <p className="font-headline text-4xl sm:text-5xl font-black text-secondary tracking-tight leading-none">
              {totalXP.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tu Progreso Card (Full Row) */}
        <div className="glass-card p-6 sm:p-8 rounded-xl flex flex-col gap-6 relative overflow-hidden text-left w-full">
          <div className="absolute top-0 right-0 p-4 opacity-[0.02] select-none pointer-events-none">
            <Shield className="w-48 h-48 text-on-surface" />
          </div>

          {/* Header Area of Progress Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-secondary/10">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fe014f] animate-pulse" />
                <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface leading-none">
                  {t('tu_progreso')}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-xl">
                {unlockedCount === totalCount ? (
                  <span>
                    {t('progreso_completo_desc')}
                  </span>
                ) : (
                  <span>
                    {t('progreso_incompleto_desc').replace('{dest}', nextDestination.name)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 6 circulos pequeños (Rutas) */}
          <div className="py-4 border-b border-on-secondary-fixed-variant/40">
            <h4 className="font-headline text-xs font-black uppercase tracking-wider text-[#8ba7b3] mb-6 text-center sm:text-left">
              Progreso de Insignias por Ruta
            </h4>
            
            <div className="grid grid-cols-3 sm:flex sm:flex-row sm:justify-between gap-6 items-center w-full">
              {locations.slice(0, 6).map((loc, idx) => {
                const completedCount = loc.places ? loc.places.filter(p => p.isCheckedIn).length : 0;
                // Badges unlocked in this route
                const badgesUnlockedInRoute = BASE_GAMIFIED_BADGES.filter(b => completedCount >= b.requiredChips).length;
                const routeProgressPercent = (badgesUnlockedInRoute / 6) * 100;

                // SVG calculations
                const smallRadius = 18;
                const smallCircumference = 2 * Math.PI * smallRadius;
                const smallOffset = smallCircumference - (routeProgressPercent / 100) * smallCircumference;

                return (
                  <div key={loc.id} className="flex flex-col items-center gap-2 group flex-1">
                    {/* Route Label - V1 to V6 */}
                    <div className="relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-headline text-xs font-black transition-all ${
                        badgesUnlockedInRoute > 0 
                          ? 'bg-[#fe014f] text-white shadow-[0_0_10px_rgba(254,1,79,0.6)] scale-110 font-bold' 
                          : 'bg-surface-container-highest text-[#8ba7b3] border border-secondary/10'
                      }`} title={loc.name}>
                        V{idx + 1}
                      </div>
                    </div>

                    {/* Small Progress Ring */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                        <defs>
                          <linearGradient id={`roseGradient-${loc.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fe014f" />
                            <stop offset="100%" stopColor="#ff5e62" />
                          </linearGradient>
                        </defs>
                        {/* Background ring */}
                        <circle 
                          cx="22" 
                          cy="22" 
                          r={smallRadius} 
                          fill="transparent" 
                          stroke="rgba(254, 1, 79, 0.12)" 
                          strokeWidth="4"
                        />
                        {/* Progress ring */}
                        <circle 
                          cx="22" 
                          cy="22" 
                          r={smallRadius} 
                          fill="transparent" 
                          stroke={`url(#roseGradient-${loc.id})`} 
                          strokeWidth="4" 
                          strokeDasharray={`${smallCircumference}`}
                          strokeDashoffset={`${smallOffset}`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      {/* Badge counter */}
                      <span className="absolute text-[8px] font-mono font-black text-white/90">
                        {badgesUnlockedInRoute}/6
                      </span>
                    </div>

                    {/* Short label underneath */}
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-on-surface truncate line-clamp-1 max-w-[80px] block" title={loc.name}>
                        Vol. {idx + 1}
                      </span>
                      <span className="text-[8px] font-mono text-[#8ba7b3]/60 block">
                        {completedCount}/8 Mon.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Circulo Principal (Gran Circulo) */}
          <div className="py-6 flex flex-col items-center justify-center gap-4 w-full border-b border-on-secondary-fixed-variant/40">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center select-none bg-surface-container-low/40 rounded-full border border-secondary/5 shadow-2xl">
              <svg className="w-[90%] h-[90%] transform -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="mainRoseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fe014f" />
                    <stop offset="100%" stopColor="#ff5e62" />
                  </linearGradient>
                  {/* Drop shadow filter to give that rich overlay effect */}
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#fe014f" floodOpacity="0.4" />
                  </filter>
                </defs>
                {/* Background ring */}
                <circle 
                  className="text-surface-container-highest" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="40" 
                  stroke="rgba(254, 1, 79, 0.15)" 
                  strokeWidth="8.5"
                />
                {/* Progress ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="40" 
                  stroke="url(#mainRoseGradient)" 
                  strokeWidth="8.5" 
                  strokeDasharray={`${strokeDasharray}`}
                  strokeDashoffset={`${strokeDashoffset}`}
                  strokeLinecap="round"
                  filter="url(#shadow)"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              {/* Inside the circle: counter 0/6 insignias and label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {/* Visual arrow indicator matching the Apple Fitness vibe */}
                <span className="text-[#fe014f] text-2xl font-black mb-1 animate-pulse">➔</span>
                
                <span className="font-headline font-black text-2xl sm:text-3xl text-white leading-none tracking-tight">
                  {unlockedCount}/{totalCount}
                </span>
                <span className="text-[8px] sm:text-[9px] font-black text-[#fe014f] tracking-widest mt-1 uppercase">
                  Insignias
                </span>
              </div>
            </div>
            
            <div className="text-center max-w-sm space-y-1">
              <p className="font-headline font-black text-sm text-white">
                Progreso General de Logros
              </p>
              <p className="text-xs text-[#8ba7b3]">
                Has desbloqueado {unlockedCount} de 6 insignias del Catastro Histórico de Caracas.
              </p>
            </div>
          </div>

          {/* Dynamic XP Journey Track from 0 to 24000 XP */}
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-end text-xs font-bold text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
                <span className="font-headline text-[10px] sm:text-xs font-black uppercase tracking-wider text-secondary">Ruta de Nivel & Experiencia (XP)</span>
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-tertiary">
                {totalXP.toLocaleString()} / 24,000 XP total
              </span>
            </div>

            <div className="relative w-full h-8 bg-surface-container-highest/40 rounded-xl border border-secondary/15 p-1 flex items-center overflow-visible select-none shadow-inner mt-4">
              {/* Milestones / Tick Marks */}
              <div className="absolute inset-x-0 inset-y-0 flex justify-between px-6 pointer-events-none">
                {[0, 4000, 8000, 12000, 16000, 20000, 24000].map((milestone) => {
                  const isReached = totalXP >= milestone;
                  return (
                    <div key={milestone} className="relative h-full flex flex-col justify-center items-center">
                      <div className={`w-2 h-2 rounded-full border transition-all duration-500 z-10 ${
                        isReached 
                          ? 'bg-secondary border-secondary shadow-[0_0_8px_rgba(67,229,212,0.6)]' 
                          : 'bg-surface-container-low border-on-surface-variant/20'
                      }`} />
                      <span className={`absolute -bottom-5 font-mono text-[8px] font-black tracking-tight ${
                        isReached ? 'text-secondary font-extrabold' : 'text-on-surface-variant/40'
                      }`}>
                        {milestone === 0 ? '0' : milestone === 24000 ? '24K' : `${milestone / 1000}K`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Glowing progress fill back-bar */}
              <div 
                className="bg-gradient-to-r from-secondary/40 via-secondary/70 to-[#319795] h-full rounded-lg transition-all duration-500 shadow-[0_0_12px_rgba(67,229,212,0.15)]"
                style={{ width: `${Math.min(100, (totalXP / 24000) * 100)}%` }}
              />

              {/* Dynamic floating Locator pin */}
              <div 
                className="absolute -top-7 transform -translate-x-1/2 transition-all duration-500 z-20 pointer-events-none"
                style={{ left: `${Math.min(100, (totalXP / 24000) * 100)}%` }}
              >
                <div className="bg-[#43e5d4] text-[#003732] flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase shadow-[0_4px_12px_rgba(67,229,212,0.35)] animate-bounce" style={{ animationDuration: '2.5s' }}>
                  <span>Nivel {level}</span>
                </div>
                <div className="w-2 h-2 bg-[#43e5d4] rotate-45 mx-auto -mt-1 shadow-md" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 6. STATS METRICS BLOCK */}
      <section className="bg-surface-container border border-[#005049]/20 p-6 rounded-3xl text-left">
        <h4 className="font-headline text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest border-b border-on-surface/10 pb-2.5">
          {t('estadisticas_exploracion')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
          {/* Item 1 */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/5 text-secondary border border-secondary/15 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase mb-0.5">{t('regiones_visitadas_uppercase')}</p>
              <p className="text-xl font-headline font-black text-on-surface">0{stats.regionsVisited}</p>
            </div>
          </div>
          {/* Item 2 */}
          <div className="flex items-center gap-4 cursor-pointer hover:bg-secondary/5 p-1 rounded-xl transition-all" onClick={onTriggerPhoto}>
            <div className="p-3 rounded-xl bg-secondary/5 text-secondary border border-secondary/15 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase mb-0.5">{t('momentos_capturados_uppercase')}</p>
              <p className="text-xl font-headline font-black text-on-surface">
                {stats.momentsCaptured < 10 ? `0${stats.momentsCaptured}` : stats.momentsCaptured} 📸
              </p>
            </div>
          </div>
          {/* Item 3 */}
          <div className="flex items-center gap-4 cursor-pointer hover:bg-secondary/5 p-1 rounded-xl transition-all" onClick={handleShareClick}>
            <div className="p-3 rounded-xl bg-secondary/5 text-secondary border border-secondary/15 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase mb-0.5">{t('logros_compartidos_uppercase')}</p>
              <p className="text-xl font-headline font-black text-on-surface">
                {stats.sharedAchievements < 10 ? `0${stats.sharedAchievements}` : stats.sharedAchievements}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHARE MODAL BOX */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 bg-[#001e2c] border border-secondary/30 rounded-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-1">
              <Share2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-headline text-lg font-bold text-on-surface">
                {t('compartir_pasaporte_title')}
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                {t('compartir_pasaporte_desc').replace('{unlocked}', String(unlockedCount)).replace('{total}', String(totalCount))}
              </p>
            </div>

            <div className="bg-background border border-secondary/10 p-2.5 rounded-lg flex items-center justify-between text-[11px] font-mono text-on-surface-variant/80 overflow-hidden">
              <span className="truncate mr-3">{window.location.href}</span>
              <button 
                onClick={copyShareLink}
                className="bg-secondary text-on-secondary px-3 py-1 rounded font-sans font-black text-[10px] uppercase outline-none select-none shrink-0"
              >
                {copiedLink ? t('copiado') : t('copiar')}
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 bg-[#001019] border border-on-surface-variant/20 hover:border-secondary/20 text-on-surface-variant hover:text-on-surface font-semibold rounded-lg text-xs transition-colors uppercase tracking-wide cursor-pointer"
            >
              {t('cerrar_modal')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
