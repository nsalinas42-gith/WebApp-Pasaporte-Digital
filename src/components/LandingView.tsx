/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  ArrowUpRight
} from 'lucide-react';

interface LandingViewProps {
  onEnter: () => void;
}

export default function LandingView({ onEnter }: LandingViewProps) {
  // Smooth scroll helper
  const scrollToHowItWorks = () => {
    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#000f16] text-on-background min-h-screen font-sans overflow-x-hidden selection:bg-[#43e5d4] selection:text-[#003732] flex flex-col justify-between">
      
      {/* 1. TOP NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-16 h-20 bg-[#000f16]/80 backdrop-blur-md border-b border-[#005049]/20">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="w-8 h-8 rounded-lg bg-[#43e5d4]/10 flex items-center justify-center border border-[#43e5d4]/40 shadow-[0_0_15px_rgba(67,229,212,0.15)]">
            <span className="text-secondary text-base">🧭</span>
          </div>
          <span className="font-headline text-lg font-extrabold text-[#43e5d4] uppercase tracking-wider">
            Passport Pro
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Ingresar con Gmail Action Button */}
          <button 
            onClick={onEnter}
            className="px-5 py-2.5 rounded-xl bg-[#43e5d4] hover:bg-[#c7ffd3] text-[#003732] flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs font-black uppercase tracking-wider outline-none cursor-pointer shadow-[0_0_15px_rgba(67,229,212,0.15)]"
          >
            <span className="inline-flex w-4 h-4 bg-[#003732] rounded-md items-center justify-center text-[10px] text-secondary font-black">
              G
            </span>
            <span>Ingresar con Gmail</span>
          </button>
        </div>
      </header>

      {/* 2. HERO IMMERSIVE SECTION */}
      <section className="relative w-full min-h-[95vh] flex items-center justify-center pt-20 px-4 sm:px-8 border-b border-[#005049]/20 overflow-hidden">
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,80,73,0.15)_0%,transparent_70%)] pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[#000f16] opacity-35 mix-blend-multiply z-0 pointer-events-none"></div>

        {/* Immersive Cyber Colosseum Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center select-none pointer-events-none opacity-20 md:opacity-40 z-0 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=85')" }}
        />
        
        {/* Holographic tech circle and matrices over Colosseum */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#43e5d4]/10 pointer-events-none z-0 flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
          <div className="w-[500px] h-[500px] rounded-full border border-dashed border-[#43e5d4]/5"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-[#43e5d4]/15"></div>
        </div>

        {/* Shadow overlays mapping */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#000f16] to-transparent z-10 pointer-events-none"></div>

        {/* Main core callout */}
        <div className="relative z-20 text-center max-w-3xl mx-auto space-y-6 px-4 py-8">
          
          <div className="space-y-4">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black text-on-surface tracking-tight leading-none leading-[1.05]">
              Descubre el Mundo,<br />
              <span className="text-secondary bg-clip-text bg-gradient-to-r from-[#43e5d4] to-[#c7ffd3] glow-text shadow-glow">
                Colecciona Historia
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-on-surface-variant/85 max-w-xl mx-auto leading-relaxed">
              Transforma tus viajes en una aventura digital. Visita monumentos, completa tu mapa y desbloquea activos digitales únicos.
            </p>
          </div>

          {/* Holographic label tag under header */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 hidden md:block text-[9px] font-mono tracking-widest text-[#43e5d4]/40 font-bold uppercase select-none">
            Digital Passport • SOLANA SECURED
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnter}
              className="w-full sm:w-auto px-8 py-4 bg-[#43e5d4] hover:bg-[#c7ffd3] text-[#003732] font-extrabold rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(67,229,212,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 outline-none cursor-pointer"
            >
              {/* Fake Google Sign-In structure */}
              <span className="inline-flex w-4 h-4 bg-[#003732] rounded-md items-center justify-center text-[10px] text-secondary font-black">
                G
              </span>
              <span>Ingresar con Gmail</span>
            </button>

            <button
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 border border-[#43e5d4]/40 text-[#43e5d4] font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all outline-none cursor-pointer"
            >
              Saber más
            </button>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="como-funciona" className="py-24 px-6 md:px-16 space-y-16 max-w-6xl mx-auto text-left relative z-10 scroll-mt-20">
        
        {/* Underlined Section Header */}
        <div className="text-center space-y-3">
          <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface uppercase tracking-wider relative inline-block">
            ¿Cómo funciona?
          </h2>
          <div className="w-16 h-1 bg-[#43e5d4] mx-auto rounded-full"></div>
        </div>

        {/* Bento Grid layout matching the reference mockup */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* CARD 1: Adquiere tu Mapa Físico (col-span-12 md:col-span-7) */}
          <div className="md:col-span-7 bg-[#001721] border border-[#005049]/25 p-8 rounded-3xl flex flex-col md:flex-row justify-between gap-6 overflow-hidden relative group hover:border-[#43e5d4]/40 transition-colors">
            <div className="space-y-4 max-w-xs text-left">
              <div className="w-11 h-11 rounded-xl bg-[#43e5d4]/10 flex items-center justify-center text-[#43e5d4] border border-[#43e5d4]/20">
                <Map className="w-5 h-5 text-[#43e5d4]" />
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">
                Adquiere tu Mapa Físico
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                Empieza tu viaje con nuestro mapa premium de alta calidad. Contiene los marcadores secretos y códigos QR necesarios para activar tu pasaporte digital Pro.
              </p>
            </div>

            {/* Right render placeholder image inside card */}
            <div className="relative w-full md:w-48 h-36 md:h-full rounded-2xl overflow-hidden self-center border border-[#1a3848]/50 shadow-sm shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" 
                alt="Physical World Map Vintage Render"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001721] via-transparent to-transparent opacity-40"></div>
            </div>
          </div>

          {/* CARD 2: Visita los Sitios (col-span-12 md:col-span-5) */}
          <div className="md:col-span-5 bg-[#001721] border border-[#005049]/25 p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-[#43e5d4]/40 transition-colors text-left">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#43e5d4]/10 flex items-center justify-center text-[#43e5d4] border border-[#43e5d4]/20">
                <Compass className="w-5 h-5 text-[#43e5d4]" />
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">
                Visita los Sitios
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                Explora monumentos históricos y maravillas naturales. Cada ubicación es un nuevo hito en tu carrera como Explorador Digital.
              </p>
            </div>
            
            {/* Design detail bottom line */}
            <div className="h-1 w-12 bg-[#43e5d4]/30 rounded"></div>
          </div>

          {/* CARD 3: GPS Check-in (col-span-12 md:col-span-5) */}
          <div className="md:col-span-5 bg-[#001721] border border-[#005049]/25 p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-[#43e5d4]/40 transition-colors text-left">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#43e5d4]/10 flex items-center justify-center text-[#43e5d4] border border-[#43e5d4]/20">
                <MapPin className="w-5 h-5 text-[#43e5d4]" />
              </div>
              <h3 className="font-headline text-lg font-extrabold text-on-surface">
                GPS Check-in
              </h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                Nuestra tecnología de geovallado valida tu presencia. Solo los verdaderos viajeros obtienen el sello.
              </p>
            </div>

            {/* Bottom notification indicator inside card */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1a3848]/40">
              <CheckCircle className="w-4 h-4 text-secondary" />
              <span className="text-[10px] font-black tracking-widest text-[#43e5d4] uppercase">
                VALIDACIÓN EN TIEMPO REAL
              </span>
            </div>
          </div>

          {/* CARD 4: Gana cNFTs Exclusivos (col-span-12 md:col-span-7) */}
          <div className="md:col-span-7 bg-[#001721] border border-[#005049]/25 p-8 rounded-3xl flex flex-col md:flex-row justify-between gap-6 overflow-hidden relative group hover:border-[#43e5d4]/40 transition-colors">
            
            {/* Hologram render floating on left side of card */}
            <div className="relative w-full md:w-44 h-36 md:h-full rounded-2xl overflow-hidden self-center border border-[#1a3848]/50 shadow-sm shrink-0 order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=600&q=80" 
                alt="Solana cNFT Cryptocoin Hologram Render"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#001721]/30"></div>
            </div>

            <div className="space-y-4 max-w-sm text-left order-1 md:order-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#43e5d4]/10 flex items-center justify-center text-[#43e5d4] border border-[#43e5d4]/20 mb-4">
                  <Sparkles className="w-5 h-5 text-[#43e5d4]" />
                </div>
                <h3 className="font-headline text-lg font-extrabold text-on-surface">
                  Gana cNFTs Exclusivos
                </h3>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed mt-2">
                  Cada visita desbloquea un Compressed NFT único que vive en la blockchain. Son coleccionables, transferibles y demuestran tu historial viajero.
                </p>
              </div>

              {/* Three little icons row inside card */}
              <div className="flex gap-3 pt-4 select-none">
                <div className="p-1.5 rounded bg-[#43e5d4]/10 border border-[#43e5d4]/20" title="Trophy">
                  <Trophy className="w-3.5 h-3.5 text-[#43e5d4]" />
                </div>
                <div className="p-1.5 rounded bg-[#43e5d4]/10 border border-[#43e5d4]/20" title="License Badge">
                  <Award className="w-3.5 h-3.5 text-[#43e5d4]" />
                </div>
                <div className="p-1.5 rounded bg-[#43e5d4]/10 border border-[#43e5d4]/20" title="Block Ledger">
                  <Layers className="w-3.5 h-3.5 text-[#43e5d4]" />
                </div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="py-20 bg-[#001d2c]/40 border-y border-[#005049]/20 text-center space-y-6 px-4">
        <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface max-w-xl mx-auto leading-tight">
          ¿Listo para comenzar tu colección?
        </h2>
        <button
          onClick={onEnter}
          className="px-10 py-5 bg-[#43e5d4] hover:bg-[#c7ffd3] text-[#003732] font-black rounded-xl text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(67,229,212,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all outline-none cursor-pointer"
        >
          Empieza Ahora Gratis
        </button>
      </section>

      {/* 5. FOOTER SECTION */}
      <footer className="bg-[#00080d] border-t border-[#005049]/20 pt-16 pb-10 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-12 gap-8 text-left pb-12 border-b border-[#005049]/15">
          {/* Logo & Manifesto Column */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <span className="text-xl">🧭</span>
              <span className="font-headline text-base font-extrabold text-[#43e5d4] tracking-wider uppercase">
                Passport Pro
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant/70 leading-relaxed max-w-xs">
              Digitalizando el patrimonio cultural a través de experiencias gamificadas y tecnología blockchain.
            </p>
            
            {/* Relocated Login to Backend Action */}
            <button 
              onClick={onEnter}
              className="px-4 py-2 text-left rounded-xl bg-transparent border border-[#43e5d4]/30 hover:border-[#43e5d4] hover:bg-[#43e5d4]/10 text-[#43e5d4] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs font-bold uppercase tracking-wider outline-none cursor-pointer flex items-center gap-2 w-max shadow-[0_0_15px_rgba(67,229,212,0.05)]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login to Backend</span>
            </button>
          </div>

          {/* Comunidad Column */}
          <div className="col-span-1 md:col-span-2 md:ml-auto space-y-3.5">
            <h4 className="text-[10px] font-black text-on-surface tracking-widest uppercase pb-1.5 border-b border-[#005049]/10">
              COMUNIDAD
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant/80">
              <a href="#instagram" className="hover:text-[#43e5d4] hover:underline transition-all">Instagram</a>
              <a href="#twitter" className="hover:text-[#43e5d4] hover:underline transition-all">Twitter / X</a>
              <a href="#discord" className="hover:text-[#43e5d4] hover:underline transition-all">Discord</a>
            </div>
          </div>

          {/* Legal Column */}
          <div className="col-span-1 md:col-span-3 md:ml-auto space-y-3.5">
            <h4 className="text-[10px] font-black text-on-surface tracking-widest uppercase pb-1.5 border-b border-[#005049]/10">
              LEGAL
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant/80">
              <a href="#terms" className="hover:text-[#43e5d4] hover:underline transition-all">Términos de Servicio</a>
              <a href="#privacy" className="hover:text-[#43e5d4] hover:underline transition-all">Privacidad</a>
              <a href="#cookies" className="hover:text-[#43e5d4] hover:underline transition-all">Política de Cookies</a>
            </div>
          </div>

          {/* Soporte Column */}
          <div className="col-span-1 md:col-span-3 md:ml-auto space-y-3.5">
            <h4 className="text-[10px] font-black text-on-surface tracking-widest uppercase pb-1.5 border-b border-[#005049]/10">
              SOPORTE
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant/80">
              <a href="#help" className="hover:text-[#43e5d4] hover:underline transition-all">Centro de Ayuda</a>
              <a href="#contact" className="hover:text-[#43e5d4] hover:underline transition-all">Contacto</a>
            </div>
          </div>
        </div>

        {/* Footnote Copyright block */}
        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium text-on-surface-variant/50">
          <p>© 2024 Passport Pro. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs">
            <Globe className="w-4 h-4 text-on-surface-variant/40" />
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/20 inline-block"></span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] bg-secondary/10 px-1.5 py-0.5 rounded text-secondary border border-secondary/20">SSL SECURE</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
