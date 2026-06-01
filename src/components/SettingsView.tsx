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
  Upload
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../translations';

const PRESET_AVATARS = [
  { name: 'Felix', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
  { name: 'Sofia', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { name: 'Mateo', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Camila', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
  { name: 'Diego', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Elena', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' }
];

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onResetToMockupState: () => void;
  onResetToZeroState: () => void;
  onLogout?: () => void;
}

export default function SettingsView({
  user,
  onUpdateUser,
  onResetToMockupState,
  onResetToZeroState,
  onLogout
}: SettingsViewProps) {
  const { t, translateUser } = useLanguage();

  // Local form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState(user.title);
  const [wallet, setWallet] = useState(user.linkedWallet);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [showConfirmResetMock, setShowConfirmResetMock] = useState(false);
  const [showConfirmResetZero, setShowConfirmResetZero] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync profile data dynamically when switching languages or resetting profile
  useEffect(() => {
    const translatedUser = translateUser(user);
    setName(translatedUser.name);
    setEmail(translatedUser.email);
    setTitle(translatedUser.title);
    setWallet(translatedUser.linkedWallet);
    setAvatarUrl(translatedUser.avatarUrl);
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
      avatarUrl
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
        
        {/* Left Form Panel: Edit Profile (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-surface-container rounded-2xl border border-[#005049]/20 p-6 md:p-8 space-y-6 shadow-lg text-left">
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
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 focus:outline-none transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      avatarUrl === p.url ? 'border-secondary scale-105 ring-2 ring-secondary/25' : 'border-[#005049]/40 hover:border-secondary'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="py-1.5 px-3 bg-[#0d2a29] border border-[#43e5d4]/30 hover:border-[#43e5d4] hover:bg-[#113837] text-[11px] font-bold rounded-lg text-[#43e5d4] flex items-center gap-1.5 transition-all outline-none cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t('subir_foto_btn')}
                </button>
              </div>

            </div>
          </div>

          {errorMsg && (
            <div className="bg-error-container/15 border border-error/30 text-error rounded-xl p-3 text-xs font-semibold animate-in slide-in-from-top-1 duration-150">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Explorer Nickname */}
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-secondary" /> {t('nombre_explorador_lbl')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                placeholder='Ej. Felix "The Voyager"'
              />
            </div>

            {/* Explorer Title */}
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-secondary" /> {t('titulo_honorifico_lbl')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                placeholder="Ej. Explorador Supremo"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-secondary" /> {t('correo_vinculado_lbl')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* Linked Wallet Address */}
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-secondary" /> {t('billetera_destino_lbl')}
              </label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-xs font-mono text-secondary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20"
                placeholder="Solana public address..."
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

        {/* Right Panel: Wallet Card & Admin Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECURE BLOCKCHAIN WALLET CARD */}
          <div className="bg-gradient-to-tr from-[#001c2a] to-[#002f2d] rounded-2xl border border-secondary/35 p-6 space-y-5 shadow-lg text-left relative overflow-hidden group">
            {/* Ambient holographic background circles */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#43e5d4]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#43e5d4]/10 transition-colors duration-500"></div>

            <div className="flex items-center gap-2 border-b border-secondary/15 pb-3 justify-between">
              <h3 className="font-headline text-sm font-extrabold text-secondary uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#43e5d4]" />
                {t('mi_cartera_title')}
              </h3>
              <span className="text-[9px] font-black uppercase text-[#43e5d4] bg-[#43e5d4]/10 px-2 py-0.5 rounded-full border border-[#43e5d4]/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-[#000f16]/80 border border-secondary/15 rounded-xl p-3.5 space-y-1.5 font-mono relative">
                <p className="text-[9px] text-on-surface-variant/50 uppercase font-bold tracking-widest leading-none">
                  {t('direccion_destino_cnft')}
                </p>
                <p className="text-xs text-[#c8e7fb] truncate font-bold select-all" title={wallet}>
                  {wallet || t('no_vinculada')}
                </p>
              </div>

              {/* Network statistics parameters */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-[#000f16]/40 border border-[#005049]/15 rounded-xl p-2.5">
                  <span className="text-[8px] text-on-surface-variant/50 uppercase font-black tracking-wider block">RED</span>
                  <span className="text-[11px] text-[#43e5d4] font-black font-mono">Mainnet-Beta</span>
                </div>
                <div className="bg-[#000f16]/40 border border-[#005049]/15 rounded-xl p-2.5">
                  <span className="text-[8px] text-on-surface-variant/50 uppercase font-black tracking-wider block">SOPORTE</span>
                  <span className="text-[11px] text-on-surface font-extrabold font-mono">SPL cNFT</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(wallet);
                  setWalletCopied(true);
                  setTimeout(() => setWalletCopied(false), 2000);
                }}
                className="w-full py-3 bg-[#43e5d4] hover:bg-[#c7ffd3] text-[#003732] text-xs font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all outline-none cursor-pointer shadow-[0_0_12px_rgba(67,229,212,0.15)]"
              >
                <Check className={`w-3.5 h-3.5 transition-transform ${walletCopied ? 'scale-110' : 'scale-100'}`} />
                <span>{walletCopied ? t('copiado_exito') : t('copiar_wallet_btn')}</span>
              </button>
            </div>
          </div>

          {/* ADMIN & RESET SYSTEM CARD */}
          <aside className="bg-surface-container rounded-2xl border border-error/15 p-6 space-y-6 shadow-lg text-left">
            <h3 className="font-headline text-sm font-bold text-error uppercase tracking-wider border-b border-error/10 pb-2 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" /> {t('pruebas_reseteo_title')}
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t('pruebas_reseteo_desc')}
            </p>

            <div className="space-y-4 pt-1">
              
              {/* LOG OUT TO HOME */}
              {onLogout && (
                <div className="space-y-2 pb-2 border-b border-[#005049]/15">
                  <button
                    id="btn-logout-settings"
                    type="button"
                    onClick={onLogout}
                    className="w-full py-3 bg-[#0d1e2a] border border-[#43e5d4]/40 hover:border-[#43e5d4] text-[#43e5d4] text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#112635] transition-all text-center cursor-pointer shadow-sm"
                  >
                    {t('cerrar_sesion_btn')}
                  </button>
                </div>
              )}
              
              {/* RESET TO MOCKUP STATE (4/6 CURRENT STATUS) */}
              <div className="space-y-2">
                <button
                  id="btn-reset-mockup"
                  onClick={() => {
                    setShowConfirmResetMock(true);
                    setShowConfirmResetZero(false);
                  }}
                  className="w-full py-2.5 bg-[#43e5d4]/10 border border-secondary/35 text-secondary text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#43e5d4]/15 transition-all text-center cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t('regresar_mockup_btn')}
                </button>
                {showConfirmResetMock && (
                  <div className="bg-background p-3 rounded-lg border border-secondary/20 text-[11px] space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                    <p className="text-on-surface-variant">{t('regresar_mockup_confirm')}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResetToMockupState();
                          setShowConfirmResetMock(false);
                        }}
                        className="bg-secondary text-on-secondary font-bold px-3 py-1 rounded text-[10px] cursor-pointer"
                      >
                        {t('si_restablecer_btn')}
                      </button>
                      <button
                        onClick={() => setShowConfirmResetMock(false)}
                        className="bg-surface-container-high border border-on-surface-variant/20 text-on-surface-variant px-3 py-1 rounded text-[10px] cursor-pointer"
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
                  onClick={() => {
                    setShowConfirmResetZero(true);
                    setShowConfirmResetMock(false);
                  }}
                  className="w-full py-2.5 bg-error-container/20 border border-error/30 text-error text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-error-container/30 transition-all text-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('reiniciar_cero_btn')}
                </button>
                {showConfirmResetZero && (
                  <div className="bg-background p-3 rounded-lg border border-error/25 text-[11px] space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                    <p className="text-on-surface-variant">{t('reiniciar_cero_confirm')}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResetToZeroState();
                          setShowConfirmResetZero(false);
                        }}
                        className="bg-error border border-error text-on-error font-bold px-3 py-1 rounded text-[10px] cursor-pointer"
                      >
                        {t('si_borrar_todo_btn')}
                      </button>
                      <button
                        onClick={() => setShowConfirmResetZero(false)}
                        className="bg-surface-container-high border border-on-surface-variant/20 text-on-surface-variant px-3 py-1 rounded text-[10px] cursor-pointer"
                      >
                        {t('cancelar_btn')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="p-4 bg-background/35 rounded-xl border border-secondary/10 flex items-center justify-center text-center mt-4">
              <span className="text-[10px] text-on-surface-variant font-mono">
                Passport Pro MVP &bull; Solana cNFT v1.0
              </span>
            </div>
          </aside>

        </div>

      </div>

    </div>
  );
}
