/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Mail, 
  Wallet, 
  RefreshCw, 
  Check, 
  Trash2, 
  ShieldCheck,
  Award,
  Camera,
  Upload,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import { UserProfile, Location } from '../types';
import { useLanguage } from '../translations';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletCard } from './WalletCard';
import { ConnectWalletButton } from './ConnectWalletButton';
import { LIST_AVATARS } from '../utils/avatars';

const PRESET_AVATARS = LIST_AVATARS;

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onResetToMockupState: () => void;
  onResetToZeroState: () => void;
  onLogout?: () => void;
  lockedRouteIds: string[];
  setLockedRouteIds: (ids: string[]) => void;
  locations: Location[];
}

export default function SettingsView({
  user,
  onUpdateUser,
  onResetToMockupState,
  onResetToZeroState,
  onLogout,
  lockedRouteIds,
  setLockedRouteIds,
  locations
}: SettingsViewProps) {
  const { t, translateUser } = useLanguage();
  const { publicKey, connected } = useWallet();

  // Local form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState(user.title);
  const [wallet, setWallet] = useState(user.linkedWallet);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [bio, setBio] = useState(user.bio || '');

  // Synchronically auto-update the destination wallet input field if a wallet gets connected
  useEffect(() => {
    if (connected && publicKey) {
      setWallet(publicKey.toBase58());
    }
  }, [connected, publicKey]);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [showConfirmResetMock, setShowConfirmResetMock] = useState(false);
  const [showConfirmResetZero, setShowConfirmResetZero] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const handleVerifyAdminPassword = () => {
    if (adminPassword !== '009286') {
      setAdminPasswordError('Contraseña incorrecta. Se requiere autorización de administrador.');
      return;
    }
    setAdminPasswordError(null);
    setIsAdminUnlocked(true);
    setAdminPassword('');
    setAdminSuccessMsg('Panel de administrador desbloqueado con éxito');
    setTimeout(() => setAdminSuccessMsg(null), 3000);
  };

  const handleToggleIndividualRoute = (routeId: string) => {
    if (lockedRouteIds.includes(routeId)) {
      setLockedRouteIds(lockedRouteIds.filter(id => id !== routeId));
      setAdminSuccessMsg('Ruta configurada como Activa');
    } else {
      setLockedRouteIds([...lockedRouteIds, routeId]);
      setAdminSuccessMsg('Ruta configurada como Bloqueada');
    }
    setTimeout(() => setAdminSuccessMsg(null), 3000);
  };

  const handleLockAllRoutes = () => {
    setLockedRouteIds(locations.map(loc => loc.id));
    setAdminSuccessMsg('Todas las rutas bloqueadas');
    setTimeout(() => setAdminSuccessMsg(null), 3000);
  };

  const handleUnlockAllRoutes = () => {
    setLockedRouteIds([]);
    setAdminSuccessMsg('Todas las rutas desbloqueadas');
    setTimeout(() => setAdminSuccessMsg(null), 3000);
  };

  // Sync profile data dynamically when switching languages or resetting profile
  useEffect(() => {
    const translatedUser = translateUser(user);
    setName(translatedUser.name);
    setEmail(translatedUser.email);
    setTitle(translatedUser.title);
    setWallet(translatedUser.linkedWallet);
    setAvatarUrl(translatedUser.avatarUrl);
    setBio(translatedUser.bio || '');
  }, [user, translateUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setErrorMsg(t('avatar_limit_msg'));
        setTimeout(() => setErrorMsg(null), 5000);
        return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      title,
      linkedWallet: wallet,
      avatarUrl,
      bio
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="text-left space-y-2">
        <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2">
          <Settings className="w-6 h-6 text-secondary" style={{ animation: 'spin 12s linear infinite' }} />
          {t('config_explorador_title')}
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed font-sans">
          {t('config_explorador_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Edit Profile Form + Logout Buttons below it */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="bg-surface-container rounded-2xl border border-[#005049]/20 p-6 md:p-8 space-y-6 shadow-lg text-left w-full">
          <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider border-b border-[#005049]/15 pb-2">
            {t('editar_cuenta_section')}
          </h3>

          {/* Avatar & Photo Upload Section */}
          <div className="bg-[#001c24]/50 border border-[#005049]/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-5 items-center">
            {/* Circular Preview with Drag & Drop or Camera icon overlay */}
            <div className="relative group/avatar flex-shrink-0">
              <div 
                className="w-20 h-20 rounded-full overflow-hidden border-2 border-secondary/50 shadow-[0_0_15px_rgba(67,229,212,0.15)] bg-[#001019] flex items-center justify-center relative cursor-pointer group-hover/avatar:border-secondary transition-all"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        setAvatarUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Vista previa del avatar" 
                    className="w-full h-full object-cover transition-transform group-hover/avatar:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-8 h-8 text-on-surface-variant/40" />
                )}
                <div className="absolute inset-0 bg-[#001019]/75 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-[9px] text-secondary font-bold transition-all gap-1">
                  <Camera className="w-4 h-4 text-secondary animate-pulse" />
                  <span>{t('subir_foto_overlay')}</span>
                </div>
              </div>
            </div>

            {/* Upload Buttons and Presets */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wide flex items-center gap-1 justify-center sm:justify-start">
                  <Camera className="w-3.5 h-3.5 text-secondary" /> {t('avatar_viajero_title')}
                </h4>
                <p className="text-[11px] text-[#c8e7fb]/70 leading-relaxed mt-1">
                  {t('avatar_viajero_desc')}
                </p>
              </div>

              {/* Preset avatars list */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {PRESET_AVATARS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(p.url);
                      setErrorMsg(null);
                    }}
                    title={p.name}
                    aria-label={`Seleccionar avatar de ${p.name}`}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 focus:outline-none transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      avatarUrl === p.url ? 'border-secondary scale-105 ring-2 ring-secondary/25' : 'border-[#005049]/40 hover:border-secondary'
                    }`}
                  >
                    <img src={p.url} alt={`Avatar preset ${p.name}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  aria-label="Subir foto de perfil"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  aria-label="Haz click para buscar y subir tu foto de avatar"
                  className="py-1.5 px-3 bg-[#0d2a29] border border-[#43e5d4]/30 hover:border-[#43e5d4] hover:bg-[#113837] text-[11px] font-bold rounded-lg text-[#43e5d4] flex items-center gap-1.5 transition-all outline-none cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t('subir_foto_btn')}
                </button>
              </div>

            </div>
          </div>

          {errorMsg && (
            <div role="alert" className="bg-error-container/15 border border-error/30 text-error rounded-xl p-3 text-xs font-semibold animate-in slide-in-from-top-1 duration-150">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Explorer Nickname */}
            <div className="space-y-2">
              <label htmlFor="explorer-name" className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-secondary" /> {t('nombre_explorador_lbl')}
              </label>
              <input
                id="explorer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Nombre del explorador"
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                placeholder='Ej. Felix "The Voyager"'
              />
            </div>

            {/* Explorer Title */}
            <div className="space-y-2">
              <label htmlFor="explorer-honorific" className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-secondary" /> {t('titulo_honorifico_lbl')}
              </label>
              <input
                id="explorer-honorific"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Título Honorífico"
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                placeholder="Ej. Explorador Supremo"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="explorer-email" className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-secondary" /> {t('correo_vinculado_lbl')}
              </label>
              <input
                id="explorer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Correo electrónico"
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* Linked Wallet Address */}
            <div className="space-y-2">
              <label htmlFor="explorer-wallet" className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-secondary" /> {t('billetera_destino_lbl')}
              </label>
              <input
                id="explorer-wallet"
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
                aria-label="Billetera Solana de Destino"
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-xs font-mono text-secondary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                placeholder="Solana public address..."
              />
            </div>

            {/* Biography */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="explorer-bio" className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Settings className="w-3.5 h-3.5 text-secondary" /> {t('biografia_lbl')}
              </label>
              <textarea
                id="explorer-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                aria-label="Biografía"
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 font-sans resize-none"
                placeholder="Escribe una breve reseña de ti como explorador..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#005049]/15 flex items-center justify-between gap-4">
            {saveSuccess ? (
              <span className="text-xs text-tertiary font-bold flex items-center gap-1 animate-bounce">
                <ShieldCheck className="w-4 h-4 fill-surface-container" /> {t('sincronizacion_exitosa')}
              </span>
            ) : (
              <span className="text-xs text-on-surface-variant/70 italic">
                {t('wallet_implicit_msg')}
              </span>
            )}
            
            <button
              id="btn-save-settings"
              type="submit"
              className="py-3 px-6 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all outline-none"
            >
              {t('guardar_cambios_btn')}
            </button>
          </div>
        </form>

        {/* cerrrar sesion button outside the sandbox card and form card */}
        {onLogout && (
          <div className="bg-surface-container rounded-2xl border border-secondary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-lg select-none">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5 text-secondary">
                <Unlock className="w-4 h-4" /> {t('cerrar_sesion_btn')}
              </h4>
              <p className="text-[11px] text-on-surface-variant max-w-sm leading-relaxed font-sans">
                Finaliza tu sesión activa como explorador de forma segura y regresa a la pantalla de entrada de la Bitácora Digital.
              </p>
            </div>
            <button
              id="btn-logout-settings"
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto py-3 px-6 bg-[#001019] border border-secondary/40 hover:border-secondary hover:bg-secondary/10 text-secondary text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all text-center cursor-pointer shadow-sm uppercase tracking-wider"
            >
              Cerrar Sesión e Ir al Inicio
            </button>
          </div>
        )}
      </div>

        {/* Right Panel: Wallet Card & Admin Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECURE BLOCKCHAIN WALLET CARD */}
          <WalletCard />

          {/* PANEL DE ADMINISTRADOR CON CONTRASEÑA */}
          <div className="bg-surface-container rounded-2xl border border-secondary/20 p-6 space-y-4 shadow-lg text-left">
            <h3 className="font-headline text-sm font-bold text-secondary uppercase tracking-wider border-b border-secondary/15 pb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-secondary" /> PANEL DE ADMINISTRADOR
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Controla de forma individual el acceso a cada una de las rutas de exploración de Caracas. Autentícate con la contraseña para desbloquear el control de rutas.
            </p>
            
            {!isAdminUnlocked ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-wider text-secondary mb-1 flex items-center gap-1">
                    <Key className="w-4 h-4 text-secondary shrink-0" /> CONTRASEÑA DE ACCESO
                  </label>
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
                      placeholder="Introduce la contraseña (009286)..."
                      className="flex-1 bg-[#001420] border border-secondary/20 rounded-xl text-on-surface px-4 py-2.5 text-xs font-mono placeholder:text-on-surface-variant/40 outline-none focus:border-secondary transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAdminPassword}
                      className="px-4 py-2.5 bg-secondary text-on-secondary text-xs font-black rounded-xl hover:brightness-105 active:scale-95 transition-all outline-none uppercase cursor-pointer"
                    >
                      Acceder
                    </button>
                  </div>
                </div>

                {adminPasswordError && (
                  <p className="text-xs text-red-400 font-medium flex items-center gap-1.5 mt-1 animate-pulse">
                    <span>⚠️</span> {adminPasswordError}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between bg-secondary/10 border border-secondary/25 p-3 rounded-xl">
                  <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                    Sesión de Administrador Activa
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminUnlocked(false);
                      setAdminSuccessMsg('Sesión cerrada');
                      setTimeout(() => setAdminSuccessMsg(null), 2000);
                    }}
                    className="text-[10px] uppercase font-black text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    Salir
                  </button>
                </div>

                {adminSuccessMsg && (
                  <p className="text-xs text-tertiary font-bold flex items-center gap-1.5 animate-bounce">
                    <span>✅</span> {adminSuccessMsg}
                  </p>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-secondary mb-2">
                    SELECCIONA QUÉ RUTAS BLOQUEAR / DESBLOQUEAR
                  </label>
                  
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {locations.map((loc, idx) => {
                      const isLocked = lockedRouteIds.includes(loc.id);
                      return (
                        <div 
                          key={loc.id} 
                          className={`flex items-center justify-between p-3 rounded-xl border gap-2 transition-all ${
                            isLocked 
                              ? 'bg-red-950/10 border-red-500/20 text-rose-400/90' 
                              : 'bg-[#001c27] border-secondary/20 text-[#c8e7fb]'
                          }`}
                        >
                          <div className="flex flex-col text-left min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">
                              Ruta {idx + 1}
                            </span>
                            <span className="text-xs font-bold truncate" title={loc.name}>
                              {loc.name}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleToggleIndividualRoute(loc.id)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isLocked
                                ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/40 font-mono font-bold'
                                : 'bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20 font-mono font-bold'
                            }`}
                          >
                            {isLocked ? '🔒 Bloqueada' : '🔓 Activa'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick actions for all locks */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={handleLockAllRoutes}
                    className="py-2 px-3 bg-red-950/25 hover:bg-red-950/40 border border-rose-500/25 text-rose-400 font-bold rounded-xl text-[10px] uppercase text-center transition-all cursor-pointer"
                  >
                    Bloquear Todas
                  </button>
                  <button
                    type="button"
                    onClick={handleUnlockAllRoutes}
                    className="py-2 px-3 bg-[#0d2a29] hover:bg-[#113837] border border-secondary/35 text-secondary font-bold rounded-xl text-[10px] uppercase text-center transition-all cursor-pointer"
                  >
                    Habilitar Todas
                  </button>
                </div>

                {/* RELOCATED RESET & DEMO TOOLS INSIDE THEIR OWN CARD INSIDE OF THE ADMIN PANEL CARD */}
                <div className="bg-background/80 border border-error/25 p-4 rounded-xl space-y-3 mt-4 text-left shadow-inner">
                  <h4 className="text-[11px] font-extrabold text-error uppercase tracking-wider flex items-center gap-1.5 border-b border-error/10 pb-2">
                    <Trash2 className="w-3.5 h-3.5 text-error" /> {t('pruebas_reseteo_title')}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    {t('pruebas_reseteo_desc')}
                  </p>
                  
                  <div className="space-y-3">
                    {/* RESET TO MOCKUP STATE (4/6 CURRENT STATUS) */}
                    <div className="space-y-2">
                      <button
                        id="btn-reset-mockup"
                        type="button"
                        onClick={() => {
                          setShowConfirmResetMock(true);
                          setShowConfirmResetZero(false);
                        }}
                        className="w-full py-2 bg-[#43e5d4]/10 border border-secondary/20 hover:border-secondary text-secondary text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#43e5d4]/15 transition-all text-center cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t('regresar_mockup_btn')}
                      </button>
                      {showConfirmResetMock && (
                        <div className="bg-[#000f16] p-3 rounded-lg border border-secondary/20 text-[10px] space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                          <p className="text-on-surface-variant">{t('regresar_mockup_confirm')}</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onResetToMockupState();
                                setShowConfirmResetMock(false);
                              }}
                              className="bg-secondary text-on-secondary font-bold px-3 py-1 rounded text-[10px] cursor-pointer animate-pulse"
                            >
                              {t('si_restablecer_btn')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowConfirmResetMock(false)}
                              className="bg-[#0c1c24] border border-[#005049]/20 text-on-surface-variant px-3 py-1 rounded text-[10px] cursor-pointer"
                            >
                              {t('cancelar_btn')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RESET TO COMPLETE ZERO STATE (0/6 CURRENT STATUS) */}
                    <div className="space-y-2">
                      <button
                        id="btn-reset-zero"
                        type="button"
                        onClick={() => {
                          setShowConfirmResetZero(true);
                          setShowConfirmResetMock(false);
                        }}
                        className="w-full py-2 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500 text-rose-400 text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-rose-500/15 transition-all text-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('reiniciar_cero_btn')}
                      </button>
                      {showConfirmResetZero && (
                        <div className="bg-[#000f16] p-3 rounded-lg border border-rose-500/25 text-[10px] space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                          <p className="text-on-surface-variant">{t('reiniciar_cero_confirm')}</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onResetToZeroState();
                                setShowConfirmResetZero(false);
                              }}
                              className="bg-rose-500 border border-rose-500 text-white font-bold px-3 py-1 rounded text-[10px] cursor-pointer"
                            >
                              {t('si_borrar_todo_btn')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowConfirmResetZero(false)}
                              className="bg-[#0c1c24] border border-[#005049]/20 text-on-surface-variant px-3 py-1 rounded text-[10px] cursor-pointer"
                            >
                              {t('cancelar_btn')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
