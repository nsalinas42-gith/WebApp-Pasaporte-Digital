/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Location, UserProfile } from '../types';
import { 
  Compass, 
  Map, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  Trophy, 
  Award, 
  Layers, 
  Wallet, 
  LogIn, 
  ArrowRight,
  Globe,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  Trash2,
  Eye,
  Menu,
  X
} from 'lucide-react';
import { useLanguage } from '../translations';
import LanguageSelector from './LanguageSelector';
import GoogleSignInButton from './GoogleSignInButton';
import { DecodedGoogleUser } from '../utils/googleAuth';
import stampAlhambra from '../assets/images/01A_explorador_principiante.png';
import stampCordoba from '../assets/images/02B_explorador_intermedio.png';
import stampSegovia from '../assets/images/03C_explorador_avanzado.png';
import stampSevilla from '../assets/images/04D_Cazador_de_rutas.png';
import stampSagrada from '../assets/images/05E_Guia_Local.png';
import stampOlite from '../assets/images/06F_guia_local_experto.png';
import specialBronce from '../assets/images/lider_de_expedicion_1.png';
import specialPlata from '../assets/images/guia_legendario_2.png';
import specialOro from '../assets/images/explorador_supremo.png';
import mapaPintaMapas from '../assets/images/mapa_pinta_mapas.png';
import logoPintaMapas from '../assets/images/Logo Pinta Mapas1.png';
import UserProfilesCarousel from './UserProfilesCarousel';
import UserWayAccessibility from './UserWayAccessibility';

interface LandingViewProps {
  onEnter: () => void;
  onGoogleLoginSuccess?: (decodedUser: DecodedGoogleUser, rawToken: string) => void;
  user?: UserProfile;
  locations?: Location[];
  lockedRouteIds?: string[];
  setLockedRouteIds?: (ids: string[]) => void;
  onResetToMockupState?: () => void;
  onResetToZeroState?: () => void;
  onEnterHiddenAdminPage?: () => void;
}

export default function LandingView({ 
  onEnter, 
  onGoogleLoginSuccess,
  user,
  locations,
  lockedRouteIds,
  setLockedRouteIds,
  onResetToMockupState,
  onResetToZeroState,
  onEnterHiddenAdminPage
}: LandingViewProps) {
  const { t } = useLanguage();
  
  // Mobile responsive menu controls
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutsideMobile(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutsideMobile);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMobile);
    };
  }, [isMobileMenuOpen]);

  // Administrator multi-route lock override state for the landing footer
  const [adminPassword, setAdminPassword] = React.useState('');
  const [adminPasswordError, setAdminPasswordError] = React.useState<string | null>(null);
  const [adminSuccessMsg, setAdminSuccessMsg] = React.useState<string | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = React.useState(false);
  const [showConfirmResetMock, setShowConfirmResetMock] = React.useState(false);
  const [showConfirmResetZero, setShowConfirmResetZero] = React.useState(false);

  const handleVerifyAdminPassword = () => {
    if (adminPassword !== '009286') {
      setAdminPasswordError('Contraseña incorrecta. Se requiere credencial de administrador.');
      return;
    }
    setAdminPasswordError(null);
    setAdminPassword('');
    if (onEnterHiddenAdminPage) {
      onEnterHiddenAdminPage();
    }
  };

  const handleToggleIndividualRoute = (routeId: string) => {
    if (setLockedRouteIds && lockedRouteIds) {
      if (lockedRouteIds.includes(routeId)) {
        setLockedRouteIds(lockedRouteIds.filter(id => id !== routeId));
        setAdminSuccessMsg('Ruta configurada como Activa');
      } else {
        setLockedRouteIds([...lockedRouteIds, routeId]);
        setAdminSuccessMsg('Ruta configurada como Bloqueada');
      }
      setTimeout(() => setAdminSuccessMsg(null), 3000);
    }
  };
  
  // Smooth scroll helper
  const scrollToHowItWorks = () => {
    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#000f16] text-on-background min-h-screen font-sans overflow-x-hidden selection:bg-[#43e5d4] selection:text-[#003732] flex flex-col justify-between">
      
      {/* 1. TOP NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center pl-4 sm:pl-6 md:pl-16 pr-[15px] h-16 sm:h-20 bg-[#000f16]/90 backdrop-blur-md border-b border-[#005049]/20">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <img 
            src={logoPintaMapas} 
            alt="Pinta Mapas" 
            referrerPolicy="no-referrer"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
          />
        </div>

        {/* Right Actions */}
        {/* Desktop actions: visible on medium screens and larger */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector />
          <UserWayAccessibility />
        </div>

        {/* Mobile action: Hamburguer Menu for responsive viewport */}
        <div className="flex md:hidden items-center relative" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#001c2c]/85 hover:bg-[#002e48] border border-secondary/35 text-secondary hover:text-white transition-all outline-none cursor-pointer shadow-[0_0_15px_rgba(67,229,212,0.08)] select-none shrink-0"
            title="Soporte y configuración"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-200" />
            )}
          </button>

          {/* Submenu container */}
          {isMobileMenuOpen && (
            <div 
              id="mobile-navigation-submenu" 
              className="absolute right-0 top-[52px] w-64 rounded-2xl bg-[#001721] border border-secondary/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)] z-55 p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {/* Language Selector block */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black tracking-widest uppercase font-mono text-secondary opacity-80 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  IDIOMA
                </span>
                <div className="pl-1 text-left">
                  <LanguageSelector />
                </div>
              </div>

              {/* Separation line */}
              <div className="h-px bg-[#005049]/20 my-1" />

              {/* Accessibility widget block */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black tracking-widest uppercase font-mono text-secondary opacity-80 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  ACCESIBILIDAD
                </span>
                <div className="pl-1 text-left">
                  <UserWayAccessibility />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. HERO IMMERSIVE SECTION */}
      <section className="relative w-full min-h-[95vh] flex items-center justify-center pt-16 sm:pt-20 px-4 sm:px-8 border-b border-[#005049]/20 overflow-hidden">
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,80,73,0.15)_0%,transparent_70%)] pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[#000f16] opacity-35 mix-blend-multiply z-0 pointer-events-none"></div>

        {/* Immersive Cyber Colosseum Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center select-none pointer-events-none opacity-20 md:opacity-40 z-0 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=85')" }}
        />
        
        {/* Holographic tech circle and matrices over Colosseum */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#43e5d4]/10 pointer-events-none z-0 flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
          <div className="w-[500px] h-[500px] rounded-full border border-dashed border-[#43e5d4]/5"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-[#43e5d4]/15"></div>
        </div>

        {/* Shadow overlays mapping */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#000f16] to-transparent z-10 pointer-events-none"></div>

        {/* Main core callout */}
        <div className="relative z-20 text-center max-w-3xl mx-auto space-y-6 px-4 py-8">
          
          <div className="space-y-4">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black text-on-surface tracking-tight leading-none leading-[1.05]">
              {t('descubre_mundo')}<br />
              <span className="text-secondary bg-clip-text bg-gradient-to-r from-[#43e5d4] to-[#c7ffd3] glow-text shadow-glow">
                {t('colecciona_historia')}
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-on-surface-variant/85 max-w-xl mx-auto leading-relaxed">
              {t('hero_desc')}
            </p>
          </div>

          {/* Holographic label tag under header */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 hidden md:block text-[9px] font-mono tracking-widest text-[#43e5d4]/40 font-bold uppercase select-none">
            Digital Passport • SOLANA SECURED
          </div>

          {/* Action buttons */}
          <div className="space-y-6 pt-4 max-w-2xl mx-auto flex flex-col items-center">
            {/* Top row with Google Sign In and Iniciar como Invitado */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <div className="w-full sm:w-auto min-w-[240px]">
                <GoogleSignInButton
                  key={user?.email || 'guest'}
                  onSuccess={(decoded, token) => {
                    if (onGoogleLoginSuccess) {
                      onGoogleLoginSuccess(decoded, token);
                    } else {
                      onEnter();
                    }
                  }}
                  hideDebugConfig={true}
                />
              </div>

              <button
                onClick={onEnter}
                className="w-full sm:w-auto px-8 py-3 bg-[#43e5d4] hover:bg-[#c7ffd3] text-[#003732] font-black rounded-full text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all outline-none cursor-pointer h-[44px] flex items-center justify-center min-w-[240px] shadow-[0_0_15px_rgba(67,229,212,0.15)]"
              >
                {t('iniciar_como_invitado')}
              </button>
            </div>

            {/* Bottom centered Saber Mas button */}
            <button
              onClick={scrollToHowItWorks}
              className="w-auto px-8 py-2 bg-transparent hover:bg-white/5 border border-[#43e5d4]/40 text-[#43e5d4] font-bold rounded-full text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all outline-none cursor-pointer h-[40px] flex items-center justify-center"
            >
              {t('saber_mas')}
            </button>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="como-funciona" className="py-24 px-6 md:px-16 space-y-16 max-w-6xl mx-auto text-left relative z-10 scroll-mt-20">
        
        {/* Underlined Section Header */}
        <div className="text-center space-y-3">
          <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface uppercase tracking-wider relative inline-block">
            {t('como_funciona')}
          </h2>
          <div className="w-16 h-1 bg-[#43e5d4] mx-auto rounded-full"></div>
        </div>

        {/* Bento Grid layout matching the reference mockup */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* CARD 1: Adquiere tu Mapa Físico (col-span-12 md:col-span-7) */}
          <div className="col-span-1 md:col-span-7 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl flex flex-col justify-between overflow-hidden relative group hover:border-[#43e5d4]/40 transition-colors min-h-[240px]">
            <div className="space-y-4 max-w-sm text-left">
              <div className="w-11 h-11 rounded-xl bg-[#43e5d4]/10 flex items-center justify-center text-[#43e5d4] border border-[#43e5d4]/20">
                <Map className="w-5 h-5 text-[#43e5d4]" />
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">
                {t('physical_map_title')}
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                {t('physical_map_desc')}
              </p>
            </div>

            {/* Tenous watermark map SVG */}
            <div className="absolute bottom-[-15%] right-[-5%] w-56 h-56 text-[#43e5d4]/[0.04] pointer-events-none select-none group-hover:scale-105 group-hover:text-[#43e5d4]/[0.08] transition-all duration-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
            </div>
          </div>

          {/* CARD 2: Visita los Sitios (col-span-12 md:col-span-5) */}
          <div className="col-span-1 md:col-span-5 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-[#43e5d4]/40 transition-colors text-left">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#43e5d4]/10 flex items-center justify-center text-[#43e5d4] border border-[#43e5d4]/20">
                <Compass className="w-5 h-5 text-[#43e5d4]" />
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">
                {t('visit_sites_title')}
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                {t('visit_sites_desc')}
              </p>
            </div>
            
            {/* Design detail bottom line */}
            <div className="h-1 w-12 bg-[#43e5d4]/30 rounded"></div>
          </div>

          {/* CARD 3: GPS Check-in (col-span-12 md:col-span-5) */}
          <div className="col-span-1 md:col-span-5 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-[#43e5d4]/40 transition-colors text-left">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#43e5d4]/10 flex items-center justify-center text-[#43e5d4] border border-[#43e5d4]/20">
                <MapPin className="w-5 h-5 text-[#43e5d4]" />
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">
                {t('gps_checkin_title')}
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                {t('gps_checkin_desc')}
              </p>
            </div>

            {/* Bottom notification indicator inside card */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1a3848]/40">
              <CheckCircle className="w-4 h-4 text-secondary" />
              <span className="text-[10px] font-black tracking-widest text-[#43e5d4] uppercase">
                {t('realtime_validation')}
              </span>
            </div>
          </div>

          {/* CARD 4: Gana cNFTs Exclusivos (col-span-12 md:col-span-7) */}
          <div className="col-span-1 md:col-span-7 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl flex flex-col justify-between overflow-hidden relative group hover:border-[#43e5d4]/40 transition-colors min-h-[240px]">
            
            <div className="space-y-4 max-w-sm text-left flex-1 flex flex-col justify-between relative z-10">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#43e5d4]/10 flex items-center justify-center text-[#43e5d4] border border-[#43e5d4]/20 mb-4">
                  <Sparkles className="w-5 h-5 text-[#43e5d4]" />
                </div>
                <h3 className="font-headline text-lg font-extrabold text-on-surface">
                  {t('earn_cnft_title')}
                </h3>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed mt-2">
                  {t('earn_cnft_desc')}
                </p>
              </div>

              {/* Three little icons row inside card */}
              <div className="flex gap-3 pt-4 select-none">
                <div className="p-1.5 rounded bg-[#43e5d4]/10 border border-[#43e5d4]/20" title="Trophy">
                  <Trophy className="w-3.5 h-3.5 text-[#43e5d4]" />
                </div>
                <div className="p-1.5 rounded bg-[#43e5d4]/10 border border-[#43e5d4]/20" title="License Badge">
                  <Award className="w-3.5 h-3.5 text-[#43e5d4]" />
                </div>
                <div className="p-1.5 rounded bg-[#43e5d4]/10 border border-[#43e5d4]/20" title="Block Ledger">
                  <Layers className="w-3.5 h-3.5 text-[#43e5d4]" />
                </div>
              </div>
            </div>

            {/* Tenous watermark NFT SVG */}
            <div className="absolute bottom-[-15%] right-[-5%] w-56 h-56 text-[#43e5d4]/[0.04] pointer-events-none select-none group-hover:scale-105 group-hover:text-[#43e5d4]/[0.08] transition-all duration-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <line x1="12" y1="12" x2="12" y2="22" />
                <circle cx="12" cy="7" r="2" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>
          </div>

          {/* CARD 5: Insignias Digitales (Badges) (col-span-12) */}
          <div className="col-span-1 md:col-span-12 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl hover:border-[#43e5d4]/40 transition-colors text-left space-y-6">
            <div className="space-y-2">
              <h3 className="font-headline text-lg sm:text-xl font-extrabold text-on-surface">
                Insignias Digitales (Badges)
              </h3>
              <p className="text-xs sm:text-sm text-[#8c9f9e]/90 leading-relaxed">
                estas son las insignias que podrás ir obteniendo a medida que desbloqueas los sitios históricos sucesivamente hasta completar las (6) insignias.
              </p>
            </div>

            {/* Badges list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 pt-4 w-full items-center justify-center">
              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.5 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={stampAlhambra} 
                  alt="Explorador Principiante" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-semibold text-[#8c9f9e]">EXPLORADOR PRINCIPIANTE</span>
              </motion.div>

              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.5 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={stampCordoba} 
                  alt="Explorador Intermedio" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-semibold text-[#8c9f9e]">EXPLORADOR INTERMEDIO</span>
              </motion.div>

              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.5 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={stampSegovia} 
                  alt="Explorador Avanzado" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-semibold text-[#8c9f9e]">EXPLORADOR AVANZADO</span>
              </motion.div>

              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.5 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={stampSevilla} 
                  alt="Cazador de rutas" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-semibold text-[#8c9f9e]">CAZADOR DE RUTAS</span>
              </motion.div>

              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.5 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={stampSagrada} 
                  alt="Guia Local" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-semibold text-[#8c9f9e]">GUIA LOCAL</span>
              </motion.div>

              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.5 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={stampOlite} 
                  alt="guia local experto" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-semibold text-[#8c9f9e]">GUIA LOCAL EXPERTO</span>
              </motion.div>
            </div>

            {/* Elegant Divider */}
            <div className="border-t border-[#005049]/20 pt-8 mt-6"></div>

            {/* Special Badges Header */}
            <div className="space-y-2">
              <h3 className="font-headline text-lg sm:text-xl font-extrabold text-[#43e5d4] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#43e5d4]" />
                Insignias Especiales
              </h3>
              <p className="text-xs sm:text-sm text-[#8c9f9e]/90 leading-relaxed">
                Estas insignias la podrás obtener al completar las (6) rutas, Bronce, Plata, Oro
              </p>
            </div>

            {/* Special Badges Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 w-full items-center justify-center">
              {/* Card 1: Bronce */}
              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.4 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={specialBronce} 
                  alt="completa 2 rutas" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[11px] font-semibold text-[#FFFFFF] uppercase">completa 2 rutas</span>
                  <span className="text-[11px] font-semibold text-[#8c9f9e] uppercase">LÍDER DE EXPEDICIÓN</span>
                </div>
              </motion.div>

              {/* Card 2: Plata */}
              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.4 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={specialPlata} 
                  alt="completas 4 rutas" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[11px] font-semibold text-[#FFFFFF] uppercase">completas 4 rutas</span>
                  <span className="text-[11px] font-semibold text-[#8c9f9e] uppercase">GUÍA LEGENDARIO</span>
                </div>
              </motion.div>

              {/* Card 3: Oro */}
              <motion.div 
                whileHover="hover"
                variants={{
                  hover: { borderColor: "rgba(67, 229, 212, 0.45)" }
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="w-full max-w-[280px] sm:max-w-none flex flex-col items-center text-center space-y-3 p-3 sm:p-4 rounded-2xl bg-[#000f16]/40 border border-[#005049]/10 shadow-lg cursor-pointer transition-colors"
              >
                <motion.img 
                  variants={{
                    hover: { scale: 1.4 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  src={specialOro} 
                  alt="completa 6 rutas" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[11px] font-semibold text-[#FFFFFF] uppercase">completa 6 rutas</span>
                  <span className="text-[11px] font-semibold text-[#8c9f9e] uppercase">EXPLORADOR SUPREMO</span>
                </div>
              </motion.div>
            </div>
          </div>

        </div>

      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="py-20 bg-[#001d2c]/40 border-y border-[#005049]/20 text-center space-y-6 px-4">
        <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface max-w-xl mx-auto leading-tight">
          {t('listo_comenzar_coleccion')}
        </h2>
        <button
          onClick={onEnter}
          className="px-10 py-5 bg-[#43e5d4] hover:bg-[#c7ffd3] text-[#003732] font-black rounded-xl text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(67,229,212,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all outline-none cursor-pointer"
        >
          {t('empieza_ahora_gratis')}
        </button>
      </section>

      {/* Dynamic Profile Carousel */}
      <UserProfilesCarousel />

      {/* 5. FOOTER SECTION */}
      <footer className="bg-[#00080d] border-t border-[#005049]/20 pt-16 pb-10 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 text-left pb-12 border-b border-[#005049]/15">
          {/* Logo & Manifesto Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-6 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <img 
                src={logoPintaMapas} 
                alt="Pinta Mapas" 
                referrerPolicy="no-referrer"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant/70 leading-relaxed max-w-xs">
              {t('footer_manifesto')}
            </p>
             {/* Relocated Admin Panel replacing Login Button */}
            <div className="bg-[#001019] border border-[#43e5d4]/20 rounded-2xl p-4 space-y-4 max-w-sm">
              <div className="flex items-center gap-2 border-b border-[#43e5d4]/15 pb-2">
                <Lock className="w-4 h-4 text-[#43e5d4]" />
                <span className="font-headline text-[11px] font-bold text-[#43e5d4] uppercase tracking-widest block text-left">
                  Panel de Administrador
                </span>
                <span className="text-[8px] uppercase bg-[#43e5d4]/10 px-1.5 py-0.5 rounded text-[#43e5d4] font-mono ml-auto">
                  SECURE GATE
                </span>
              </div>

              <div className="space-y-2 text-left">
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  Ingresa la clave autorizada para abrir directamente el panel de control supremo del administrador.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminPasswordError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyAdminPassword();
                      }
                    }}
                    placeholder="Contraseña (009286)..."
                    className="flex-1 bg-[#00080d] border border-[#43e5d4]/25 rounded-xl text-on-surface px-3 py-1.5 text-xs font-mono placeholder:text-on-surface-variant/40 outline-none focus:border-[#43e5d4] transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAdminPassword}
                    className="px-3.5 py-1.5 bg-[#43e5d4]/10 border border-[#43e5d4]/40 text-[#43e5d4] text-[11px] font-black rounded-xl hover:brightness-110 hover:border-[#43e5d4] hover:bg-[#43e5d4]/20 active:scale-95 transition-all outline-none uppercase cursor-pointer"
                  >
                    Entrar
                  </button>
                </div>
                {adminPasswordError && (
                  <p className="text-[10px] text-rose-400 font-semibold animate-pulse mt-1">
                    ⚠️ {adminPasswordError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Comunidad Column */}
          <div className="col-span-1 md:col-span-3 md:ml-auto space-y-3.5">
            <h4 className="text-[10px] font-black text-on-surface tracking-widest uppercase pb-1.5 border-b border-[#005049]/10">
              {t('comunidad')}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant/80">
              <a href="#instagram" className="hover:text-[#43e5d4] hover:underline transition-all">Instagram</a>
              <a href="#twitter" className="hover:text-[#43e5d4] hover:underline transition-all">Twitter / X</a>
              <a href="#discord" className="hover:text-[#43e5d4] hover:underline transition-all">Discord</a>
            </div>
          </div>

          {/* Legal y Soporte Column */}
          <div className="col-span-1 md:col-span-3 md:ml-auto space-y-3.5">
            <h4 className="text-[10px] font-black text-on-surface tracking-widest uppercase pb-1.5 border-b border-[#005049]/10">
              {t('soporte')} y {t('legal')}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant/80">
              <a href="#help" className="hover:text-[#43e5d4] hover:underline transition-all">{t('centro_ayuda')}</a>
              <a href="#contact" className="hover:text-[#43e5d4] hover:underline transition-all">{t('contacto')}</a>
              <div className="h-px bg-[#005049]/10 my-0.5" />
              <a href="#terms" className="hover:text-[#43e5d4] hover:underline transition-all">{t('terminos')}</a>
              <a href="#privacy" className="hover:text-[#43e5d4] hover:underline transition-all">{t('privacidad')}</a>
              <a href="#cookies" className="hover:text-[#43e5d4] hover:underline transition-all">{t('cookies_policy')}</a>
            </div>
          </div>
        </div>

        {/* Footnote Copyright block */}
        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium text-on-surface-variant/50">
          <p>{t('derechos_reservados')}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs justify-center sm:justify-end">
            <span className="text-[10px] bg-[#001c27] border border-secondary/35 text-secondary px-2.5 py-0.5 rounded-lg font-mono tracking-wide">
              BITÁCORA DIGITAL PINTA MAPAS MVP &bull; Solana cNFT v1.0
            </span>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/20 hidden sm:inline-block"></span>
            <Globe className="w-4 h-4 text-on-surface-variant/40" />
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/20 inline-block"></span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] bg-secondary/10 px-1.5 py-0.5 rounded text-secondary border border-secondary/20">SSL SECURE</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

