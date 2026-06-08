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
  EyeOff,
  Mail,
  User,
  Menu,
  X
} from 'lucide-react';
import { useLanguage } from '../translations';
import LanguageSelector from './LanguageSelector';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  recoverPassword, 
  recoverEmail 
} from '../utils/firebase';

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
import logoPintaMapas from '../assets/images/Logo Pinta Mapas2.png';
import logoAvatar from '../assets/images/logo.avatar.png';
import caracasAvilaImg from '../assets/images/caracas_sky_avila_1780684422323.png';
import UserProfilesCarousel from './UserProfilesCarousel';
import UserWayAccessibility from './UserWayAccessibility';

interface LandingViewProps {
  onEnter: () => void;
  onAuthSuccess?: (email: string, name: string) => void;
  user?: UserProfile;
  locations?: Location[];
  lockedRouteIds?: string[];
  setLockedRouteIds?: (ids: string[]) => void;
  onResetToMockupState?: () => void;
  onResetToZeroState?: () => void;
  onEnterHiddenAdminPage?: () => void;
  onShowTerms?: () => void;
  onShowPrivacy?: () => void;
  onShowProyecto?: () => void;
}

export default function LandingView({ 
  onEnter, 
  onAuthSuccess,
  user,
  locations,
  lockedRouteIds,
  setLockedRouteIds,
  onResetToMockupState,
  onResetToZeroState,
  onEnterHiddenAdminPage,
  onShowTerms,
  onShowPrivacy,
  onShowProyecto
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
  const [adminEmail, setAdminEmail] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [adminPasswordError, setAdminPasswordError] = React.useState<string | null>(null);
  const [adminSuccessMsg, setAdminSuccessMsg] = React.useState<string | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = React.useState(false);
  const [showConfirmResetMock, setShowConfirmResetMock] = React.useState(false);
  const [showConfirmResetZero, setShowConfirmResetZero] = React.useState(false);

  // Admin privilege check for the current logged in user
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const checkAdminStatus = async () => {
      if (!user) {
        if (active) setIsCurrentUserAdmin(false);
        return;
      }
      
      const emailLower = user.email.toLowerCase().trim();
      if (emailLower === 'nsalinas42@gmail.com' || emailLower === 'felix.voyager@gmail.com') {
        if (active) setIsCurrentUserAdmin(true);
        return;
      }

      try {
        const { db } = await import('../utils/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        const adminDocRef = doc(db, 'admins', emailLower);
        const adminDocSnap = await getDoc(adminDocRef);
        if (active) {
          setIsCurrentUserAdmin(adminDocSnap.exists());
        }
      } catch (err) {
        console.warn("Could not check admin status on UI:", err);
        if (active) setIsCurrentUserAdmin(false);
      }
    };
    checkAdminStatus();
    return () => {
      active = false;
    };
  }, [user]);

  // --- CUSTOM EMAIL AUTHENTICATION STATES ---
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [emailForm, setEmailForm] = React.useState('');
  const [passwordForm, setPasswordForm] = React.useState('');
  const [nameForm, setNameForm] = React.useState('');
  const [secondaryEmailForm, setSecondaryEmailForm] = React.useState('');
  const [showPasswordField, setShowPasswordField] = React.useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = React.useState(false);
  const [authErrorMsg, setAuthErrorMsg] = React.useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = React.useState<string | null>(null);

  // Recovery modal states
  const [showRecoveryModal, setShowRecoveryModal] = React.useState(false);
  const [recoveryOption, setRecoveryOption] = React.useState<'A' | 'B' | null>(null);
  const [primaryEmailRecoveryInput, setPrimaryEmailRecoveryInput] = React.useState('');
  const [secondaryEmailRecoveryInput, setSecondaryEmailRecoveryInput] = React.useState('');
  const [recoveryMessage, setRecoveryMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg(null);
    setAuthSuccessMsg(null);
    setIsLoadingAuth(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm)) {
      setAuthErrorMsg("Ingresa tu correo electrónico con un formato válido.");
      setIsLoadingAuth(false);
      return;
    }

    if (passwordForm.length < 6) {
      setAuthErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      setIsLoadingAuth(false);
      return;
    }

    try {
      const fbUser = await signInWithEmail(emailForm, passwordForm);
      setAuthSuccessMsg("¡Sesión iniciada correctamente! Entrando...");
      
      if (onAuthSuccess) {
        onAuthSuccess(fbUser.email || emailForm, fbUser.displayName || emailForm.split('@')[0]);
      } else {
        onEnter();
      }
    } catch (err: any) {
      console.error(err);
      let localizedError = "Error al iniciar sesión.";
      if (err?.code === 'auth/network-request-failed' || err?.message?.includes('network-request-failed')) {
        localizedError = "auth/network-request-failed";
      } else if (err?.code === 'auth/wrong-password' || err?.message?.includes('password') || err?.message?.includes('credential') || err?.message?.includes('invalid-credential')) {
        localizedError = "Contraseña incorrecta o correo inválido. Verifica tus datos.";
      } else if (err?.code === 'auth/user-not-found' || err?.message?.includes('user-not-found')) {
        localizedError = "No existe ninguna cuenta registrada con este correo electrónico.";
      } else {
        localizedError = err?.message || localizedError;
      }
      setAuthErrorMsg(localizedError);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleEmailRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg(null);
    setAuthSuccessMsg(null);
    setIsLoadingAuth(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nameForm.trim()) {
      setAuthErrorMsg("Por favor, ingresa tu nombre completo.");
      setIsLoadingAuth(false);
      return;
    }

    if (!emailRegex.test(emailForm)) {
      setAuthErrorMsg("Ingresa tu correo electrónico principal con un formato válido.");
      setIsLoadingAuth(false);
      return;
    }

    if (passwordForm.length < 6) {
      setAuthErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      setIsLoadingAuth(false);
      return;
    }

    if (!emailRegex.test(secondaryEmailForm)) {
      setAuthErrorMsg("Ingresa un correo electrónico secundario válido para la recuperación.");
      setIsLoadingAuth(false);
      return;
    }

    if (emailForm.toLowerCase() === secondaryEmailForm.toLowerCase()) {
      setAuthErrorMsg("El correo secundario/alternativo no puede ser igual al correo principal.");
      setIsLoadingAuth(false);
      return;
    }

    try {
      const fbUser = await signUpWithEmail(emailForm, passwordForm, nameForm, secondaryEmailForm);
      setAuthSuccessMsg("¡Cuenta creada y sincronizada exitosamente con Firebase!");
      
      if (onAuthSuccess) {
        onAuthSuccess(emailForm, nameForm);
      } else {
        onEnter();
      }
    } catch (err: any) {
      console.error(err);
      let localizedError = "Error al crear la cuenta.";
      if (err?.code === 'auth/network-request-failed' || err?.message?.includes('network-request-failed')) {
        localizedError = "auth/network-request-failed";
      } else if (err?.code === 'auth/email-already-in-use' || err?.message?.includes('already-in-use')) {
        localizedError = "El correo electrónico principal ya está registrado por otro usuario.";
      } else {
        localizedError = err?.message || localizedError;
      }
      setAuthErrorMsg(localizedError);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleRecoveryOptionASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(primaryEmailRecoveryInput)) {
      setRecoveryMessage({ type: 'error', text: "Ingresa tu correo electrónico principal con un formato válido." });
      return;
    }

    try {
      const result = await recoverPassword(primaryEmailRecoveryInput);
      if (result.success) {
        setRecoveryMessage({ 
          type: 'success', 
          text: `Se verificó la existencia de la cuenta. Hemos registrado un token de recuperación temporal en Firebase (${result.token}) y enviado un enlace seguro al correo principal.` 
        });
      } else {
        setRecoveryMessage({ type: 'error', text: result.error || "El correo ingresado no está registrado." });
      }
    } catch (err: any) {
      let msg = err?.message || "Ocurrió un error inesperado al procesar la solicitud.";
      if (err?.code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        msg = "Error de conexión (auth/network-request-failed): No se pudo establecer contacto con Firebase. Esto suele deberse a un bloqueador de anuncios (AdBlock, uBlock, Brave Shield) bloqueando 'identitytoolkit.googleapis.com'.";
      }
      setRecoveryMessage({ type: 'error', text: msg });
    }
  };

  const handleRecoveryOptionBSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(secondaryEmailRecoveryInput)) {
      setRecoveryMessage({ type: 'error', text: "Ingresa tu correo electrónico secundario con un formato válido." });
      return;
    }

    try {
      const result = await recoverEmail(secondaryEmailRecoveryInput);
      if (result.success) {
        setRecoveryMessage({ 
          type: 'success', 
          text: `¡Cuenta Localizada! El correo principal asignado es: ${result.primaryEmail}` 
        });
      } else {
        setRecoveryMessage({ type: 'error', text: result.error || "No se encontró ningún correo principal asociado con esta cuenta secundaria." });
      }
    } catch (err: any) {
      let msg = err?.message || "Ocurrió un error inesperado al buscar la cuenta.";
      if (err?.code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        msg = "Error de conexión (auth/network-request-failed): No se pudo establecer contacto con Firebase. Esto suele deberse a un bloqueador de anuncios (AdBlock, uBlock, Brave Shield) bloqueando 'identitytoolkit.googleapis.com'.";
      }
      setRecoveryMessage({ type: 'error', text: msg });
    }
  };

  const handleVerifyAdminPassword = async () => {
    if (!adminEmail || !adminPassword) {
      setAdminPasswordError('Por favor ingresa tu correo y contraseña.');
      return;
    }
    
    setAdminPasswordError(null);
    setAdminSuccessMsg(null);
    setIsLoadingAuth(true);

    const emailKey = adminEmail.trim().toLowerCase();

    // 1. Dynamic admin collection lookup
    try {
      const { db } = await import('../utils/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      
      const adminDocRef = doc(db, 'admins', emailKey);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        const adminData = adminDocSnap.data();
        if (adminData.password === adminPassword) {
          // Password from database matches! Let's log them into Firebase Auth if they exist, or create them.
          let fbUser;
          try {
            fbUser = await signInWithEmail(emailKey, adminPassword);
          } catch (fbErr) {
            try {
              // Try auto signup if not registered in Firebase Auth yet
              fbUser = await signUpWithEmail(emailKey, adminPassword, 'Administrador', '');
            } catch (signupErr) {
              // Local fallback if firebase signup fails/is blocked
              fbUser = { email: emailKey };
            }
          }

          if (onAuthSuccess) {
            onAuthSuccess(emailKey, 'Administrador');
          }
          setAdminSuccessMsg('Sesión de administrador iniciada con éxito en Firestore.');
          setTimeout(() => {
            setAdminPassword('');
            setIsLoadingAuth(false);
            if (onEnterHiddenAdminPage) {
              onEnterHiddenAdminPage();
            }
          }, 1200);
          return;
        } else {
          setAdminPasswordError('Contraseña incorrecta. Se requiere credencial de administrador.');
          setIsLoadingAuth(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Dynamic admin check failed, using fallback:", err);
    }
    
    // 2. Hardcoded fallback checking for main administrator (or offline fallback)
    if (emailKey === 'nsalinas42@gmail.com') {
      try {
        let fbUser;
        try {
          fbUser = await signInWithEmail('nsalinas42@gmail.com', adminPassword);
        } catch (err: any) {
          // If the admin user has chosen 009286 or standard bypass password, and isn't registered, run auto-registration
          const isUserNotFound = err?.code === 'auth/user-not-found' || err?.message?.includes('user-not-found') || err?.message?.includes('invalid-credential');
          const isBypassPassword = adminPassword === '009286';
          
          if (isUserNotFound && isBypassPassword) {
            fbUser = await signUpWithEmail('nsalinas42@gmail.com', '009286', 'Nelson Salinas', '');
          } else {
            throw err;
          }
        }
        
        if (onAuthSuccess) {
          onAuthSuccess('nsalinas42@gmail.com', 'Nelson Salinas');
        }
        setAdminSuccessMsg('Sesión de administrador iniciada con éxito en Firestore.');
        setTimeout(() => {
          setAdminPassword('');
          setIsLoadingAuth(false);
          if (onEnterHiddenAdminPage) {
            onEnterHiddenAdminPage();
          }
        }, 1200);
        return;
      } catch (err: any) {
        console.error("Admin authentication error:", err);
        // Fallback: If password matches default, still allow opening admin view locally
        if (adminPassword === '009286') {
          setAdminSuccessMsg('Acceso local concedido (sin conexión a Firebase).');
          setTimeout(() => {
            setAdminPassword('');
            setIsLoadingAuth(false);
            if (onEnterHiddenAdminPage) {
              onEnterHiddenAdminPage();
            }
          }, 1200);
          return;
        }
        setAdminPasswordError('Contraseña incorrecta. Se requiere credencial de administrador.');
        setIsLoadingAuth(false);
        return;
      }
    }

    // 3. Fallback standard email sign-in for any other custom admins registered in Firebase Auth directly
    try {
      const fbUser = await signInWithEmail(adminEmail, adminPassword);
      if (onAuthSuccess) {
        onAuthSuccess(fbUser.email || adminEmail, fbUser.displayName || 'Administrador');
      }
      setAdminSuccessMsg('Sesión iniciada correctamente.');
      setTimeout(() => {
        setAdminPassword('');
        setIsLoadingAuth(false);
        if (onEnterHiddenAdminPage) {
          onEnterHiddenAdminPage();
        }
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setAdminPasswordError('Error de autenticación. Verifica tus credenciales de administrador.');
      setIsLoadingAuth(false);
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
    <div className="bg-[#000f16] text-on-background min-h-screen font-sans overflow-x-hidden selection:bg-[#1A56DB] selection:text-[#003732] flex flex-col justify-between">
      
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
          <button
            onClick={onShowProyecto}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-[#001c2c]/80 hover:bg-[#1A56DB]/10 border border-[#1A56DB]/30 text-secondary hover:text-white rounded-full transition-all outline-none cursor-pointer"
          >
            Sobre el Proyecto
          </button>
          <LanguageSelector />
          <UserWayAccessibility />
        </div>

        {/* Mobile action: Hamburguer Menu for responsive viewport */}
        <div className="flex md:hidden items-center relative" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#001c2c]/85 hover:bg-[#002e48] border border-secondary/35 text-secondary hover:text-white transition-all outline-none cursor-pointer shadow-[0_0_15px_rgba(26, 86, 219,0.08)] select-none shrink-0"
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
              {/* Project Info Quick Link */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onShowProyecto) onShowProyecto();
                }}
                className="w-full text-center py-2 bg-[#1A56DB]/10 hover:bg-[#1A56DB]/20 border border-[#1A56DB]/30 text-secondary hover:text-white transition-all rounded-xl text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
              >
                Sobre el Proyecto
              </button>

              {/* Separation line */}
              <div className="h-px bg-[#005049]/20 my-0.5" />

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

        {/* Immersive Caracas Ávila Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-[center_top] select-none pointer-events-none opacity-35 md:opacity-55 z-0 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url(${caracasAvilaImg})` }}
        />
        
        {/* Holographic tech circle and matrices over Colosseum */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#1A56DB]/10 pointer-events-none z-0 flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
          <div className="w-[500px] h-[500px] rounded-full border border-dashed border-[#1A56DB]/5"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-[#1A56DB]/15"></div>
        </div>

        {/* Shadow overlays mapping */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#000f16] to-transparent z-10 pointer-events-none"></div>

        {/* Main core callout */}
        <div className="relative z-20 text-center max-w-3xl mx-auto space-y-6 px-4 py-8">
          
          <div className="space-y-4">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black text-on-surface tracking-tight leading-none leading-[1.05]">
              {t('descubre_mundo')}<br />
              <span className="text-secondary bg-clip-text bg-gradient-to-r from-[#1A56DB] to-[#c7ffd3] glow-text shadow-glow">
                {t('colecciona_historia')}
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-on-surface-variant/85 max-w-xl mx-auto leading-relaxed">
              {t('hero_desc')}
            </p>
          </div>

          {/* Holographic label tag under header */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 hidden md:block text-[9px] font-mono tracking-widest text-[#1A56DB]/40 font-bold uppercase select-none">
            Digital Passport • SOLANA SECURED
          </div>

          {/* Action buttons */}
          <div className="space-y-6 pt-4 max-w-2xl mx-auto flex flex-col items-center w-full">
            
            {/* Email/Password Auth Module (Required specs) */}
            <div className="w-full max-w-md mx-auto bg-[#00171f]/80 backdrop-blur-md rounded-2xl p-6 border border-[#1A56DB]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
              
              {/* Tab selection toggles */}
              <div className="flex border-b border-[#1A56DB]/10 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthErrorMsg(null);
                    setAuthSuccessMsg(null);
                  }}
                  className={`flex-1 text-center py-2 text-xs sm:text-sm uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'text-[#1A56DB] border-b-2 border-[#1A56DB]'
                      : 'text-on-surface-variant/40 hover:text-on-surface'
                  }`}
                >
                  {t('iniciar_sesion') || 'Iniciar Sesión'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthErrorMsg(null);
                    setAuthSuccessMsg(null);
                  }}
                  className={`flex-1 text-center py-2 text-xs sm:text-sm uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'text-[#1A56DB] border-b-2 border-[#1A56DB]'
                      : 'text-on-surface-variant/40 hover:text-on-surface'
                  }`}
                >
                  Registrarse
                </button>
              </div>

              {/* Form */}
              <form 
                id={authMode === 'login' ? 'login-form-custom' : 'register-form-custom'}
                onSubmit={authMode === 'login' ? handleEmailLoginSubmit : handleEmailRegisterSubmit} 
                className="space-y-4 text-left"
              >
                
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label htmlFor="auth-name-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#1A56DB]/80">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant/40">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        id="auth-name-input"
                        type="text"
                        required
                        placeholder="Tu nombre completo"
                        value={nameForm}
                        onChange={(e) => setNameForm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs bg-black/40 border border-[#1A56DB]/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#1A56DB] transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="auth-email-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#1A56DB]/80">
                    {authMode === 'register' ? 'Correo Electrónico Principal' : 'Correo Electrónico'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant/40">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={emailForm}
                      onChange={(e) => setEmailForm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-black/40 border border-[#1A56DB]/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#1A56DB] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="auth-password-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#1A56DB]/80">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant/40">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="auth-password-input"
                      type={showPasswordField ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={passwordForm}
                      onChange={(e) => setPasswordForm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 text-xs bg-black/40 border border-[#1A56DB]/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#1A56DB] transition-colors"
                    />
                    <button
                      id="toggle-password-vis"
                      type="button"
                      onClick={() => setShowPasswordField(!showPasswordField)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant/40 hover:text-[#1A56DB] transition-colors"
                    >
                      {showPasswordField ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label htmlFor="auth-secondary-email" className="block text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Correo Secundario / Alternativo
                    </label>
                    <p className="text-[10px] text-on-surface-variant/60 leading-3">
                      Obligatorio si deseas usar la recuperación de cuenta (Opción B).
                    </p>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant/40">
                        <Mail className="h-4 w-4 text-amber-300/40" />
                      </span>
                      <input
                        id="auth-secondary-email"
                        type="email"
                        required
                        placeholder="correo_secundario@ejemplo.com"
                        value={secondaryEmailForm}
                        onChange={(e) => setSecondaryEmailForm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs bg-black/40 border border-amber-300/30 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-amber-350 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Status Feedbacks */}
                {authErrorMsg && (
                  authErrorMsg === 'auth/network-request-failed' ? (
                    <div className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-500/30 p-4 rounded-xl flex flex-col gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <div className="flex items-center gap-2 font-bold text-rose-400">
                        <span className="text-sm">⚠️</span>
                        <span>Error de Red / Bloqueo de Firebase Detectado</span>
                      </div>
                      <p className="leading-relaxed text-left text-rose-200/90 font-sans">
                        No se pudo conectar con los servidores de autenticación de Google (<code>auth/network-request-failed</code>). Esto ocurre habitualmente porque un <strong>bloqueador de anuncios/rastreadores</strong> (como uBlock Origin, AdBlock Plus o Brave Shields) o un firewall de red está impidiendo la conexión saliente con <code>identitytoolkit.googleapis.com</code>.
                      </p>
                      <div className="border-t border-rose-500/10 pt-2.5 space-y-1 text-left text-[10.5px]">
                        <p className="font-semibold text-rose-400/90 font-sans">🔧 ¿Cómo solucionarlo?</p>
                        <ul className="list-disc pl-4 space-y-1 text-rose-200/80 font-sans">
                          <li>Desactive o pause temporalmente su bloqueador de anuncios o los escudos de Brave para este sitio web.</li>
                          <li>Intente acceder utilizando una ventana de incógnito del navegador sin extensiones activas.</li>
                          <li>Si la página está cargándose dentro de un marco de vista previa (iframe), ábrala en una pestaña nueva del navegador.</li>
                        </ul>
                      </div>
                      <div className="border-t border-rose-500/10 pt-3 flex flex-col gap-2">
                        <p className="text-[11px] text-amber-300/90 font-bold font-sans">Modo de Emergencia Interactiva:</p>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthErrorMsg(null);
                            onEnter();
                          }}
                          className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[10.5px] tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-md h-9"
                        >
                          Entrar en Modo Local (Invitado Libre)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-rose-400 bg-rose-950/40 border border-rose-500/20 p-2.5 rounded-xl flex items-start gap-2">
                      <span className="font-extrabold">⚠️</span>
                      <span className="text-left leading-relaxed">{authErrorMsg}</span>
                    </div>
                  )
                )}

                {authSuccessMsg && (
                  <div className="text-[11px] text-[#1A56DB] bg-[#003732]/40 border border-[#1A56DB]/20 p-2.5 rounded-xl flex items-start gap-2">
                    <span className="font-extrabold">✓</span>
                    <span>{authSuccessMsg}</span>
                  </div>
                )}

                {/* Action Submit Button */}
                <button
                  id="submit-auth-btn"
                  type="submit"
                  disabled={isLoadingAuth}
                  className="w-full py-2.5 bg-gradient-to-r from-[#1A56DB] to-[#04c0ae] hover:from-[#c7ffd3] hover:to-[#1A56DB] text-[#003732] font-black uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(26, 86, 219,0.15)]"
                >
                  {isLoadingAuth ? (
                    <span className="h-3 w-3 border-2 border-[#003732] border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <LogIn className="h-3.5 w-3.5" />
                  )}
                  {authMode === 'login' ? 'Iniciar Sesión' : 'Registrar Cuenta'}
                </button>

                {/* Assistance link */}
                <div className="text-center pt-1">
                  <button
                    id="assistance-link-btn"
                    type="button"
                    onClick={() => {
                      setShowRecoveryModal(true);
                      setRecoveryMessage(null);
                      setRecoveryOption(null);
                      setPrimaryEmailRecoveryInput('');
                      setSecondaryEmailRecoveryInput('');
                    }}
                    className="text-[11px] text-amber-200/80 hover:text-amber-300 underline cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    ¿Olvidaste tu correo o contraseña?
                  </button>
                </div>

              </form>
            </div>

            {/* Action Row for Guest Access */}
            <div className="flex flex-col items-center justify-center gap-4 w-full pt-1">
              <button
                onClick={onEnter}
                className="w-full max-w-md px-8 py-3 bg-[#1A56DB] hover:bg-[#c7ffd3] text-[#003732] font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all outline-none cursor-pointer h-[44px] flex items-center justify-center shadow-[0_0_15px_rgba(26, 86, 219,0.12)]"
              >
                {t('iniciar_como_invitado') || 'Explorar como Invitado'}
              </button>
            </div>

            {/* Bottom centered Saber Mas button */}
            <button
              onClick={onShowProyecto}
              className="w-auto px-8 py-2 bg-transparent hover:bg-[#c7ffd3] hover:text-[#003732] hover:border-[#c7ffd3] border border-[#1A56DB]/40 text-[#1A56DB] font-bold rounded-full text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all outline-none cursor-pointer h-[40px] flex items-center justify-center"
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
          <div className="w-16 h-1 bg-[#1A56DB] mx-auto rounded-full"></div>
        </div>

        {/* Bento Grid layout matching the reference mockup */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* CARD 1: Adquiere tu Mapa Físico (col-span-12 md:col-span-7) */}
          <div className="col-span-1 md:col-span-7 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl flex flex-col justify-between overflow-hidden relative group hover:border-[#1A56DB]/40 transition-colors min-h-[240px]">
            <div className="space-y-4 max-w-sm text-left">
              <div className="w-11 h-11 rounded-xl bg-[#1A56DB]/10 flex items-center justify-center text-[#1A56DB] border border-[#1A56DB]/20">
                <Map className="w-5 h-5 text-[#1A56DB]" />
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">
                {t('physical_map_title')}
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                {t('physical_map_desc')}
              </p>
            </div>

            {/* Tenous watermark map SVG */}
            <div className="absolute bottom-[-15%] right-[-5%] w-56 h-56 text-[#1A56DB]/[0.04] pointer-events-none select-none group-hover:scale-105 group-hover:text-[#1A56DB]/[0.08] transition-all duration-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
            </div>
          </div>

          {/* CARD 2: Visita los Sitios (col-span-12 md:col-span-5) */}
          <div className="col-span-1 md:col-span-5 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-[#1A56DB]/40 transition-colors text-left">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#1A56DB]/10 flex items-center justify-center text-[#1A56DB] border border-[#1A56DB]/20">
                <Compass className="w-5 h-5 text-[#1A56DB]" />
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">
                {t('visit_sites_title')}
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                {t('visit_sites_desc')}
              </p>
            </div>
            
            {/* Design detail bottom line */}
            <div className="h-1 w-12 bg-[#1A56DB]/30 rounded"></div>
          </div>

          {/* CARD 3: GPS Check-in (col-span-12 md:col-span-5) */}
          <div className="col-span-1 md:col-span-5 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-[#1A56DB]/40 transition-colors text-left">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#1A56DB]/10 flex items-center justify-center text-[#1A56DB] border border-[#1A56DB]/20">
                <MapPin className="w-5 h-5 text-[#1A56DB]" />
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
              <span className="text-[10px] font-black tracking-widest text-[#1A56DB] uppercase">
                {t('realtime_validation')}
              </span>
            </div>
          </div>

          {/* CARD 4: Gana cNFTs Exclusivos (col-span-12 md:col-span-7) */}
          <div className="col-span-1 md:col-span-7 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl flex flex-col justify-between overflow-hidden relative group hover:border-[#1A56DB]/40 transition-colors min-h-[240px]">
            
            <div className="space-y-4 max-w-sm text-left flex-1 flex flex-col justify-between relative z-10">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#1A56DB]/10 flex items-center justify-center text-[#1A56DB] border border-[#1A56DB]/20 mb-4">
                  <Sparkles className="w-5 h-5 text-[#1A56DB]" />
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
                <div className="p-1.5 rounded bg-[#1A56DB]/10 border border-[#1A56DB]/20" title="Trophy">
                  <Trophy className="w-3.5 h-3.5 text-[#1A56DB]" />
                </div>
                <div className="p-1.5 rounded bg-[#1A56DB]/10 border border-[#1A56DB]/20" title="License Badge">
                  <Award className="w-3.5 h-3.5 text-[#1A56DB]" />
                </div>
                <div className="p-1.5 rounded bg-[#1A56DB]/10 border border-[#1A56DB]/20" title="Block Ledger">
                  <Layers className="w-3.5 h-3.5 text-[#1A56DB]" />
                </div>
              </div>
            </div>

            {/* Tenous watermark NFT SVG */}
            <div className="absolute bottom-[-15%] right-[-5%] w-56 h-56 text-[#1A56DB]/[0.04] pointer-events-none select-none group-hover:scale-105 group-hover:text-[#1A56DB]/[0.08] transition-all duration-500">
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
          <div className="col-span-1 md:col-span-12 bg-[#001721] border border-[#005049]/25 p-4 sm:p-8 rounded-3xl hover:border-[#1A56DB]/40 transition-colors text-left space-y-6">
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
              <h3 className="font-headline text-lg sm:text-xl font-extrabold text-[#1A56DB] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1A56DB]" />
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
                  hover: { borderColor: "rgba(26, 86, 219, 0.45)" }
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
        <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#1A56DB] max-w-2xl mx-auto leading-relaxed">
          {t('footer_manifesto')}
        </p>
        <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface max-w-xl mx-auto leading-tight">
          {t('listo_comenzar_coleccion')}
        </h2>
        <button
          onClick={onShowProyecto}
          className="px-10 py-5 bg-[#1A56DB] hover:bg-[#c7ffd3] text-[#003732] font-black rounded-xl text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(26, 86, 219,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all outline-none cursor-pointer"
        >
          {t('saber_mas')}
        </button>
      </section>

      {/* Dynamic Profile Carousel */}
      <UserProfilesCarousel />

      {/* 5. FOOTER SECTION */}
      <footer className="bg-[#00080d] border-t border-[#005049]/20 pt-16 pb-10 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[3fr_4fr_3fr] gap-8 text-left pb-12 border-b border-[#005049]/15">
          {/* Logo & Manifesto Column */}
          <div className="col-span-1 space-y-4 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 select-none">
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
            <div className="flex flex-col items-center gap-2">
              <img 
                src={logoAvatar} 
                alt="Logo Avatar" 
                referrerPolicy="no-referrer"
                className="max-w-[124px] h-auto object-contain block"
              />
              <span className="text-[10px] text-on-surface-variant/60 font-mono font-medium block mt-1">
                (Idea, conceptualización y desarrollo | Nelson Salinas)
              </span>
            </div>
          </div>

          {/* Comunidad Column (Center) */}
          <div className="col-span-1 space-y-3.5 flex flex-col items-start text-left">
            <h4 className="text-[10px] font-black text-on-surface tracking-widest uppercase pb-1.5 border-b border-[#005049]/10 w-full text-left">
              {t('comunidad')}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant/80 items-start">
              <a href="#instagram" className="hover:text-[#1A56DB] hover:underline transition-all">Instagram</a>
              <a href="#twitter" className="hover:text-[#1A56DB] hover:underline transition-all">Twitter / X</a>
              <a href="#discord" className="hover:text-[#1A56DB] hover:underline transition-all">Discord</a>
            </div>

            {/* Relocated Admin Panel Card */}
            <div className="bg-[#001019] border border-[#1A56DB]/20 rounded-2xl p-4 space-y-4 w-full max-w-sm mt-4 text-center mx-auto md:mx-0">
              <div className="flex items-center justify-center gap-2 border-b border-[#1A56DB]/15 pb-2">
                <Lock className="w-4 h-4 text-[#1A56DB]" />
                <span className="font-headline text-[11px] font-bold text-[#1A56DB] uppercase tracking-widest block">
                  Panel de Administrador
                </span>
                <span className="text-[8px] uppercase bg-[#1A56DB]/10 px-1.5 py-0.5 rounded text-[#1A56DB] font-mono">
                  SECURE GATE
                </span>
              </div>

              {user && isCurrentUserAdmin ? (
                <div className="space-y-3.5 text-center flex flex-col items-center">
                  <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border border-emerald-300"></span>
                    <span>Sesión de Administrador Activa</span>
                  </div>
                  <p className="text-[11px] text-[#8c9f9e] font-mono bg-[#00080d] px-3 py-1 rounded-lg border border-[#005049]/15">
                    {user.name} ({user.email})
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onEnterHiddenAdminPage) onEnterHiddenAdminPage();
                    }}
                    className="w-full py-2.5 bg-secondary text-on-secondary text-xs font-black rounded-xl hover:brightness-110 active:scale-95 transition-all outline-none uppercase cursor-pointer"
                  >
                    Abrir Panel Supremo
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-center flex flex-col items-center">
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Sincroniza y autoriza cambios en Firestore iniciando sesión como administrador.
                  </p>
                  
                  <div className="space-y-2 w-full">
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="ingresa correo"
                      className="w-full bg-[#00080d] border border-[#1A56DB]/25 rounded-xl text-on-surface px-3 py-1.5 text-xs placeholder:text-on-surface-variant/40 outline-none focus:border-[#1A56DB] transition-all text-center"
                    />

                    <div className="flex gap-2 w-full justify-center">
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
                        placeholder="ingresa contraseña"
                        className="flex-1 bg-[#00080d] border border-[#1A56DB]/25 rounded-xl text-on-surface px-3 py-1.5 text-xs font-mono placeholder:text-on-surface-variant/40 outline-none focus:border-[#1A56DB] transition-all text-center"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAdminPassword}
                        className="px-3.5 py-1.5 bg-[#1A56DB]/10 border border-[#1A56DB]/40 text-[#1A56DB] text-[11px] font-black rounded-xl hover:brightness-110 hover:border-[#1A56DB] hover:bg-[#1A56DB]/20 active:scale-95 transition-all outline-none uppercase cursor-pointer min-w-[72px] flex items-center justify-center"
                        disabled={isLoadingAuth}
                      >
                        {isLoadingAuth ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Entrar'
                        )}
                      </button>
                    </div>
                  </div>

                  {adminSuccessMsg && (
                    <p className="text-[10px] text-[#22c55e] font-semibold animate-pulse mt-1">
                      ✅ {adminSuccessMsg}
                    </p>
                  )}
                  {adminPasswordError && (
                    <p className="text-[10px] text-rose-400 font-semibold animate-pulse mt-1">
                      ⚠️ {adminPasswordError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Legal y Soporte Column */}
          <div className="col-span-1 space-y-3.5 md:pl-8">
            <h4 className="text-[10px] font-black text-on-surface tracking-widest uppercase pb-1.5 border-b border-[#005049]/10">
              {t('soporte')} y {t('legal')}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant/80">
              <a href="#help" className="hover:text-[#1A56DB] hover:underline transition-all">{t('centro_ayuda')}</a>
              <a href="#contact" className="hover:text-[#1A56DB] hover:underline transition-all">{t('contacto')}</a>
              <div className="h-px bg-[#005049]/10 my-0.5" />
              <a 
                href="/proyecto" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onShowProyecto) onShowProyecto();
                }}
                className="hover:text-[#1A56DB] hover:underline transition-all cursor-pointer font-bold text-secondary"
              >
                Sobre el Proyecto
              </a>
              <a 
                href="/terminos" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onShowTerms) onShowTerms();
                }}
                className="hover:text-[#1A56DB] hover:underline transition-all cursor-pointer"
              >
                {t('terminos')}
              </a>
              <a 
                href="/privacidad" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onShowPrivacy) onShowPrivacy();
                }}
                className="hover:text-[#1A56DB] hover:underline transition-all cursor-pointer"
              >
                {t('privacidad')}
              </a>
              <a href="#cookies" className="hover:text-[#1A56DB] hover:underline transition-all">{t('cookies_policy')}</a>
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

      {/* --- ASSISTANCE RECOVERY MODAL --- */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#00171f] border border-amber-400/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="p-5 border-b border-[#005049]/20 flex items-center justify-between bg-[#001c27]">
              <h3 className="font-headline text-xs sm:text-sm font-black text-[#1A56DB] uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-[#1A56DB]" />
                Asistencia de Credenciales
              </h3>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="p-1 text-on-surface-variant/70 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              
              {/* Option Toggles */}
              <div className="grid grid-cols-2 gap-2 border border-[#1A56DB]/15 p-1 rounded-xl bg-black/30">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryOption('A');
                    setRecoveryMessage(null);
                    setPrimaryEmailRecoveryInput('');
                    setSecondaryEmailRecoveryInput('');
                  }}
                  className={`text-center py-2 text-[10px] sm:text-xs font-bold uppercase rounded-lg cursor-pointer transition-all ${
                    recoveryOption === 'A'
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                      : 'text-on-surface-variant/70 hover:text-[#1A56DB]'
                  }`}
                >
                  Olvidé mi contraseña
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryOption('B');
                    setRecoveryMessage(null);
                    setPrimaryEmailRecoveryInput('');
                    setSecondaryEmailRecoveryInput('');
                  }}
                  className={`text-center py-2 text-[10px] sm:text-xs font-bold uppercase rounded-lg cursor-pointer transition-all ${
                    recoveryOption === 'B'
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                      : 'text-on-surface-variant/70 hover:text-[#1A56DB]'
                  }`}
                >
                  Olvidé mi correo
                </button>
              </div>

              {!recoveryOption && (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-[#8c9f9e]">
                    ¿Qué credencial necesitas recuperar hoy? Selecciona una de las opciones superiores.
                  </p>
                  <div className="text-[11px] leading-relaxed text-amber-300/80 font-medium bg-amber-950/25 border border-amber-400/10 p-3.5 rounded-xl max-w-sm mx-auto text-left">
                    • <strong>Opción A:</strong> Restablece tu contraseña enviando un enlace y generando un token temporal.<br/>
                    • <strong>Opción B:</strong> Recupera y visualiza tu correo principal usando tu correo secundario.
                  </div>
                </div>
              )}

              {/* Option A View: Forgot Password */}
              {recoveryOption === 'A' && (
                <form onSubmit={handleRecoveryOptionASubmit} className="space-y-3.5 text-left">
                  <div className="p-3 bg-amber-400/5 border border-amber-400/10 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-300">Opción A: Restablecer Contraseña</span>
                    <p className="text-[11px] text-[#8c9f9e] leading-relaxed">
                      Verificaremos si el correo principal está en Firestore. Si existe, generamos un token de recuperación único y temporal con expiración de 1 de hora, y te enviaremos el enlace oficial.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-[#1A56DB]/70">Correo Principal Registrado</label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={primaryEmailRecoveryInput}
                      onChange={(e) => setPrimaryEmailRecoveryInput(e.target.value)}
                      className="w-full bg-[#00080d] border border-[#1A56DB]/20 rounded-xl px-4 py-2 text-xs text-on-surface outline-none focus:border-[#1A56DB] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs tracking-wider rounded-xl hover:scale-[1.01] transition-transform cursor-pointer"
                  >
                    Verificar y Enviar Enlace
                  </button>
                </form>
              )}

              {/* Option B View: Forgot Email */}
              {recoveryOption === 'B' && (
                <form onSubmit={handleRecoveryOptionBSubmit} className="space-y-3.5 text-left">
                  <div className="p-3 bg-amber-400/5 border border-amber-400/10 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-300">Opción B: Recuperar Correo Principal</span>
                    <p className="text-[11px] text-[#8c9f9e] leading-relaxed">
                      Ingresa el correo secundario/alternativo registrado previamente en tu cuenta. Buscaremos la cuenta asociada en Firestore para revelarte el correo principal.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-amber-300">Correo Secundario / Respaldo</label>
                    <input
                      type="email"
                      required
                      placeholder="backup_mail@ejemplo.com"
                      value={secondaryEmailRecoveryInput}
                      onChange={(e) => setSecondaryEmailRecoveryInput(e.target.value)}
                      className="w-full bg-[#00080d] border border-[#1A56DB]/20 rounded-xl px-4 py-2 text-xs text-on-surface outline-none focus:border-[#1A56DB] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs tracking-wider rounded-xl hover:scale-[1.01] transition-transform cursor-pointer"
                  >
                    Localizar Mi Cuenta
                    </button>
                </form>
              )}

              {/* Result Message Container */}
              {recoveryMessage && (
                <div className={`p-3.5 rounded-xl text-left space-y-1 ${
                  recoveryMessage.type === 'success'
                    ? 'bg-[#002f2a]/80 text-[#1A56DB] border border-[#1A56DB]/20'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-500/20'
                }`}>
                  <div className="font-black flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <span>{recoveryMessage.type === 'success' ? '✓ Operación Exitosa' : '⚠️ Error de Recuperación'}</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">{recoveryMessage.text}</p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-black/30 p-4 border-t border-[#005049]/20 text-center flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="px-6 py-1.5 border border-[#1A56DB]/30 text-[#1A56DB] rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-[#1A56DB]/10 transition-colors cursor-pointer"
              >
                Volver al Login
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

