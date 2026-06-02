/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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
  const { t } = useLanguage();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute stats
  const unlockedCount = locations.filter(loc => loc.isCheckedIn).length;
  const totalCount = locations.length;
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

      {/* 2. STATS & PROGRESS segment */}
      <section className="w-full">
        {/* Title block */}
        <div className="w-full mb-8 text-left">
          <h2 className="font-headline text-2xl md:text-3.5xl font-extrabold text-on-surface mb-2">
            {t('hola_explorador')}
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant">
            {t('tu_viaje_continua')}
          </p>
        </div>

        {/* 30/70 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-6 items-stretch">
          {/* Puntos Totales Card (30%) */}
          <div className="md:col-span-3 glass-card p-8 rounded-xl flex flex-col justify-center gap-6 text-left relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/15">
              <Trophy className="w-8 h-8 text-secondary fill-secondary/5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none pb-2">
                {t('puntos_totales')}
              </p>
              <p className="font-headline text-4xl md:text-5xl font-black text-secondary tracking-tight">
                15,400
              </p>
            </div>
          </div>

          {/* Tu Progreso Card (70%) */}
          <div className="md:col-span-7 glass-card p-8 rounded-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none">
              <Shield className="w-32 h-32 text-on-surface" />
            </div>
            {/* SVG Progress Circle wrapper */}
            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center select-none">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  className="text-surface-container-highest" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="40" 
                  stroke="currentColor" 
                  strokeWidth="8"
                />
                <circle 
                  className="text-tertiary transition-transform duration-500" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="40" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeDasharray={`${strokeDasharray}`}
                  strokeDashoffset={`${strokeDashoffset}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline font-black text-3xl text-on-surface leading-none">{unlockedCount}/{totalCount}</span>
                <span className="text-[10px] font-black text-tertiary tracking-widest mt-1">INSIGNIAS</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface leading-none">
                {t('tu_progreso')}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
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
          {locations.map((loc, idx) => {
            const isLockedRouteState = lockedRouteIds.includes(loc.id);
            const isUnlocked = loc.isCheckedIn && !isLockedRouteState;
            const completedCount = isLockedRouteState ? 0 : (loc.places?.filter(p => p.isCheckedIn).length || 0);
            const requiredCount = getRequiredPlacesLimit(loc.id);
            return (
              <div 
                key={loc.id}
                onClick={() => {
                  if (isLockedRouteState) return;
                  onExploreLocation(loc.id);
                }}
                className={`glass-card p-4 sm:p-6 rounded-xl flex flex-col items-center group border ${
                  isLockedRouteState
                    ? 'opacity-40 cursor-not-allowed bg-black/25 border-error/5'
                    : isUnlocked ? 'border-tertiary/40 cursor-pointer' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all border-outline-variant/15 cursor-pointer'
                }`}
              >
                 <div className="w-20 h-20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 relative">
                  <img 
                    src={loc.badgeImageUrl || badgeImageMap[loc.badgeIcon] || stampAlhambra} 
                    alt={loc.badgeName} 
                    referrerPolicy="no-referrer"
                    style={{ filter: isUnlocked ? "url(#remove-white)" : "url(#remove-white) grayscale(100%) opacity(0.35)" }}
                    className="w-full h-full object-contain transition-all drop-shadow-[0_0_10px_rgba(67,229,212,0.5)]" 
                  />
                  {isLockedRouteState && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-secondary">
                      <Lock className="w-6 h-6 text-secondary" />
                    </div>
                  )}
                </div>
                 <p className="font-headline font-bold text-on-surface text-center text-xs truncate max-w-full leading-tight">
                  {isLockedRouteState ? 'BLOQUEADO' : t('insignia_prefix').replace('{name}', loc.badgeName)}
                </p>
                <p className="font-sans text-[10px] text-on-surface-variant/70 text-center leading-normal">
                  {isLockedRouteState ? '🔒' : t('de_fichas').replace('{completed}', String(completedCount)).replace('{required}', String(requiredCount))}
                </p>
                <p className={`font-sans font-bold text-[10px] uppercase tracking-wider mt-1.5 flex items-center gap-1 ${
                  isLockedRouteState ? 'text-[#8ba7b3]' : isUnlocked ? 'text-tertiary' : 'text-on-surface-variant/60'
                }`}>
                  {isLockedRouteState ? (
                    <>
                      <Lock className="w-3.5 h-3.5 inline text-[#8ba7b3]" />
                      <span>{t('bloqueado_caps')}</span>
                    </>
                  ) : isUnlocked ? t('desbloqueado_caps') : t('bloqueado_caps')}
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
