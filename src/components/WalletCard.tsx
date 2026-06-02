import React, { FC, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, Copy, Check, LogOut, RefreshCw, Layers } from 'lucide-react';

export const WalletCard: FC = () => {
  const { connection } = useConnection();
  const { publicKey, disconnect, connected, wallet } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch balance
  const fetchBalance = async () => {
    if (!publicKey || !connection) return;
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
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);

  if (!connected || !publicKey) {
    return null;
  }

  // Get wallet adapter name
  const walletName = wallet?.adapter?.name || 'Solflare';

  // Shorten public key
  const pubKeyString = publicKey.toBase58();
  const shortenedAddress = `${pubKeyString.slice(0, 6)}...${pubKeyString.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pubKeyString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-gradient-to-tr from-[#001c2a] to-[#002f2d] rounded-2xl border border-secondary/35 p-6 space-y-5 shadow-lg text-left relative overflow-hidden group">
      {/* Background radial accent */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#43e5d4]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#43e5d4]/10 transition-colors duration-500"></div>

      {/* Header with Connection Badge */}
      <div className="flex items-center gap-2 border-b border-secondary/15 pb-3 justify-between">
        <h3 className="font-headline text-sm font-extrabold text-secondary uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#43e5d4]" />
          Cartera Vinculada
        </h3>
        <span className="text-[9px] font-black uppercase text-[#43e5d4] bg-[#43e5d4]/10 px-2.5 py-1 rounded-full border border-[#43e5d4]/20 flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          Conectado - {walletName}
        </span>
      </div>

      <div className="space-y-4">
        {/* Address and Copy block */}
        <div className="bg-[#000f16]/80 border border-secondary/15 rounded-xl p-3.5 flex items-center justify-between gap-4 font-mono">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-on-surface-variant/50 uppercase font-bold tracking-widest leading-none block mb-1">
              DIRECCIÓN PÚBLICA
            </span>
            <span className="text-xs text-[#c8e7fb] font-bold select-all truncate block" title={pubKeyString}>
              {shortenedAddress}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 text-secondary hover:text-white rounded-lg hover:bg-secondary/10 transition-colors shrink-0 outline-none"
            title="Copiar dirección completa"
          >
            {isCopied ? <Check className="w-4 h-4 text-tertiary" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Balance Display */}
        <div className="bg-[#000f16]/40 border border-[#005049]/15 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-on-surface-variant/50 uppercase font-black tracking-wider block mb-1">
              BALANCE SOL
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-secondary">
                {balance !== null ? balance.toFixed(4) : '--'}
              </span>
              <span className="text-xs font-bold text-on-surface-variant/80">SOL</span>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchBalance}
            disabled={isLoadingBalance}
            className="p-2 text-secondary hover:text-white rounded-lg hover:bg-secondary/10 transition-all shrink-0 outline-none disabled:opacity-50"
            title="Actualizar balance"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Network & Standard SPL labels */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-[#000f16]/40 border border-[#005049]/15 rounded-xl p-2.5">
            <span className="text-[8px] text-on-surface-variant/50 uppercase font-black tracking-wider block">RED</span>
            <span className="text-[11px] text-[#43e5d4] font-black font-mono">Solana Devnet</span>
          </div>
          <div className="bg-[#000f16]/40 border border-[#005049]/15 rounded-xl p-2.5">
            <span className="text-[8px] text-on-surface-variant/50 uppercase font-black tracking-wider block">Estándar</span>
            <span className="text-[11px] text-on-surface font-extrabold font-mono flex items-center justify-center gap-1">
              <Layers className="w-3 h-3 text-secondary" /> SPL cNFT
            </span>
          </div>
        </div>

        {/* Disconnect Button */}
        <button
          type="button"
          onClick={() => disconnect()}
          className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all outline-none cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Desconectar billetera</span>
        </button>
      </div>
    </div>
  );
};
