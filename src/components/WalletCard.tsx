import React, { FC, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Copy, Check, RefreshCw, Layers, Activity, HelpCircle } from 'lucide-react';
import { subscribeSolanaGlobalSettings } from '../utils/firebase';

import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletCard: FC = () => {
  const { connection } = useConnection();
  const { publicKey, disconnect, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

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

  // Simulated fallback configurations when real Solflare is not in current context
  const simulatedAddress = 'SolP1NTAxMaPAs3G14p87Qv8bFMyWkFqJn5UAs67Xm9';
  const shortenedSimulated = `${simulatedAddress.slice(0, 6)}...${simulatedAddress.slice(-4)}`;

  // Automatically sync with real adapter if connected
  useEffect(() => {
    if (connected) {
      setIsActive(true);
    }
  }, [connected]);

  // Fetch / simulate balance
  const fetchBalance = async () => {
    if (connected && publicKey && connection) {
      try {
        setIsLoadingBalance(true);
        const balanceLamports = await connection.getBalance(publicKey);
        setBalance(balanceLamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
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
  }, [isActive, connected, publicKey, connection]);

  const handleToggleActive = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    localStorage.setItem('solana-active', String(nextState));
    if (!nextState && connected) {
      disconnect();
    }
  };

  const handleCopy = async () => {
    const addressToCopy = connected && publicKey ? publicKey.toBase58() : simulatedAddress;
    try {
      await navigator.clipboard.writeText(addressToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const activeAddress = connected && publicKey ? publicKey.toBase58() : simulatedAddress;
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
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#43e5d4]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#43e5d4]/10 transition-colors duration-500"></div>

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
            title={isActive ? "Desactivar billetera" : "Activar billetera"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 text-[10px] font-mono font-black uppercase tracking-widest cursor-pointer select-none ${
              isActive 
                ? 'bg-[#43e5d4]/10 border-secondary text-secondary shadow-[0_0_12px_rgba(67,229,212,0.12)]' 
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
            <span className="font-extrabold font-mono text-[#c8e7fb] flex items-center gap-1 bg-[#43e5d4]/5 px-2 py-0.5 rounded border border-[#43e5d4]/10">
              <Layers className="w-3 h-3 text-secondary" /> SPL cNFT
            </span>
          </div>

          {/* Connect real adapter buttons if active but not real connected */}
          {!connected && (
            <div className="pt-2 text-center select-none font-sans flex flex-col items-center justify-center">
              <span className="text-[10px] text-on-surface-variant/60 mb-2 font-medium">Link real connection (Optional):</span>
              <WalletMultiButton 
                className="!bg-secondary hover:!bg-[#c7ffd3] !text-[#003732] !font-sans !font-black !text-[10px] !uppercase !tracking-wider !rounded-xl !py-2.5 !px-5 !transition-all !duration-300 hover:!scale-[1.02] active:!scale-[0.98] !shadow-[0_0_12px_rgba(67,229,212,0.15)] !h-auto !min-h-0"
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
