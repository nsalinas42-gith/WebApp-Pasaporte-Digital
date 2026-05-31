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
  onTriggerPhoto
}: DashboardViewProps) {
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
    mezquita_cordoba: 'Explora la asombrosa arquitectura de la Mezquita-Catedral.',
    acueducto_segovia: 'Un viaje a través del majestuoso acueducto romano.',
    alcazar_sevilla: 'Admira la fortaleza mudéjar y los bellos jardines.',
    sagrada_familia: 'Sumérgete en la silueta orgánica del modernismo catalán.',
    castillo_olite: 'Visita el castillo gótico real más fantástico de Navarra.'
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
              Explorador Digital
            </span>
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md tracking-tight leading-tight">
            Tu Pasaporte al Mundo
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-md leading-relaxed">
            Descubre el patrimonio histórico como nunca antes. Colecciona sellos digitales, desbloquea insignias exclusivas y forja tu propio camino a través de la historia.
          </p>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => onExploreLocation(nextDestination.id)}
              className="px-6 py-3 bg-secondary text-on-secondary rounded-xl font-extrabold flex items-center gap-2 hover:bg-secondary-fixed active:scale-95 transition-all glow-secondary cursor-pointer border-none outline-none"
            >
              <span>Empezar Aventura</span>
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
            Hola, Explorador
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant">
            Tu viaje digital continúa. Revisa tus estadísticas y próximos objetivos.
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
                Puntos Totales
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
                Tu Progreso
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {unlockedCount === totalCount ? (
                  <span>
                    ¡Felicitaciones! Has completado todas las insignias del mapa actual. Reclama tu <strong className="text-secondary font-bold">cNFT Colectivo</strong> de Solana abajo para sellar tu gesta.
                  </span>
                ) : (
                  <span>
                    ¡A mitad de camino! Completa el reto en <span className="text-tertiary font-bold">{nextDestination.name}</span> para alcanzar el siguiente nivel. Sigue explorando para desbloquear nuevas regiones y recompensas exclusivas.
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
            Inicia tu exploración
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Lista de rutas habilitadas en tu viaje digital. Haz click en iniciar para ver los monumentos en el mapa:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {locations.map((loc, idx) => (
            <div 
              key={loc.id} 
              onClick={() => onExploreLocation(loc.id)}
              className="glass-card rounded-xl overflow-hidden group cursor-pointer w-full flex flex-col hover:border-secondary/40 text-left"
            >
              <div className="h-44 relative overflow-hidden">
                <img 
                  alt={loc.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={loc.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h4 className="font-headline font-bold text-white text-base md:text-lg tracking-tight">
                    Ruta {idx + 1}: {loc.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant/90 font-medium mt-1 truncate">
                    {teaserMap[loc.id] || loc.category}
                  </p>
                </div>
              </div>
              <div className="p-4 mt-auto">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onExploreLocation(loc.id);
                  }}
                  className="w-full py-2.5 bg-secondary/15 hover:bg-secondary text-secondary hover:text-on-secondary rounded-lg font-bold flex items-center justify-center gap-2 transition-all outline-none"
                >
                  <span>Iniciar Ruta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INSIGNIAS RECIENTES SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-center text-left">
          <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface flex items-center gap-2">
            <Award className="w-6 h-6 text-secondary" />
            Insignias Recientes
          </h3>
          <button 
            onClick={() => onExploreLocation(locations[0].id)}
            className="text-secondary font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer outline-none bg-transparent border-none"
          >
            <span>Ver Colección Completa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Badges Grid displaying correct asset icons or fallbacks */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {locations.map((loc) => {
            const isUnlocked = loc.isCheckedIn;
            const completedCount = loc.places?.filter(p => p.isCheckedIn).length || 0;
            const requiredCount = getRequiredPlacesLimit(loc.id);
            return (
              <div 
                key={loc.id}
                onClick={() => onExploreLocation(loc.id)}
                className={`glass-card p-6 rounded-xl flex flex-col items-center group cursor-pointer border ${
                  isUnlocked ? 'border-tertiary/40' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all border-outline-variant/15'
                }`}
              >
                 <div className="w-20 h-20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <img 
                    src={loc.badgeImageUrl || badgeImageMap[loc.badgeIcon] || stampAlhambra} 
                    alt={loc.badgeName} 
                    referrerPolicy="no-referrer"
                    style={{ filter: isUnlocked ? "url(#remove-white)" : "url(#remove-white) grayscale(100%) opacity(0.35)" }}
                    className="w-full h-full object-contain transition-all drop-shadow-[0_0_10px_rgba(67,229,212,0.5)]" 
                  />
                </div>
                <p className="font-headline font-bold text-on-surface text-center text-xs truncate max-w-full leading-tight">
                  Insignia: {loc.badgeName}
                </p>
                <p className="font-sans text-[10px] text-on-surface-variant/70 text-center leading-normal">
                  {completedCount} de {requiredCount} fichas
                </p>
                <p className={`font-sans font-bold text-[10px] uppercase tracking-wider mt-1.5 ${
                  isUnlocked ? 'text-tertiary' : 'text-on-surface-variant/60'
                }`}>
                  {isUnlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}
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
              Solana Web3 Ledger Reward
            </span>
            <h4 className="font-headline text-lg font-bold text-on-surface">
              Completa las 6 Insignias y Reclama tu cNFT Colectivo
            </h4>
            <p className="text-xs text-on-surface-variant/80 leading-relaxed mt-0.5">
              Por tu espíritu andador urbano, la red Solana grabará tu estatus inmortal de embajador. Acuñado de forma segura con bajos costos de compresión directo a tu billetera personal vinculada.
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
                <span>Verificar Solscan Receipt</span>
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
                  <span>Acuñando cNFT Colectivo...</span>
                </>
              ) : (
                <>
                  {isEligibleForNFT ? <Sparkles className="w-3.5 h-3.5 animate-bounce" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Reclamar cNFT Colectivo ({unlockedCount}/6)</span>
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* 6. STATS METRICS BLOCK */}
      <section className="bg-surface-container border border-[#005049]/20 p-6 rounded-3xl text-left">
        <h4 className="font-headline text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest border-b border-on-surface/10 pb-2.5">
          Estadísticas de Exploración de Viaje
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
          {/* Item 1 */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/5 text-secondary border border-secondary/15 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase mb-0.5">REGIONES VISITADAS</p>
              <p className="text-xl font-headline font-black text-on-surface">0{stats.regionsVisited}</p>
            </div>
          </div>
          {/* Item 2 */}
          <div className="flex items-center gap-4 cursor-pointer hover:bg-secondary/5 p-1 rounded-xl transition-all" onClick={onTriggerPhoto}>
            <div className="p-3 rounded-xl bg-secondary/5 text-secondary border border-secondary/15 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase mb-0.5">MOMENTOS CAPTURADOS</p>
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
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase mb-0.5">LOGROS COMPARTIDOS</p>
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
                Compartir Pasaporte
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                Presume a tus amigos de tu avance histórico. Llevas <strong className="text-secondary">{unlockedCount} insignias de {totalCount}</strong> desbloqueadas con éxito.
              </p>
            </div>

            <div className="bg-background border border-secondary/10 p-2.5 rounded-lg flex items-center justify-between text-[11px] font-mono text-on-surface-variant/80 overflow-hidden">
              <span className="truncate mr-3">{window.location.href}</span>
              <button 
                onClick={copyShareLink}
                className="bg-secondary text-on-secondary px-3 py-1 rounded font-sans font-black text-[10px] uppercase outline-none select-none shrink-0"
              >
                {copiedLink ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 bg-[#001019] border border-on-surface-variant/20 hover:border-secondary/20 text-on-surface-variant hover:text-on-surface font-semibold rounded-lg text-xs transition-colors uppercase tracking-wide cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
