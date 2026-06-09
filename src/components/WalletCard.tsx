import React, { FC, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Copy, Check, RefreshCw, Layers, Activity, HelpCircle } from 'lucide-react';
import { subscribeSolanaGlobalSettings } from '../utils/firebase';
import { UserProfile } from '../types';

import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletCardProps {
  user?: UserProfile;
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export const WalletCard: FC<WalletCardProps> = ({ user, onUpdateUser }) => {
  const { connection } = useConnection();
  const { publicKey, disconnect, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Detect sandboxed iframe and mobile browser environments
  const [isIframe, setIsIframe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Use local persistence for user setup switches to keep consistency
  const [isActive, setIsActive] = useState<boolean>(() => {
    return localStorage.getItem('solana-active') !== 'false';
  });

  // Global settings synced from Firestore (Admin control)
  const [globalWalletEnabled, setGlobalWalletEnabled] = useState<boolean>(true);
  const [globalNetwork, setGlobalNetwork] = useState<'MAINET' | 'DEVNET'>('DEVNET');

  useEffect(() => {
    const unsubscribe = subscribeSolanaGlobalSettings((settings) => {
      setGlobalWalletEnabled(settings.walletEnabled);
      setGlobalNetwork(settings.network);
    });
    return () => unsubscribe();
  }, []);

  // Use user's profile linked wallet address as fallback if present, otherwise standard simulated
  const savedAddress = user?.linkedWallet || 'SolP1NTAxMaPAs3G14p87Qv8bFMyWkFqJn5UAs67Xm9';
  const shortenedSimulated = `${savedAddress.slice(0, 6)}...${savedAddress.slice(-4)}`;

  // Automatically sync with real adapter if connected
  useEffect(() => {
    if (connected) {
      setIsActive(true);
    }
  }, [connected]);

  // Synchronize connected wallet seamlessly into the user profile in Firestore/local state automatically
  useEffect(() => {
    if (connected && publicKey && onUpdateUser && user) {
      const currentAddress = publicKey.toBase58();
      if (user.linkedWallet !== currentAddress) {
        console.log("Auto-synchronizing connected wallet to user profile:", currentAddress);
        onUpdateUser({
          ...user,
          linkedWallet: currentAddress
        });
      }
    }
  }, [connected, publicKey, onUpdateUser, user]);

  // Fetch / simulate balance with automatic RPC fallback to guard against rate-limiting (429/403)
  const fetchBalance = async () => {
    if (connected && publicKey) {
      try {
        setIsLoadingBalance(true);
        
        // Build an array of RPC endpoints to attempt based on current network configuration
        const isMainnet = globalNetwork === 'MAINET';
        const endpoints = [
          connection?.rpcEndpoint, // Try established connection first
          isMainnet ? 'https://rpc.ankr.com/solana' : 'https://rpc.ankr.com/solana_devnet',
          isMainnet ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com'
        ].filter(Boolean) as string[];

        let fetchedBalance: number | null = null;
        let lastError: any = null;

        for (const endpointUrl of endpoints) {
          try {
            const { Connection } = await import('@solana/web3.js');
            const conn = endpointUrl === connection?.rpcEndpoint && connection 
              ? connection 
              : new Connection(endpointUrl, 'confirmed');

            const balanceLamports = await conn.getBalance(publicKey);
            fetchedBalance = balanceLamports / LAMPORTS_PER_SOL;
            break; // Success! Break loop
          } catch (err) {
            lastError = err;
            console.warn(`RPC endpoint ${endpointUrl} failed to fetch balance:`, err);
          }
        }

        if (fetchedBalance !== null) {
          setBalance(fetchedBalance);
        } else {
          console.error('All SOL balance RPC endpoints failed:', lastError);
          setBalance(0.0000);
        }
      } catch (error) {
        console.error('Error in fetchBalance routine:', error);
        setBalance(0.0000);
      } finally {
        setIsLoadingBalance(false);
      }
    } else {
      // Simulate nice loaded state
      setIsLoadingBalance(true);
      setTimeout(() => {
        setBalance(1.4852);
        setIsLoadingBalance(false);
      }, 800);
    }
  };

  useEffect(() => {
    if (isActive) {
      if (connected && publicKey) {
        fetchBalance();
      } else {
        setBalance(1.4852); // Initial simulated balance
      }
    } else {
      setBalance(null);
    }
  }, [isActive, connected, publicKey, connection, globalNetwork]);

  const handleToggleActive = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    localStorage.setItem('solana-active', String(nextState));
    if (!nextState && connected) {
      disconnect();
    }
  };

  const handleCopy = async () => {
    const addressToCopy = connected && publicKey ? publicKey.toBase58() : savedAddress;
    try {
      await navigator.clipboard.writeText(addressToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const activeAddress = connected && publicKey ? publicKey.toBase58() : savedAddress;
  const shortenedActive = connected && publicKey 
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` 
    : shortenedSimulated;

  if (!globalWalletEnabled) {
    return (
      <div id="solana-global-disabled-card" className="bg-[#000d14] rounded-2xl border border-red-500/20 p-6 space-y-4 shadow-lg text-left relative overflow-hidden animate-in fade-in duration-300">
        <div className="flex items-center gap-2.5 border-b border-red-500/15 pb-3">
          <div className="w-5 h-5 rounded-full border border-red-500/30 flex items-center justify-center shrink-0">
            <span className="text-red-500 text-xs">🚫</span>
          </div>
          <h3 className="font-headline text-xs font-black text-red-400 uppercase tracking-widest">
            Solana Wallet Desactivada
          </h3>
        </div>
        <p className="text-xs text-red-300/80 leading-relaxed font-sans">
          La función de la billetera Solana se encuentra temporalmente desactivada por el administrador del sistema para todos los usuarios.
        </p>
        <div className="text-[10px] text-red-500/50 font-mono mt-2 flex items-center justify-between border-t border-red-500/10 pt-2">
          <span>OPERACIÓN EN PAUSA</span>
          <span>ADMINISTRACIÓN CENTRAL</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tr from-[#001c2a] to-[#002f2d] rounded-2xl border border-secondary/35 p-6 space-y-5 shadow-lg text-left relative overflow-hidden group">
      {/* Background radial accent */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#1A56DB]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#1A56DB]/10 transition-colors duration-500"></div>

      {/* Header section redesigned correctly with the title and connected trigger */}
      <div className="flex flex-col gap-1.5 border-b border-[#005049]/25 pb-3">
        <div className="flex items-center justify-between gap-2.5">
          <h3 className="font-headline text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
            <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full border border-secondary/30"></div>
              <Activity className="w-3 h-3 text-secondary" />
            </div>
            Administración de Solana
          </h3>
          
          {/* Button (CONECTADO) switch active/inactive adapter function */}
          <button
            type="button"
            onClick={handleToggleActive}
            title={isActive ? "Cerrar sesión de la wallet" : "Activar billetera"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 text-[10px] font-mono font-black uppercase tracking-widest cursor-pointer select-none ${
              isActive 
                ? 'bg-[#1A56DB]/10 border-secondary text-secondary shadow-[0_0_12px_rgba(26, 86, 219,0.12)]' 
                : 'bg-[#001c27]/40 border-slate-700/60 text-slate-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-secondary animate-pulse' : 'bg-slate-500'}`}></span>
            {isActive ? 'CONECTADO' : 'DESCONECTADO'}
          </button>
        </div>
      </div>

      {/* RED configuration block with network switcher switch */}
      <div className="bg-[#000f16]/40 border border-[#005049]/15 rounded-xl p-3.5 space-y-2">
        <span className="text-[9px] font-black tracking-widest uppercase font-mono text-secondary opacity-90 block">
          RED (GESTIONADA POR ADMIN)
        </span>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-on-surface-variant/80">
            Acuñación de credenciales en network:
          </span>
          {/* Mainnet vs Devnet responsive switch slider */}
          <div 
            className="relative w-28 h-6.5 rounded-lg bg-[#00111a] border border-[#005049]/40 p-0.5 flex items-center justify-between select-none font-mono text-[8px] font-bold"
          >
            {/* Slide active highlight backdrop */}
            <div 
              className={`absolute top-0.5 bottom-0.5 w-[51px] rounded bg-secondary/15 border border-secondary/30 transition-all duration-300 ${
                globalNetwork === 'MAINET' ? 'left-0.5' : 'left-[56px]'
              }`}
            />
            <span className={`z-10 flex-1 text-center transition-colors duration-300 ${
              globalNetwork === 'MAINET' ? 'text-secondary font-black' : 'text-on-surface-variant/40'
            }`}>
              MAINET
            </span>
            <span className={`z-10 flex-1 text-center transition-colors duration-300 ${
              globalNetwork === 'DEVNET' ? 'text-secondary font-black' : 'text-on-surface-variant/40'
            }`}>
              DEVNET
            </span>
          </div>
        </div>
      </div>

      {/* Conditional Active Features body */}
      {isActive ? (
        <div className="space-y-3 pt-1 animate-in fade-in duration-300">
          {/* Public Address details */}
          <div className="bg-[#000f16]/60 border border-secondary/15 rounded-xl p-3 flex items-center justify-between gap-3 font-mono">
            <div className="min-w-0 flex-1">
              <span className="text-[8px] text-on-surface-variant/40 uppercase font-black tracking-wider block mb-0.5">
                {connected ? 'DIRECCIÓN DE CLIENTE' : 'DIRECCIÓN SIMULADA'}
              </span>
              <span className="text-xs text-[#c8e7fb] font-bold truncate block select-all" title={activeAddress}>
                {shortenedActive}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-secondary hover:text-white rounded-lg hover:bg-secondary/10 transition-colors shrink-0 outline-none cursor-pointer"
              title="Copiar llave pública"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Balance presentation */}
          <div className="bg-[#000f16]/35 border border-[#005049]/10 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[8px] text-on-surface-variant/40 uppercase font-black tracking-wider block mb-0.5">
                BALANCE DISPONIBLE
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black font-mono text-secondary">
                  {balance !== null ? balance.toFixed(4) : '--'}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant/70">SOL</span>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchBalance}
              disabled={isLoadingBalance}
              className="p-1.5 text-secondary hover:text-white rounded-lg hover:bg-secondary/10 transition-all shrink-0 outline-none disabled:opacity-50 cursor-pointer"
              title="Actualizar balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Standard block representation details */}
          <div className="bg-[#000f16]/25 border border-[#005049]/10 rounded-xl p-2.5 flex items-center justify-between text-[10px]">
            <span className="text-on-surface-variant/60 font-medium">Estándar compatible:</span>
            <span className="font-extrabold font-mono text-[#c8e7fb] flex items-center gap-1 bg-[#1A56DB]/5 px-2 py-0.5 rounded border border-[#1A56DB]/10">
              <Layers className="w-3 h-3 text-secondary" /> SPL cNFT
            </span>
          </div>

          {/* Iframe sandbox notice */}
          {isIframe && (
            <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded-xl p-2.5 text-[10px] leading-relaxed space-y-1.5 text-left my-2 animate-pulse">
              <span className="font-black uppercase tracking-wider text-amber-400 block">⚠️ Restricción de Visor</span>
              <p className="opacity-90">
                Las billeteras descentralizadas no permiten conexiones dentro de marcos integrados por tu seguridad. Para conectar tu billetera, abre la dApp en pestaña nueva.
              </p>
              <button
                type="button"
                onClick={() => window.open(window.location.origin + window.location.pathname + window.location.search, '_blank')}
                className="w-full bg-amber-500 text-black py-1 px-2 rounded-lg font-black text-[9px] uppercase tracking-wide hover:bg-amber-400 transition cursor-pointer text-center block"
              >
                Abrir en Pestaña Nueva
              </button>
            </div>
          )}

          {/* Mobile connection helpers (Deep links to open Phantom / Solflare in-app dApp browser with logged-in user context) */}
          {isMobile && !navigator.userAgent.includes('Phantom') && !navigator.userAgent.includes('Solflare') && (
            <div className="bg-[#000d14]/60 border border-cyan-500/25 rounded-xl p-3 space-y-2 text-left my-2">
              <span className="text-[9px] font-black tracking-widest uppercase font-mono text-cyan-400 block">
                📲 ACCESO DIRECTO EN CELULAR
              </span>
              <p className="text-[10px] text-cyan-300/80 leading-relaxed font-sans">
                Para evitar salirte de la dApp, ábrela e inicia sesión directamente en el navegador seguro de tu billetera móvil:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`phantom://v1/browse/${encodeURIComponent(window.location.origin + window.location.pathname + '?sync_uid=' + (user?.email ? encodeURIComponent(user.email) : ''))}`}
                  className="bg-[#2a0e5c] border border-[#5d1df3]/40 text-[#cbbfff] py-2 px-1 rounded-lg font-bold font-mono text-[9px] text-center uppercase tracking-wider block hover:bg-[#3e0d8a] active:scale-95 transition"
                >
                  Usar Phantom
                </a>
                <a
                  href={`solflare://ul/v1/browse/${encodeURIComponent(window.location.origin + window.location.pathname + '?sync_uid=' + (user?.email ? encodeURIComponent(user.email) : ''))}`}
                  className="bg-[#381a0c] border border-[#f05c10]/40 text-[#ffd5c4] py-2 px-1 rounded-lg font-bold font-mono text-[9px] text-center uppercase tracking-wider block hover:bg-[#48200d] active:scale-95 transition"
                >
                  Usar Solflare
                </a>
              </div>
            </div>
          )}

          {/* Connect real adapter buttons if active but not real connected */}
          {!connected && (
            <div className="pt-2 text-center select-none font-sans flex flex-col items-center justify-center">
              <span className="text-[10px] text-on-surface-variant/60 mb-2 font-medium">Link real connection (Optional):</span>
              <WalletMultiButton 
                className="!bg-secondary hover:!bg-[#c7ffd3] !text-[#003732] !font-sans !font-black !text-[10px] !uppercase !tracking-wider !rounded-xl !py-2.5 !px-5 !transition-all !duration-300 hover:!scale-[1.02] active:!scale-[0.98] !shadow-[0_0_12px_rgba(26, 86, 219,0.15)] !h-auto !min-h-0"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-[#001420]/30 border border-dashed border-slate-700/40 rounded-xl text-center space-y-2 animate-in fade-in duration-300">
          <HelpCircle className="w-5 h-5 mx-auto text-slate-500" />
          <p className="text-[11px] text-on-surface-variant/70 leading-relaxed max-w-xs mx-auto">
            La función de la billetera Solana se encuentra actualmente <strong className="text-slate-400">Desactivada</strong>. Actívala arriba para sincronizar insignias y reclamar tus cNFTs.
          </p>
        </div>
      )}
    </div>
  );
};
