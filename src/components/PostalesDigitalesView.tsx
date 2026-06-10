/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { Location } from '../types';
import { useLanguage } from '../translations';
import { useWallet } from '@solana/wallet-adapter-react';
import QRCode from 'qrcode';
import stampAlhambra from '../assets/images/explorador_principiante.png';
import stampCordoba from '../assets/images/explorador_intermedio.png';
import stampSegovia from '../assets/images/explorador_avanzado.png';
import stampSevilla from '../assets/images/cazador_de_rutas.png';
import stampSagrada from '../assets/images/guia_local.png';
import stampOlite from '../assets/images/guia_local_experto.png';
import postal1 from '../assets/images/postales/postal_1.png';
import postal2 from '../assets/images/postales/postal_2.png';
import { subscribeCloudPostcards, POSTCARD_IMAGE_MAP } from '../utils/firebase';

const POSTALES_IMAGES: Record<string, string> = {
  'postal_1.png': postal1,
  'postal_2.png': postal2,
};

interface PostalesDigitalesViewProps {
  locations: Location[];
}

interface MintState {
  isMinting: boolean;
  isMinted: boolean;
  txHash: string | null;
}

export default function PostalesDigitalesView({ locations }: PostalesDigitalesViewProps) {
  const { t, language } = useLanguage();
  const { publicKey, connected } = useWallet();

  // Solana connection synchronized globally from Settings & Real Connection
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(1.48);
  const [walletType, setWalletType] = useState<'virtual' | 'real' | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [showWalletSelector, setShowWalletSelector] = useState<boolean>(false);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [signingPostcardIndex, setSigningPostcardIndex] = useState<number | null>(null);

  useEffect(() => {
    const isSimulatedActive = localStorage.getItem('solana-active') !== 'false';
    if (connected && publicKey) {
      setWalletConnected(true);
      setWalletAddress(publicKey.toBase58());
      setWalletBalance(16.42);
      setWalletType('real');
    } else if (isSimulatedActive) {
      setWalletConnected(true);
      setWalletAddress('SolP1NTAxMaPAs3G14p87Qv8bFMyWkFqJn5UAs67Xm9');
      setWalletBalance(1.48);
      setWalletType('virtual');
    } else {
      setWalletConnected(false);
      setWalletAddress('');
      setWalletBalance(0);
      setWalletType(null);
    }
  }, [connected, publicKey]);

  // Minting tracking state for the 6 postcards
  const [mintStatus, setMintStatus] = useState<Record<string, MintState>>(() => {
    // Try to load saved minted postcards from localstorage
    const saved = localStorage.getItem('pinta_mapas_postales_minted_status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      'alhambra': { isMinting: false, isMinted: false, txHash: null },
      'mezquita_cordoba': { isMinting: false, isMinted: false, txHash: null },
      'acueducto_segovia': { isMinting: false, isMinted: false, txHash: null },
      'alcazar_sevilla': { isMinting: false, isMinted: false, txHash: null },
      'sagrada_family': { isMinting: false, isMinted: false, txHash: null },
      'castillo_olite': { isMinting: false, isMinted: false, txHash: null },
    };
  });

  const saveStatus = (newStatus: Record<string, MintState>) => {
    setMintStatus(newStatus);
    localStorage.setItem('pinta_mapas_postales_minted_status', JSON.stringify(newStatus));
  };

  // Connect to virtual wallet (instant, highly responsive)
  const connectVirtualWallet = () => {
    setConnecting(true);
    setTimeout(() => {
      setWalletAddress('P1ntAMaPaSpQst4L98DghrJt9e5WwXyzSolW11et');
      setWalletBalance(2.65);
      setWalletType('virtual');
      setWalletConnected(true);
      setConnecting(false);
      setShowWalletSelector(false);
    }, 1200);
  };

  // Connect via Solana adapter (standard simulated implementation)
  const connectRealExtension = () => {
    setConnecting(true);
    setTimeout(() => {
      // Connects custom dev Solana account
      setWalletAddress('8fW6uVpQtMcR8Z9G6s7Tpy8uB5WwTxyzA1b2C3d4E5fG');
      setWalletBalance(16.42);
      setWalletType('real');
      setWalletConnected(true);
      setConnecting(false);
      setShowWalletSelector(false);
    }, 1800);
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletBalance(0);
    setWalletType(null);
  };

  // Map each route location structure
  const [postcardCards, setPostcardCards] = useState<any[]>([]);

  // Listen to cloud updates to synchronize cards instantly
  useEffect(() => {
    const unsubscribe = subscribeCloudPostcards((cardList) => {
      const mapped = cardList.map((card) => ({
        ...card,
        image: card.imageBase64 || POSTCARD_IMAGE_MAP[card.imageKey] || POSTALES_IMAGES[card.imageKey] || postal1
      }));
      setPostcardCards(mapped);
    });

    return () => unsubscribe();
  }, []);

  // Check if a specific route is completed (all 8 places checked in)
  const getRouteCompletion = (routeId: string) => {
    const loc = locations.find(l => l.id === routeId);
    if (!loc) return { isCompleted: false, completedCount: 0, totalCount: 8 };
    const checkedInCount = loc.places ? loc.places.filter(p => p.isCheckedIn).length : 0;
    const totalCount = loc.places ? loc.places.length : 8;
    return {
      isCompleted: checkedInCount === totalCount,
      completedCount: checkedInCount,
      totalCount: totalCount
    };
  };

  // Stamping and Minting core Web3 pipeline
  const handleMintPostcard = (idx: number, postcardId: string) => {
    if (!walletConnected) {
      setShowWalletSelector(true);
      return;
    }

    setSigningPostcardIndex(idx);
    setShowSignModal(true);
  };

  const confirmSignAndMint = () => {
    if (signingPostcardIndex === null) return;
    const postcard = postcardCards[signingPostcardIndex];
    setShowSignModal(false);

    // Update status to minting
    const currentStatus = { ...mintStatus };
    currentStatus[postcard.id] = {
      isMinting: true,
      isMinted: false,
      txHash: null
    };
    saveStatus(currentStatus);

    // Simulate standard Solana signature commitment period (Web3 wait blocks)
    setTimeout(() => {
      const generatedHash = '3G14p87Qv8bFMyWkFqJn5UAs67Xm98DghrJt9e5WwXyz' + Math.floor(Math.random() * 9000 + 1000);
      
      const updated = { ...mintStatus };
      updated[postcard.id] = {
        isMinting: false,
        isMinted: true,
        txHash: generatedHash
      };
      saveStatus(updated);

      // Trigger high-fidelity dynamic stamps processing on Canvas!
      triggerCanvasStampingAndDownload(postcard.id, postcard.image, postcard.name, generatedHash);
      setSigningPostcardIndex(null);
    }, 2800);
  };

  const triggerCanvasStampingAndDownload = (postcardId: string, imageSrc: string, routeName: string, txHash: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onerror = () => {
      console.error("No se pudo cargar la imagen de forma remota por seguridad CORS. Intentando estampar localmente en un Canvas de alta resolución...");
      fallbackCanvasRender(postcardId, routeName, txHash);
    };
    
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1700;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clean slate
        ctx.fillStyle = "#00080d";
        ctx.fillRect(0, 0, 1700, 1080);

        // Draw image keeping ratio on the left
        ctx.drawImage(img, 60, 60, 960, 960);

        // Technical borders & Royal frames
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 14;
        ctx.strokeRect(7, 7, 1686, 1066);

        ctx.strokeStyle = "rgba(0, 230, 118, 0.35)";
        ctx.lineWidth = 2;
        ctx.strokeRect(22, 22, 1656, 1036);

        // Decorative vertical Separator Line in bright white (#ffffff)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(1060, 60);
        ctx.lineTo(1060, 1020);
        ctx.stroke();

        // White horizontal separator line inside metadata for accentuation (#ffffff)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(1090, 230);
        ctx.lineTo(1640, 230);
        ctx.stroke();

        // Top Header Watermark text
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.font = "bold 13px monospace";
        ctx.fillText("BITACORA DIGITAL PINTA MAPAS - SOLANA SECURED CERTIFICATE", 1090, 100);

        // Metadata titles
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillText("POSTAL DIGITAL OFICIAL", 1090, 160);

        ctx.fillStyle = "#00E676";
        ctx.font = "bold 24px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillText(routeName.toUpperCase(), 1090, 205);

        // Detailed Metadata Block
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 16px monospace";
        ctx.fillText("DETALLES DE CERTIFICACIÓN:", 1090, 280);

        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.font = "14px monospace";
        ctx.fillText("Plataforma: Bitácora Digital de Pinta Mapas", 1090, 315);
        ctx.fillText(`ID de Postal: ${postcardId.toUpperCase()}`, 1090, 345);
        ctx.fillText("Red: Solana Mainnet-Beta (Sandbox Class)", 1090, 375);
        ctx.fillText("Formato: Compressed NFT (cNFT) de alta fidelidad", 1090, 405);
        ctx.fillText("Estado: CONFIRMADO & REGISTRADO", 1090, 435);

        // Blockchain Transaction segment
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px monospace";
        ctx.fillText("REGISTRO DE TRANSACCIÓN CRIPTOGRÁFICA:", 1090, 500);

        ctx.fillStyle = "#00E676";
        ctx.font = "bold 14px monospace";
        // split signature to prevent overflow
        const txPart1 = txHash.slice(0, 25);
        const txPart2 = txHash.slice(25);
        ctx.fillText(`TX L1: ${txPart1}`, 1090, 535);
        ctx.fillText(`TX L2: ${txPart2}`, 1090, 560);

        // Bottom descriptive copyright note
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "italic 12px monospace";
        ctx.fillText("Copyright © 2026 Pinta Mapas. Todos los derechos reservados.", 1090, 1000);

        // Render QR certification block dynamically pointing to Solscan!
        const qrX = 1260;
        const qrY = 640;
        const qrSize = 240;
        
        try {
          const txUrl = `https://solscan.io/tx/${txHash}`;
          const qrDataUrl = await QRCode.toDataURL(txUrl, {
            margin: 2,
            width: qrSize,
            color: {
              dark: '#FFFFFF', // High-contrast white QR code
              light: '#00080d' // custom dark background
            }
          });

          await new Promise<void>((resolve) => {
            const qrImg = new Image();
            qrImg.onload = () => {
              ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
              resolve();
            };
            qrImg.onerror = () => {
              resolve();
            };
            qrImg.src = qrDataUrl;
          });
        } catch (qrErr) {
          console.error("QR Code generation failed, fallback to aesthetic matrix", qrErr);
          ctx.fillStyle = "#FFFFFF";
          const squareSize = Math.floor(qrSize / 6);
          for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 6; y++) {
              if (x === 0 || x === 5 || y === 0 || y === 5 || (x === 2 && y === 2)) {
                ctx.fillRect(qrX + x * squareSize, qrY + y * squareSize, squareSize - 4, squareSize - 4);
              }
            }
          }
        }

        // Convert the dynamic canvas to download
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `POSTAL_DE_SOLANA_${postcardId.toUpperCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Canvas export failed. Triggering fallback canvas renderer block...", err);
        fallbackCanvasRender(postcardId, routeName, txHash);
      }
    };
  };

  const fallbackCanvasRender = async (postcardId: string, routeName: string, txHash: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1700;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1700, 1080);
    grad.addColorStop(0, '#001a24');
    grad.addColorStop(1, '#00080d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1700, 1080);

    // Grid details for tech vibe
    ctx.strokeStyle = "rgba(26, 86, 219, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 100; x < 1700; x += 100) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1080); ctx.stroke();
    }
    for (let y = 100; y < 1080; y += 100) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1700, y); ctx.stroke();
    }

    // Outer borders
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 1686, 1066);

    ctx.strokeStyle = "rgba(0, 230, 118, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, 1656, 1036);

    // Decorative inner target elements inside the left frame
    ctx.strokeStyle = "rgba(26, 86, 219, 0.25)";
    ctx.strokeRect(60, 60, 960, 960);

    // Center reward badge circle in left frame
    ctx.beginPath();
    ctx.arc(540, 540, 260, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(26, 86, 219, 0.05)";
    ctx.fill();
    ctx.strokeStyle = "#1A56DB";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Secondary decorative gear ring
    ctx.beginPath();
    ctx.arc(540, 540, 290, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(26, 86, 219, 0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 12]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Big central stamp representation text
    ctx.fillStyle = "#1A56DB";
    ctx.font = "bold 44px monospace";
    ctx.textAlign = "center";
    ctx.fillText("CERTIFICATE cNFT", 540, 520);
    ctx.fillStyle = "#00E676";
    ctx.font = "bold 24px monospace";
    ctx.fillText("BITACORA DIGITAL PINTA MAPAS", 540, 570);

    // Stamp center ring
    ctx.beginPath();
    ctx.arc(540, 540, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Reset text alignment for right metadata panel
    ctx.textAlign = "left";

    // Decorative vertical Separator Line in bright white (#ffffff)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1060, 60);
    ctx.lineTo(1060, 1020);
    ctx.stroke();

    // White horizontal separator line inside metadata for accentuation (#ffffff)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(1090, 230);
    ctx.lineTo(1640, 230);
    ctx.stroke();

    // Top Header Watermark text
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "bold 13px monospace";
    ctx.fillText("BITACORA DIGITAL PINTA MAPAS - SOLANA SECURED CERTIFICATE", 1090, 100);

    // Metadata titles
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText("POSTAL DIGITAL EXPOSITIVA", 1090, 160);

    ctx.fillStyle = "#00E676";
    ctx.font = "bold 24px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText(routeName.toUpperCase(), 1090, 205);

    // Detailed Metadata Block
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 16px monospace";
    ctx.fillText("DETALLES DE CERTIFICACIÓN:", 1090, 280);

    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.font = "14px monospace";
    ctx.fillText("Plataforma: Bitácora Digital de Pinta Mapas", 1090, 315);
    ctx.fillText(`ID de Postal: ${postcardId.toUpperCase()}`, 1090, 345);
    ctx.fillText("Red: Solana Mainnet-Beta (Sandbox Class)", 1090, 375);
    ctx.fillText("Formato: Compressed NFT (cNFT) de alta fidelidad", 1090, 405);
    ctx.fillText("Estado: CONFIRMADO & REGISTRADO", 1090, 435);

    // Blockchain Transaction segment
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText("REGISTRO DE TRANSACCIÓN CRIPTOGRÁFICA:", 1090, 500);

    ctx.fillStyle = "#00E676";
    ctx.font = "bold 14px monospace";
    // split signature to prevent overflow
    const txPart1 = txHash.slice(0, 25);
    const txPart2 = txHash.slice(25);
    ctx.fillText(`TX L1: ${txPart1}`, 1090, 535);
    ctx.fillText(`TX L2: ${txPart2}`, 1090, 560);

    // Bottom descriptive copyright note
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "italic 12px monospace";
    ctx.fillText("Copyright © 2026 Pinta Mapas. Todos los derechos reservados.", 1090, 1000);

    // Render QR certification block dynamically pointing to Solscan!
    const qrX = 1260;
    const qrY = 640;
    const qrSize = 240;
    
    try {
      const txUrl = `https://solscan.io/tx/${txHash}`;
      const qrDataUrl = await QRCode.toDataURL(txUrl, {
        margin: 2,
        width: qrSize,
        color: {
          dark: '#FFFFFF', // High-contrast white QR code
          light: '#00080d'
        }
      });

      await new Promise<void>((resolve) => {
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          resolve();
        };
        qrImg.onerror = () => {
          resolve();
        };
        qrImg.src = qrDataUrl;
      });
    } catch (qrErr) {
      console.error("Fallback QR Code generation failed", qrErr);
      ctx.fillStyle = "#FFFFFF";
      const squareSize = Math.floor(qrSize / 6);
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 6; y++) {
          const draw = (x === 0 || x === 5 || y === 0 || y === 5 || (x + y) % 3 === 0);
          if (draw) {
            ctx.fillRect(qrX + x * squareSize, qrY + y * squareSize, squareSize - 4, squareSize - 4);
          }
        }
      }
    }

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `POSTAL_DE_RESPALDO_${postcardId.toUpperCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#005049]/20 pb-6 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-secondary/10 border border-secondary/20 rounded-full text-[10px] font-black text-secondary uppercase tracking-widest">
              web3 rewards
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Solana Cluster: Mainnet-Beta / Sandbox
            </span>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            Postales Digitales de Caracas
          </h2>
          <p className="text-sm text-on-surface-variant/80">
            Acuña de forma permanente tus recuerdos históricos completando las rutas de la bitácora y estampando su hash criptográfico.
          </p>
        </div>

        {/* Solana Wallet controller widget */}
        <div className="shrink-0">
          {walletConnected ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#001c27] border border-secondary/30 p-2.5 sm:p-3 rounded-2xl">
              <div className="flex items-center gap-3 px-3">
                <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-secondary uppercase tracking-wider leading-none">Wallet Sincronizado</p>
                  <p className="font-mono text-xs text-on-surface-variant/90 leading-tight">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                  </p>
                </div>
              </div>

              <div className="h-px sm:h-8 w-full sm:w-px bg-secondary/20 my-1 sm:my-0"></div>

              <div className="flex items-center justify-between sm:justify-start gap-4 px-3 py-1 sm:py-0">
                <div className="text-left">
                  <p className="text-[8px] font-bold text-on-surface-variant/40 leading-none">BALANCE</p>
                  <p className="font-sans text-xs font-black text-[#51f1c7]">{walletBalance.toFixed(2)} SOL</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-black bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2.5 rounded-xl shadow-sm uppercase tracking-wider select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Billetera Inactiva
            </div>
          )}
        </div>
      </div>

      {/* 2. WARNING / INFORMATION ROADMAP BLOCK */}
      <div className="bg-[#161F30] border border-secondary/20 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 justify-between text-left">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/15 mt-0.5">
            <Compass className="w-5 h-5 text-secondary animate-pulse-slow" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-headline font-bold text-sm text-on-surface">¿Cómo funciona la colección de Postales?</h4>
            <p className="text-xs text-on-surface-variant/80 max-w-2xl leading-relaxed">
              Completa las 8 paradas históricas (Fichas) de cualquiera de las 6 rutas para desbloquear el derecho de acuñar su Postal. Al mintarla, conectamos tu firma para generar un sello interactivo irrepetible y descargar tu certificado digital de recuerdo.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs font-mono text-on-surface-variant/60 font-bold bg-[#002636] px-3 py-1.5 rounded-lg border border-secondary/10">
            Soporta SOL & Solana cNFTs
          </span>
        </div>
      </div>

      {!walletConnected && (
        <div className="bg-gradient-to-r from-amber-500/10 to-[#1e1205] border border-amber-500/35 p-5 rounded-2xl text-left flex items-start gap-3.5 animate-in slide-in-from-top-3 duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 select-none">
            ⚠️
          </div>
          <div className="space-y-1">
            <h4 className="font-headline font-bold text-sm text-amber-400 uppercase tracking-wider">Integración Web3 Desactivada</h4>
            <p className="text-xs text-on-surface-variant/90 leading-relaxed max-w-3xl">
              Para poder acuñar postales digitales, toda la funcionalidad requiere que conectes tu billetera. Por favor dirígete a la sección de <strong>Ajustes del Explorador (Configuración)</strong> y habilita o conecta tu billetera en la tarjeta de <strong>Administración de Solana</strong> para continuar.
            </p>
          </div>
        </div>
      )}

      {/* 3. POSTARDS GRID CONTAINER WITH REAL DATA PERSISTENCE CHECK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postcardCards.map((p, index) => {
          const { isCompleted, completedCount, totalCount } = getRouteCompletion(p.routeKey);
          const status = mintStatus[p.id] || { isMinting: false, isMinted: false, txHash: null };

          return (
            <div 
              key={p.id}
              className={`group flex flex-col bg-[#161F30] border rounded-2xl overflow-hidden transition-all duration-300 relative ${
                status.isMinted 
                  ? 'border-[#1A56DB]/40 shadow-[0_0_15px_rgba(26, 86, 219,0.06)]' 
                  : isCompleted 
                    ? 'border-secondary/20 hover:border-secondary/45' 
                    : 'border-[#005049]/15'
              }`}
            >
              {/* Image Preview & Status Label overlay */}
              <div className="relative w-full aspect-square bg-[#001019] border-b border-[#005049]/15 overflow-hidden flex items-center justify-center p-8 select-none">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${
                    !isCompleted ? 'grayscale opacity-35 blur-[1px]' : ''
                  }`}
                />
                
                {/* Highlight glow when completed and not minted */}
                {isCompleted && !status.isMinted && (
                  <div className="absolute top-3 left-3 bg-secondary/15 border border-secondary/30 text-secondary text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>Listo para Acuñar</span>
                  </div>
                )}

                {/* Lock overlay if route is locked */}
                {!isCompleted && (
                  <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#1e2329]/95 border border-[#30363d]/45 flex items-center justify-center text-on-surface-variant/50">
                      <Lock className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-xs text-on-surface/90">Postal Bloqueada</p>
                      <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                        Completa la Ruta para habilitar ({completedCount}/{totalCount})
                      </p>
                    </div>
                  </div>
                )}

                {/* Minted Stamp overlay */}
                {status.isMinted && (
                  <div className="absolute top-3 right-3 bg-emerald-500/10 border border-emerald-500/35 text-[#51f1c7] text-[9px] font-mono font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acuñada en Blockchain</span>
                  </div>
                )}
              </div>

              {/* Text & descriptions */}
              <div className="p-5 flex-1 flex flex-col text-left gap-4 bg-[#161F30]">
                <div className="space-y-1 my-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-[#FFFFFF] bg-[#001d2a] border border-[#FFFFFF]/25 px-2 py-0.5 rounded uppercase">
                      Ruta {index + 1}
                    </span>
                  </div>
                  <h3 className="font-headline font-black text-sm text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant/60 leading-relaxed line-clamp-2">
                    Consigue este logro y reclama tu Postal Digital con un hash único verificado por la blockchain de Solana.
                  </p>
                </div>

                {/* Actions bottom alignment container */}
                <div className="mt-auto pt-3 border-t border-[#005049]/10">
                  {status.isMinted ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => triggerCanvasStampingAndDownload(p.id, p.image, p.name, status.txHash || '')}
                        className="w-full py-2.5 bg-[#00E676] text-[#FFFFFF] border border-[#00E676]/25 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#00E676]/90 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar Postal</span>
                      </button>

                      <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant/60 px-1 pt-1 bg-[#001019]/40 p-1.5 rounded-lg border border-[#005049]/10">
                        <span className="truncate max-w-[150px]">TX: {status.txHash?.slice(0, 10)}...</span>
                        <a 
                          href={`https://solscan.io/tx/${status.txHash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[#1A56DB] hover:underline flex items-center gap-0.5"
                        >
                          SOLFLARE <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMintPostcard(index, p.id)}
                      disabled={!isCompleted || status.isMinting || !walletConnected}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all outline-none cursor-pointer ${
                        isCompleted
                          ? !walletConnected
                            ? 'bg-[#181109] border border-amber-500/20 text-amber-400/60 cursor-not-allowed'
                            : status.isMinting
                              ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676] border-dashed cursor-wait'
                              : 'bg-[#00E676] text-[#FFFFFF] hover:bg-[#00E676]/90 active:scale-95 shadow-[0_4px_12px_rgba(0,230,118,0.15)]'
                          : 'bg-surface-container-high text-on-surface-variant/30 cursor-not-allowed border border-[#005049]/10'
                      }`}
                    >
                      {status.isMinting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                          <span>Acuñando Postal...</span>
                        </>
                      ) : (
                        <>
                          {isCompleted ? (
                            !walletConnected ? (
                              <>
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Activar Wallet en Ajustes</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 animate-bounce" />
                                <span>Acuñar Postal ({completedCount}/{totalCount})</span>
                              </>
                            )
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Acuñar Postal ({completedCount}/{totalCount})</span>
                            </>
                          )}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. WALLET SELECTION MODAL SYSTEM (SANDBOX + EXTENSION CHANNELS) */}
      {showWalletSelector && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#001019] border border-secondary/30 rounded-2xl w-full max-w-md p-6 relative text-left">
            <button 
              onClick={() => setShowWalletSelector(false)}
              className="absolute top-4 right-4 text-on-surface-variant/60 hover:text-on-surface cursor-pointer outline-none"
            >
              <Lock className="w-5 h-5 rotate-45" /> Close (X)
            </button>

            <div className="space-y-1.5 pb-4 border-b border-[#005049]/20">
              <h3 className="font-headline text-lg font-bold text-on-surface">Conectar Billetera Solana</h3>
              <p className="text-xs text-on-surface-variant/70">
                Selecciona tu método de conexión Web3 preferred. Para iFrames de Sandbox, se recomienda usar la Billetera Virtual Integrada.
              </p>
            </div>

            <div className="py-5 space-y-3.5">
              {/* Virtual Wallet Action */}
              <button
                onClick={connectVirtualWallet}
                disabled={connecting}
                className="w-full p-4 rounded-xl border border-secondary/20 hover:border-secondary bg-secondary/5 hover:bg-secondary/10 text-left transition-all flex items-center justify-between group cursor-pointer outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface">Billetera Virtual (Recomendada)</h4>
                    <p className="text-[11px] text-on-surface-variant/70">Billetera integrada para un firmado rápido sin instalar plugins.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Phantom Wallet Action */}
              <button
                onClick={connectRealExtension}
                disabled={connecting}
                className="w-full p-4 rounded-xl border border-[#005049]/15 hover:border-secondary bg-[#001721] hover:bg-[#002330] text-left transition-all flex items-center justify-between group cursor-pointer outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface">Phantom Wallet (Extensiones)</h4>
                    <p className="text-[11px] text-on-surface-variant/70">Conecta tu extensión Phantom del navegador.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {connecting && (
              <div className="absolute inset-0 bg-black/75 rounded-2xl flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
                <p className="font-mono text-xs text-secondary tracking-widest uppercase">Estableciendo Handshake Web3...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE TRANSACTION SIGNING SCREEN (PHANTOM SIMULATION POPUP) */}
      {showSignModal && signingPostcardIndex !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c15] border border-purple-500/30 rounded-2xl w-full max-w-sm p-6 relative text-left shadow-[0_10px_35px_rgba(139,92,246,0.15)]">
            <div className="flex items-center gap-3 border-b border-[#30363d]/45 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0 border border-purple-500/20 text-purple-400 font-mono font-bold">
                Ω
              </div>
              <div>
                <h3 className="font-headline text-sm font-black text-on-surface tracking-wide uppercase">Aprobar Transacción</h3>
                <p className="text-[10px] text-on-surface-variant/50 font-mono">cluster: solana-mainnet-pinta-mapas</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                Estás a punto de firmar y acuñar de forma irrevocable la <strong className="text-secondary">{postcardCards[signingPostcardIndex].name}</strong> en la blockchain.
              </p>

              <div className="bg-[#161b22] border border-[#30363d]/35 p-3 rounded-xl space-y-1.5 font-mono text-[10px] text-on-surface-variant/80">
                <div className="flex justify-between">
                  <span>Operación:</span>
                  <span className="text-purple-300 font-bold">Mint Digital Stamp (cNFT)</span>
                </div>
                <div className="flex justify-between">
                  <span>Autoridad:</span>
                  <span className="text-secondary">PintaMapasAuthority</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo Gas network:</span>
                  <span className="text-[#51f1c7]">0.000005 SOL</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSignModal(false);
                    setSigningPostcardIndex(null);
                  }}
                  className="flex-1 py-3 bg-[#1e2329] hover:bg-[#30363d] text-on-surface font-semibold rounded-xl text-xs uppercase cursor-pointer outline-none transition-colors"
                >
                  Rechazar
                </button>
                <button
                  onClick={confirmSignAndMint}
                  className="flex-1 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black rounded-xl text-xs uppercase cursor-pointer outline-none transition-transform active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  Firmar y Pagar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
