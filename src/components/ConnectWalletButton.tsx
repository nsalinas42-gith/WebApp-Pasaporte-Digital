import React, { FC, useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, LogOut, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';

import '@solana/wallet-adapter-react-ui/styles.css';

export const ConnectWalletButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, disconnect, connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Truncate address helper
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Robust function to fetch Balance with RPC Fallbacks
  const getBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setErrorMsg(null);
    
    // Fallback RPC list if the current connection fails
    const fallbacks = [
      connection?.rpcEndpoint,
      'https://rpc.ankr.com/solana_devnet',
      'https://api.devnet.solana.com',
      'https://rpc.ankr.com/solana',
      'https://api.mainnet-beta.solana.com'
    ].filter(Boolean) as string[];

    let success = false;
    let finalBalance = 0;

    for (const rpc of fallbacks) {
      if (!rpc) continue;
      try {
        const { Connection } = await import('@solana/web3.js');
        const activeConn = rpc === connection?.rpcEndpoint ? connection : new Connection(rpc, 'confirmed');
        const lamports = await activeConn.getBalance(publicKey, 'confirmed');
        finalBalance = lamports / LAMPORTS_PER_SOL;
        success = true;
        break;
      } catch (err) {
        console.warn(`Fallback RPC ${rpc} failed to respond:`, err);
      }
    }

    if (success) {
      setBalance(finalBalance);
    } else {
      setErrorMsg('Error de conexión RPC');
      setBalance(0);
    }
    setLoading(false);
  }, [publicKey, connection]);

  // Reactive state fetcher
  useEffect(() => {
    if (connected && publicKey) {
      getBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, getBalance]);

  // Action handlers
  const handleConnect = () => {
    try {
      if (setVisible) {
        setVisible(true);
      }
    } catch (e) {
      console.error('Failed to open wallet selection modal:', e);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (disconnect) {
        await disconnect();
      }
      setBalance(null);
      setErrorMsg(null);
    } catch (e) {
      console.error('Error during disconnection:', e);
    }
  };

  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy public key:', e);
    }
  };

  // Rendering States
  if (connected && publicKey) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-[#001c2a]/95 border border-[#1A56DB]/40 rounded-xl p-3 shadow-lg select-none relative">
        {/* Wallet Address & Info */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-lg bg-[#1A56DB]/15 border border-[#1A56DB]/30 flex items-center justify-center text-white shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          
          <div className="text-left min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide">Solana Wallet</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-white truncate block">
                {truncateAddress(publicKey.toBase58())}
              </span>
              <button 
                type="button"
                onClick={handleCopy}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                title="Copiar dirección"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[#005049]/35 pt-2 sm:pt-0 sm:pl-3 min-w-[120px]">
          <div className="text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Balance</span>
            <span className="text-xs font-mono font-black text-white flex items-center gap-1 mt-0.5">
              {balance !== null ? balance.toFixed(4) : '--'}
              <span className="text-[10px] text-[#00e1cf] font-sans font-normal">SOL</span>
            </span>
          </div>
          <button 
            type="button"
            onClick={getBalance}
            disabled={loading}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1A56DB]/10 transition-colors disabled:opacity-40 cursor-pointer"
            title="Refrescar balance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Actions (Disconnect) */}
        <button
          type="button"
          onClick={handleDisconnect}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-red-950/20 hover:bg-red-950/45 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300 ml-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Desconectar</span>
        </button>

        {errorMsg && (
          <div className="absolute top-full left-0 mt-2 text-[10px] text-red-400 flex items-center gap-1 font-mono">
            <AlertCircle className="w-3 h-3" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="connect-wallet-btn-container select-none">
      <button
        type="button"
        onClick={handleConnect}
        disabled={connecting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#001c2a] hover:bg-[#1A56DB]/20 border border-[#1A56DB]/40 hover:border-[#1A56DB] text-white hover:text-[#1A56DB] font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_12px_rgba(26, 86, 219,0.15)] cursor-pointer"
      >
        <Wallet className="w-4 h-4 shrink-0 transition-transform duration-300" />
        <span>{connecting ? 'Conectando...' : 'Conectar Billetera'}</span>
      </button>
    </div>
  );
};
