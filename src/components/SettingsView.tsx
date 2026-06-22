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
  Key,
  Copy,
  Compass,
  ExternalLink,
  AlertCircle,
  Layers,
  Activity
} from 'lucide-react';
import { UserProfile, Location } from '../types';
import { useLanguage } from '../translations';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LIST_AVATARS } from '../utils/avatars';
import { auth, uploadAvatarToStorage, updateUserProfileAuth } from '../utils/firebase';
import '@solana/wallet-adapter-react-ui/styles.css';

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
  const { language, t, translateUser } = useLanguage();
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();

  // Local form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState(user.title);
  const [wallet, setWallet] = useState(user.linkedWallet);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [bio, setBio] = useState(user.bio || '');
  const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Web3 Solana integration states
  const [isIframe, setIsIframe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [realBalance, setRealBalance] = useState<number | null>(null);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [copiedWalletFull, setCopiedWalletFull] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  const fetchRealBalance = async () => {
    if (!publicKey || !connection) {
      setRealBalance(null);
      return;
    }
    setFetchingBalance(true);
    setBalanceError(null);
    try {
      const lamports = await connection.getBalance(publicKey, 'confirmed');
      setRealBalance(lamports / 1000000000); // 10^9 lamports per SOL
    } catch (err: any) {
      console.warn("Error fetching wallet balance via main RPC. Trying fallback...", err);
      try {
        const { Connection } = await import('@solana/web3.js');
        const fallbackConn = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        const lamports = await fallbackConn.getBalance(publicKey);
        setRealBalance(lamports / 1000000000);
      } catch (fallbackErr) {
        console.error("All Solana balance fetch attempts failed", fallbackErr);
        setBalanceError("No se pudo obtener el balance");
        setRealBalance(0);
      }
    } finally {
      setFetchingBalance(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchRealBalance();
    } else {
      setRealBalance(null);
    }
  }, [connected, publicKey, connection]);

  useEffect(() => {
    if (connected && publicKey && onUpdateUser && user) {
      const currentAddress = publicKey.toBase58();
      if (user.linkedWallet !== currentAddress) {
        console.log("Auto-synchronizing connected wallet inside SettingsView:", currentAddress);
        onUpdateUser({
          ...user,
          linkedWallet: currentAddress
        });
      }
    }
  }, [connected, publicKey]);

  const handleCopyWalletFull = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopiedWalletFull(true);
      setTimeout(() => setCopiedWalletFull(false), 2000);
    } catch (err) {
      console.error("Failed to copy wallet address:", err);
    }
  };

  const handleCopyDappLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      alert("¡Enlace de la dApp copiado al portapapeles! Puedes pegarlo en el explorador de tu billetera (Phantom/Solflare).");
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

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
  }, [user.email, user.joinedDate, language]);

  // Helper to compress and resize custom uploaded photos to save weight and prevent Firestore size limits
  const compressPhotoAndSet = (base64Str: string) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 200;
      const maxH = 200;
      let w = img.width;
      let h = img.height;

      if (w > h) {
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
      } else {
        if (h > maxH) {
          w = Math.round((w * maxH) / h);
          h = maxH;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        // Convert to compressed binary Blob to upload to storage
        canvas.toBlob((blob) => {
          if (blob) {
            setPendingAvatarBlob(blob);
            const previewUrl = URL.createObjectURL(blob);
            setAvatarUrl(previewUrl);
          } else {
            setAvatarUrl(base64Str);
          }
        }, 'image/jpeg', 0.75);
      } else {
        setAvatarUrl(base64Str);
      }
    };
    img.onerror = () => {
      setAvatarUrl(base64Str);
    };
    img.src = base64Str;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          compressPhotoAndSet(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      let finalAvatarUrl = avatarUrl;
      const currentUser = auth.currentUser;

      if (currentUser && pendingAvatarBlob) {
        // 1. Upload to Firebase Storage
        const uploadUrl = await uploadAvatarToStorage(currentUser.uid, pendingAvatarBlob);
        finalAvatarUrl = uploadUrl;
        setAvatarUrl(uploadUrl);
        setPendingAvatarBlob(null);
      }

      // 2. Update Firebase Auth Profile (photoURL and displayName)
      if (currentUser) {
        await updateUserProfileAuth(name, finalAvatarUrl);
      }

      // 3. Update React parent state
      onUpdateUser({
        ...user,
        name,
        email,
        title,
        linkedWallet: wallet,
        avatarUrl: finalAvatarUrl,
        bio
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile settings:", err);
      setErrorMsg("Ocurrió un error al guardar los cambios: " + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
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
                className="w-20 h-20 rounded-full overflow-hidden border-2 border-secondary/50 shadow-[0_0_15px_rgba(26, 86, 219,0.15)] bg-[#001019] flex items-center justify-center relative cursor-pointer group-hover/avatar:border-secondary transition-all"
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
                        compressPhotoAndSet(reader.result);
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
                      setPendingAvatarBlob(null);
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
                  className="py-1.5 px-3 bg-[#0d2a29] border border-[#1A56DB]/30 hover:border-[#1A56DB] hover:bg-[#113837] text-[11px] font-bold rounded-lg text-[#1A56DB] flex items-center gap-1.5 transition-all outline-none cursor-pointer"
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
              disabled={isSaving}
              className={`py-3 px-6 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all outline-none flex items-center gap-2 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-105'
              }`}
            >
              {isSaving && <RefreshCw className="w-4 h-4 animate-spin text-on-secondary" />}
              {isSaving ? 'Guardando...' : t('guardar_cambios_btn')}
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
          
          {/* NATIVE SOLANA BLOCKCHAIN CONNECTION CARD */}
          <div className="bg-gradient-to-tr from-[#001c2a] to-[#002f2d] rounded-2xl border border-secondary/35 p-6 space-y-5 shadow-lg text-left relative overflow-hidden group">
            {/* Background radial glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#1A56DB]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#1A56DB]/10 transition-colors duration-500"></div>

            <div className="flex flex-col gap-1.5 border-b border-[#005049]/25 pb-3">
              <div className="flex items-center justify-between gap-2.5">
                <h3 className="font-headline text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                  <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 rounded-full border border-secondary/30"></div>
                    <Activity className="w-3 h-3 text-secondary" />
                  </div>
                  Integración Solana
                </h3>
                
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-mono font-black uppercase tracking-widest transition-all ${
                  connected 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                  {connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            {connected && publicKey ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Real Connection Wallet Information */}
                <div className="bg-[#000f16]/60 border border-secondary/15 rounded-xl p-3 flex items-center justify-between gap-3 font-mono border-t">
                  <div className="min-w-0 flex-1 text-left">
                    <span className="text-[8px] text-on-surface-variant/40 uppercase font-black tracking-wider block mb-0.5">
                      DIRECCIÓN PÚBLICA
                    </span>
                    <span className="text-xs text-[#c8e7fb] font-bold truncate block select-all font-mono" title={publicKey.toBase58()}>
                      {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-6)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyWalletFull}
                    className="p-1.5 text-secondary hover:text-white rounded-lg hover:bg-secondary/10 transition-colors shrink-0 outline-none cursor-pointer border-0"
                    title="Copiar llave pública"
                  >
                    {copiedWalletFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Real Balance Presentation */}
                <div className="bg-[#000f16]/35 border border-[#005049]/10 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[8px] text-on-surface-variant/40 uppercase font-black tracking-wider block mb-0.5">
                      BALANCE DE LA CUENTA
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black font-mono text-secondary">
                        {fetchingBalance ? (
                          <span className="text-slate-400 text-xs">Cargando...</span>
                        ) : realBalance !== null ? (
                          realBalance.toFixed(5)
                        ) : (
                          '0.00000'
                        )}
                      </span>
                      <span className="text-[10px] font-bold text-on-surface-variant/70">SOL</span>
                    </div>
                    {balanceError && (
                      <span className="text-[9px] text-rose-400 mt-1 block font-mono">{balanceError}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={fetchRealBalance}
                    disabled={fetchingBalance}
                    className="p-1.5 text-secondary hover:text-white rounded-lg hover:bg-secondary/10 transition-all shrink-0 outline-none disabled:opacity-50 cursor-pointer border-0"
                    title="Actualizar balance"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${fetchingBalance ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="bg-[#000f16]/25 border border-[#005049]/10 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant/60 font-medium text-left">Estándar compatible:</span>
                  <span className="font-extrabold font-mono text-[#c8e7fb] flex items-center gap-1 bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10">
                    <Layers className="w-3 h-3 text-secondary" /> SPL cNFT
                  </span>
                </div>

                {/* Manual override button to link current wallet to the profile */}
                <button
                  type="button"
                  onClick={() => {
                    setWallet(publicKey.toBase58());
                    alert("Se ha copiado tu dirección de billetera conectada en el formulario. Recuerda hacer clic en 'Guardar Cambios' para actualizar tu perfil permanentemente.");
                  }}
                  className="w-full py-2.5 bg-[#1A56DB]/10 hover:bg-[#1A56DB]/20 border border-secondary/30 text-secondary hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Vincular dirección a Cuenta
                </button>

                {/* Disconnect Button */}
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-mono cursor-pointer text-center"
                >
                  Desconectar Cuenta
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="text-xs text-on-surface-variant/80 leading-relaxed font-sans text-left">
                  Conecta tu billetera descentralizada oficial de Solana (como Phantom o Solflare) para autenticar tus visitas, sincronizar tu progreso y acuñar tus postales cNFT directamente en la blockchain.
                </p>

                {/* Official Solana Connection Trigger */}
                <div className="flex justify-center py-2 select-none font-sans">
                  <WalletMultiButton 
                    className="!bg-secondary hover:!bg-[#c7ffd3] !text-[#003732] !font-sans !font-black !text-[10px] !uppercase !tracking-wider !rounded-xl !py-2.5 !px-5 !transition-all !duration-300 hover:!scale-[1.02] active:!scale-[0.98] !shadow-[0_0_12px_rgba(26, 86, 219,0.15)] !h-auto !min-h-0"
                  />
                </div>
              </div>
            )}

            {/* IFRAME VISOR ADVICE */}
            {isIframe && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-3.5 text-[11px] leading-relaxed space-y-2 text-left my-2 animate-in fade-in">
                <span className="font-black uppercase tracking-wider text-amber-400 block">⚠️ Restricción de Visor</span>
                <p className="opacity-90 text-[#00E676]">
                  Las billeteras Web3 bloquean las firmas e inicios de sesión si la dApp corre dentro de pantallas integradas (Marcos/iFrames) para tu seguridad. Abre esta dApp en una pestaña nueva para poder interactuar libremente.
                </p>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2 px-3 rounded-xl font-black text-[10.5px] uppercase tracking-wide transition cursor-pointer text-center block shadow"
                >
                  Abrir en Pestaña Nueva
                </a>
              </div>
            )}

            {/* MOBILE COMPATIBILITY SECTION */}
            {isMobile && (
              <div className="bg-[#000d14]/85 border border-cyan-500/25 rounded-xl p-3.5 space-y-3 text-left my-2">
                <span className="text-[9px] font-black tracking-widest uppercase font-mono text-cyan-400 block flex items-center gap-1.5">
                  📲 Guía de Navegador Móvil
                </span>
                <p className="text-[11px] text-cyan-300/80 leading-relaxed font-sans">
                  Los navegadores móviles comunes (Safari/Chrome) no admiten la conexión persistente por razones de seguridad de tu billetera. <strong>Debes navegar dentro de la sección "Browser" nativa de Phantom o Solflare</strong>:
                </p>
                
                <div className="grid grid-cols-1 gap-2 pt-1 font-mono">
                  <a
                    href={`phantom://v1/browse/${encodeURIComponent(window.location.origin + window.location.pathname)}`}
                    className="bg-[#2a0e5c] border border-[#5d1df3]/40 text-[#cbbfff] py-2 px-3 rounded-lg font-bold text-[9px] text-center uppercase tracking-wider block hover:bg-[#3e0d8a] active:scale-95 transition"
                  >
                    Usar de Phantom App
                  </a>
                  <a
                    href={`solflare://ul/v1/browse/${encodeURIComponent(window.location.origin + window.location.pathname)}`}
                    className="bg-[#381a0c] border border-[#f05c10]/40 text-[#ffd5c4] py-2 px-3 rounded-lg font-bold text-[9px] text-center uppercase tracking-wider block hover:bg-[#48200d] active:scale-95 transition"
                  >
                    Usar de Solflare App
                  </a>
                </div>

                <div className="text-center pt-1 border-t border-cyan-500/10">
                  <button
                    type="button"
                    onClick={handleCopyDappLink}
                    className="w-full py-2 bg-cyan-950/30 border border-cyan-500/20 hover:bg-cyan-950/50 text-cyan-400 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition uppercase tracking-wide cursor-pointer border-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Enlace dApp
                  </button>
                </div>
              </div>
            )}
          </div>



        </div>

      </div>

    </div>
  );
}
