/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { 
  Settings, 
  User, 
  Mail, 
  Wallet, 
  RefreshCw, 
  Check, 
  Trash2, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';

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
  // Local form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState(user.title);
  const [wallet, setWallet] = useState(user.linkedWallet);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [showConfirmResetMock, setShowConfirmResetMock] = useState(false);
  const [showConfirmResetZero, setShowConfirmResetZero] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      title,
      linkedWallet: wallet
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
          Configuración del Explorador
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed font-sans">
          Administra las credenciales de tu perfil físico-digital. Los cambios realizados se guardan localmente en la caché de tu dispositivo y se sincronizan al instante en todo el tablero.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Panel: Edit Profile (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-surface-container rounded-2xl border border-[#005049]/20 p-6 md:p-8 space-y-6 shadow-lg text-left">
          <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider border-b border-[#005049]/15 pb-2">
            Editar Cuenta e Información Personal
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Explorer Nickname */}
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-secondary" /> Nombre de Explorador
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/25"
                placeholder='Ej. Felix "The Voyager"'
              />
            </div>

            {/* Explorer Title */}
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-secondary" /> Título Honorífico
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/25"
                placeholder="Ej. Explorador Supremo"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-secondary" /> Correo vinculado (Privy/Google)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-sm text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/25"
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* Linked Wallet Address */}
            <div className="space-y-2">
              <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wide flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-secondary" /> Billetera de Destino (Solana Hash)
              </label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
                className="w-full bg-background/60 border border-[#005049]/25 rounded-xl py-3 px-4 text-xs font-mono text-secondary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/25"
                placeholder="Solana public address..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#005049]/15 flex items-center justify-between gap-4">
            {saveSuccess ? (
              <span className="text-xs text-tertiary font-bold flex items-center gap-1 animate-bounce">
                <ShieldCheck className="w-4 h-4 fill-surface-container" /> Sincronización Exitosa
              </span>
            ) : (
              <span className="text-xs text-on-surface-variant/70 italic">
                La wallet invisible se asocia a tu correo de forma encriptada bajo Solana.
              </span>
            )}
            
            <button
              id="btn-save-settings"
              type="submit"
              className="py-3 px-6 bg-secondary text-on-secondary font-bold rounded-xl text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all outline-none"
            >
              Guardar Cambios
            </button>
          </div>
        </form>

        {/* Right Panel: Wallet Card & Admin Actions (5 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECURE BLOCKCHAIN WALLET CARD */}
          <div className="bg-gradient-to-tr from-[#001c2a] to-[#002f2d] rounded-2xl border border-secondary/35 p-6 space-y-5 shadow-lg text-left relative overflow-hidden group">
            {/* Ambient holographic background circles */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#43e5d4]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#43e5d4]/10 transition-colors duration-500"></div>

            <div className="flex items-center gap-2 border-b border-secondary/15 pb-3 justify-between">
              <h3 className="font-headline text-sm font-extrabold text-secondary uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#43e5d4]" />
                Mi Cartera Solana
              </h3>
              <span className="text-[9px] font-black uppercase text-[#43e5d4] bg-[#43e5d4]/10 px-2 py-0.5 rounded-full border border-[#43e5d4]/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-[#000f16]/80 border border-secondary/15 rounded-xl p-3.5 space-y-1.5 font-mono relative">
                <p className="text-[9px] text-on-surface-variant/50 uppercase font-bold tracking-widest leading-none">
                  Dirección de Destino cNFT
                </p>
                <p className="text-xs text-[#c8e7fb] truncate font-bold select-all" title={wallet}>
                  {wallet || 'No vinculada'}
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
                <span>{walletCopied ? '¡Copiado con Éxito!' : 'Copiar Dirección Wallet'}</span>
              </button>
            </div>
          </div>

          {/* ADMIN & RESET SYSTEM CARD */}
          <aside className="bg-surface-container rounded-2xl border border-error/15 p-6 space-y-6 shadow-lg text-left">
            <h3 className="font-headline text-sm font-bold text-error uppercase tracking-wider border-b border-error/10 pb-2 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" /> Zona de Pruebas y Reseteo
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Utiliza estas opciones para restablecer los estados de check-in del mapa de datos virtuales para testing. Esto permite simular los recorridos múltiples veces.
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
                    🚪 Cerrar Sesión e Ir a Inicio
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
                  className="w-full py-2.5 bg-[#43e5d4]/10 border border-secondary/35 text-secondary text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#43e5d4]/15 transition-all text-center"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regresar a Modo Mockup (4 / 6 Completado)
                </button>
                {showConfirmResetMock && (
                  <div className="bg-background p-3 rounded-lg border border-secondary/20 text-[11px] space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                    <p className="text-on-surface-variant">¿Deseas restablecer al estado original de la foto (4 sellos desbloqueados y 2 por canjear)?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResetToMockupState();
                          setShowConfirmResetMock(false);
                        }}
                        className="bg-secondary text-on-secondary font-bold px-3 py-1 rounded text-[10px]"
                      >
                        Sí, Restablecer
                      </button>
                      <button
                        onClick={() => setShowConfirmResetMock(false)}
                        className="bg-surface-container-high border border-on-surface-variant/20 text-on-surface-variant px-3 py-1 rounded text-[10px]"
                      >
                        Cancelar
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
                  className="w-full py-2.5 bg-error-container/20 border border-error/30 text-error text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-error-container/30 transition-all text-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reiniciar desde Cero (0 / 6 Completados)
                </button>
                {showConfirmResetZero && (
                  <div className="bg-background p-3 rounded-lg border border-error/25 text-[11px] space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                    <p className="text-on-surface-variant">¿Confirmas borrar todos tus check-ins de GPS y comenzar tu viaje de 0/6 sellos?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onResetToZeroState();
                          setShowConfirmResetZero(false);
                        }}
                        className="bg-error border border-error text-on-error font-bold px-3 py-1 rounded text-[10px]"
                      >
                        Sí, Borrar Todo
                      </button>
                      <button
                        onClick={() => setShowConfirmResetZero(false)}
                        className="bg-surface-container-high border border-on-surface-variant/20 text-on-surface-variant px-3 py-1 rounded text-[10px]"
                      >
                        Cancelar
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
