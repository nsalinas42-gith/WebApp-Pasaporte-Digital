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
  Lock
} from 'lucide-react';
import { Location, UserProfile, UserStats } from '../types';

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

  // Find next/recommended destination (e.g., Castillo de Olite if locked, or first locked item)
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

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* 1. HERO BANNER CARD (Tu Pasaporte al Mundo) */}
      <section 
        id="hero-passport-card" 
        className="relative overflow-hidden rounded-3xl border border-[#005049]/35 bg-gradient-to-tr from-[#001019] via-[#002332] to-[#012d3d] h-[340px] md:h-[300px] flex items-center p-6 md:p-10 shadow-[0_4px_30px_rgba(67,229,212,0.04)]"
      >
        {/* Architectural / holographic background overlay */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-screen bg-center bg-cover pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80')" }}></div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#001019]/90 to-transparent z-0 pointer-events-none"></div>

        {/* Right floating holographic passport/globe decor */}
        <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 z-10 opacity-10 md:opacity-40 select-none pointer-events-none">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-secondary/20 animate-pulse-slow"></div>
            <div className="absolute inset-4 rounded-full border border-dashed border-secondary/15 animate-spin" style={{ animationDuration: '40s' }}></div>
            <Compass className="w-24 h-24 text-secondary/30" />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-secondary/40 tracking-widest uppercase">
              DIGITAL PASSPORT
            </div>
          </div>
        </div>

        {/* Content detail */}
        <div className="relative z-20 max-w-xl space-y-4 text-left">
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-[#43e5d4]/80"></div>
            <span className="text-[11px] font-black uppercase text-secondary tracking-widest">
              EXPLORADOR DIGITAL
            </span>
          </div>

          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
            Tu Pasaporte al Mundo
          </h2>

          <p className="text-xs md:text-sm text-on-surface-variant/90 leading-relaxed max-w-lg">
            Descubre el patrimonio histórico como nunca antes. Colecciona sellos digitales, desbloquea insignias exclusivas y forja tu propio camino a través de la historia.
          </p>

          <button 
            onClick={() => onExploreLocation(nextDestination.id)}
            className="px-6 py-3.5 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(67,229,212,0.25)] hover:scale-[1.02] transform active:scale-95 transition-all flex items-center gap-2 cursor-pointer outline-none"
          >
            <span>Empezar Aventura</span>
            <Sparkles className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </section>

      {/* 2. GREETING & POINTS DECK BAR */}
      <section id="greeting-points-bar" className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h2 className="font-headline text-3xl md:text-4xl font-black text-on-surface">
            Hola, Explorador
          </h2>
          <p className="text-sm text-on-surface-variant/80">
            Tu viaje digital por el patrimonio histórico continúa.
          </p>
        </div>

        {/* Total Points Badge */}
        <div className="flex items-center gap-4 bg-[#0d2d3d]/60 border border-[#005049]/30 rounded-2xl p-4 min-w-[240px] shadow-sm select-none">
          <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-secondary fill-secondary/5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-on-surface-variant/65 uppercase tracking-widest leading-none pb-1.5">
              PUNTOS TOTALES
            </p>
            <p className="font-headline text-2xl font-black text-secondary tracking-tight">
              15,400
            </p>
          </div>
        </div>
      </section>

      {/* 3. COLUMNS BENTO DECK: PROGRESS VS RECOMMENDATION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Tu Progreso (col-span-5) */}
        <div className="lg:col-span-4 bg-surface-container border border-[#005049]/20 p-6 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 relative overflow-hidden">
          {/* Subtle watermark shield back */}
          <div className="absolute -top-10 -left-10 opacity-[0.03] text-on-surface-variant select-none pointer-events-none">
            <Shield className="w-48 h-48" />
          </div>

          <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider relative z-10 self-start">
            Tu Progreso
          </h3>

          {/* SVG Progress Gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                className="stroke-[#001019]"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                className="stroke-secondary"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - unlockedCount / totalCount)}`}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(67,229,212,0.3))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
              <span className="font-headline text-3xl font-black text-on-surface tracking-tight">3/6</span>
              <span className="text-[9px] font-black text-secondary tracking-widest uppercase">INSIGNIAS</span>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant/90 leading-relaxed max-w-[240px] relative z-10">
            ¡Estás a mitad de camino! Completa <span className="text-secondary font-bold">Castillo de Olite</span> para el siguiente nivel.
          </p>
        </div>

        {/* Right Card: Next Destination Recommendation (col-span-7) */}
        <div className="lg:col-span-8 bg-surface-container border border-[#005049]/20 rounded-3xl overflow-hidden relative flex flex-col justify-between h-[360px] md:h-auto min-h-[300px]">
          {/* Main Background Image with Gradient Mask */}
          <div className="absolute inset-0 z-0">
            <img 
              src={nextDestination.imageUrl} 
              alt={nextDestination.name}
              className="w-full h-full object-cover select-none"
            />
            {/* Rich cinematic dark shadow overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#001019]/90 via-[#001019]/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#001019] via-transparent to-transparent"></div>
          </div>

          {/* Top Label Tag */}
          <div className="relative z-10 p-5 flex justify-between items-start">
            <span className="inline-flex items-center gap-1.5 bg-[#43e5d4]/10 text-secondary text-[10px] font-extrabold px-3 py-1 rounded-full border border-secondary/25 uppercase tracking-wider backdrop-blur-md">
              🔥 RECOMENDADO
            </span>
          </div>

          {/* Content Overlays */}
          <div className="relative z-10 p-6 md:p-8 text-left space-y-4 max-w-xl mt-auto">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-secondary/90 tracking-widest leading-none">
                PRÓXIMO DESTINO
              </p>
              <h3 className="font-headline text-2xl md:text-3xl font-black text-on-surface tracking-tight">
                {nextDestination.name}
              </h3>
            </div>

            <p className="text-xs text-on-surface-variant/90 leading-relaxed">
              Ubicado en el corazón de Navarra, este palacio gótico es uno de los monumentos más visitados de España. Escanea tu QR en la entrada para desbloquear el sello.
            </p>

            {/* Footer Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-on-surface/10">
              <div className="flex items-center gap-2 text-on-surface-variant/80 hover:text-secondary transition-colors cursor-pointer" onClick={() => onExploreLocation(nextDestination.id)}>
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-xs font-semibold">{nextDestination.city}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-on-surface-variant/50 tracking-widest uppercase">RECOMPENSA</p>
                  <p className="text-xs font-black text-secondary">+500 XP</p>
                </div>

                <button 
                  onClick={() => onExploreLocation(nextDestination.id)}
                  className="px-4 py-2 bg-secondary text-on-secondary font-black rounded-lg text-[11px] uppercase tracking-wide flex items-center gap-1 hover:brightness-105 active:scale-95 transition-all outline-none cursor-pointer"
                >
                  <span>Iniciar Ruta</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 4. RECENT STAMPS GRID DISPLAY */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <Award className="w-5 h-5 text-secondary" />
            Insignias Recientes
          </h3>
          <button 
            onClick={() => onExploreLocation(locations[0].id)}
            className="text-xs font-semibold text-secondary hover:underline flex items-center gap-0.5 outline-none cursor-pointer"
          >
            <span>Ver Colección Completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stamp Circle list */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {locations.map((loc) => {
            const hasUnlocked = loc.isCheckedIn;
            const cardStyles = hasUnlocked 
              ? 'border-secondary/40 bg-[#001e2c]/50 text-on-surface glow-mint hover:scale-[1.02] transform'
              : 'border-[#1a3848]/40 bg-[#001019]/40 opacity-70 hover:opacity-90 transition-all';
            
            return (
              <div 
                key={loc.id}
                onClick={() => onExploreLocation(loc.id)}
                className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all ${cardStyles}`}
                title={`Click para explorar ${loc.name}`}
              >
                {/* Stamp Circle Sphere icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all overflow-hidden ${
                  hasUnlocked 
                    ? 'bg-secondary/15 border-secondary/45 shadow-[0_0_12px_rgba(67,229,212,0.15)]'
                    : 'bg-[#001019] border-[#1a3848]/50'
                }`}>
                  {loc.badgeImageUrl ? (
                    <img 
                      src={loc.badgeImageUrl} 
                      alt={loc.name} 
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-all ${hasUnlocked ? '' : 'grayscale opacity-30 contrast-75 bg-[#001c2a]'}`} 
                    />
                  ) : (
                    <span className={`text-3xl select-none ${hasUnlocked ? '' : 'grayscale opacity-30 contrast-75'}`}>
                      {loc.badgeIcon === 'castle' && '🏰'}
                      {loc.badgeIcon === 'mosque' && '🕌'}
                      {loc.badgeIcon === 'aqueduct' && '🌉'}
                      {loc.badgeIcon === 'fortress' && '🏰'}
                      {loc.badgeIcon === 'cathedral' && '⛪'}
                      {loc.badgeIcon === 'tower' && '🏰'}
                    </span>
                  )}
                </div>

                <div className="space-y-1 select-none">
                  <h4 className={`text-xs font-extrabold truncate max-w-[120px] ${hasUnlocked ? 'text-on-surface' : 'text-on-surface-variant/80'}`}>
                    {loc.name}
                  </h4>
                  <p className={`text-[9px] font-black uppercase tracking-wider ${hasUnlocked ? 'text-secondary' : 'text-on-surface-variant/40'}`}>
                    {hasUnlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. INTERACTIVE SOLANA WEB3 PORTAL (Redesigned for outstanding usability below the stamps) */}
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
              Por tu espíritu andador urbano, la red Solana grabará tu estatus inmortal de embajador. Acuñado de forma segura con bajos costos de compresión direto a tu billetera personal vinculada.
            </p>
          </div>
        </div>

        {/* Claim actions controls */}
        <div className="shrink-0 w-full md:w-auto space-y-2">
          {isNFTClaimed ? (
            <div className="space-y-1.5">
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
      <section className="bg-surface-container border border-[#005049]/20 p-6 rounded-3xl">
        <h4 className="font-headline text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest border-b border-on-surface/10 pb-2.5 text-left">
          Estadísticas de Exploración de Viaje
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Item 1 */}
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-xl bg-secondary/5 text-secondary border border-secondary/15 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase">REGIONES VISITADAS</p>
              <p className="text-xl font-headline font-black text-on-surface">0{stats.regionsVisited}</p>
            </div>
          </div>
          {/* Item 2 */}
          <div className="flex items-center gap-4 text-left cursor-pointer hover:bg-secondary/5 p-1 rounded-xl transition-all" onClick={onTriggerPhoto}>
            <div className="p-3 rounded-xl bg-secondary/5 text-secondary border border-secondary/15 flex items-center justify-center">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase">MOMENTOS CAPTURADOS</p>
              <p className="text-xl font-headline font-black text-on-surface">
                {stats.momentsCaptured < 10 ? `0${stats.momentsCaptured}` : stats.momentsCaptured} 📸
              </p>
            </div>
          </div>
          {/* Item 3 */}
          <div className="flex items-center gap-4 text-left cursor-pointer hover:bg-secondary/5 p-1 rounded-xl transition-all" onClick={handleShareClick}>
            <div className="p-3 rounded-xl bg-secondary/5 text-secondary border border-secondary/15 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase">LOGROS COMPARTIDOS</p>
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
          <div className="w-full max-w-sm p-6 bg-[#001e2c] border border-secondary/30 rounded-2xl glow-mint text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
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
                className="bg-secondary text-on-secondary px-3 py-1 rounded font-sans font-black text-[10px] uppercase outline-none select-none"
              >
                {copiedLink ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 bg-[#001019] border border-on-surface-variant/20 hover:border-secondary/20 text-on-surface-variant hover:text-on-surface font-semibold rounded-lg text-xs transition-all uppercase tracking-wide cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
