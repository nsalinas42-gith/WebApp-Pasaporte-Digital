/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Map, 
  Sparkles, 
  Layers, 
  Users, 
  HelpCircle, 
  Activity, 
  Navigation,
  CheckCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Clock
} from 'lucide-react';
import logoPintaMapas from '../assets/images/Logo Pinta Mapas2.png';

interface ProyectoViewProps {
  onClose: () => void;
}

export default function ProyectoView({ onClose }: ProyectoViewProps) {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <motion.div 
      id="proyecto-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-[#000f16] text-[#c9d1d6] min-h-screen font-sans flex flex-col justify-between"
    >
      {/* 1. TOP HEADER BAR */}
      <header id="proyecto-header" className="sticky top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 md:px-12 h-16 sm:h-20 bg-[#001621]/90 backdrop-blur-xl border-b border-[#005049]/35 shadow-[0_0_20px_rgba(26, 86, 219,0.04)]">
        <div id="proyecto-header-logo-container" className="flex items-center gap-2 cursor-pointer" onClick={onClose}>
          <img 
            id="proyecto-header-logo"
            src={logoPintaMapas} 
            alt="Pinta Mapas" 
            referrerPolicy="no-referrer"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
          />
        </div>

        <button
          id="proyecto-back-button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-[#001c2c]/80 hover:bg-[#1A56DB]/10 border border-[#1A56DB]/30 text-secondary hover:text-white transition-all rounded-full text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-secondary" />
          <span>Regresar</span>
        </button>
      </header>

      {/* 2. MAIN PROYECTO CONTENT */}
      <main id="proyecto-main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 space-y-12">
        
        {/* Title Block */}
        <div id="proyecto-title-block" className="space-y-4 text-center">
          <div id="proyecto-icon-wrapper" className="w-16 h-16 rounded-2xl bg-[#1A56DB]/10 border border-[#1A56DB]/20 flex items-center justify-center text-[#1A56DB] mx-auto mb-2 shadow-[0_0_15px_rgba(26, 86, 219,0.1)]">
            <Map className="w-8 h-8 text-[#1A56DB]" />
          </div>
          <h1 id="proyecto-title-heading" className="font-headline text-3xl sm:text-5xl font-black text-on-surface uppercase tracking-tight leading-none">
            Sobre el Proyecto
          </h1>
          <p className="text-secondary font-mono tracking-wider text-xs sm:text-sm uppercase font-bold">
            Nombre del Proyecto: <span className="text-white bg-[#1A56DB]/10 px-2.5 py-1 rounded-md border border-[#1A56DB]/20 ml-1">Pinta Mapas</span>
          </p>
          <div id="proyecto-title-divider" className="w-20 h-1 bg-[#1A56DB] mx-auto rounded-full"></div>
        </div>

        {/* Core Sections Grid */}
        <div id="proyecto-sections-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1 */}
          <div className="bg-[#001721] border border-[#005049]/25 rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#1A56DB]/30 transition-all">
            <div className="space-y-4">
              <h3 className="font-headline text-lg sm:text-xl font-black text-on-surface">
                1. ¿Qué estamos construyendo?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/90 leading-relaxed">
                Estamos construyendo <strong className="text-secondary">Pinta Mapas</strong>, una propuesta educativa, interactiva y gamificada que fusiona lo físico con lo digital. Consiste en:
              </p>
              <ul className="space-y-3 pt-2 text-left">
                <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong className="text-[#1A56DB]">El componente físico:</strong> Mapas gigantes en blanco y negro impresos en papel bond que ilustran detalladamente lugares emblemáticos, flora, fauna, monumentos y personajes históricos (comenzando con el Casco Histórico de Caracas).
                  </span>
                </li>
                <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong className="text-[#1A56DB]">El componente digital (Bitácora Digital):</strong> Una aplicación web (MVP asegurado bajo la red de Solana) que funciona como un <em>Digital Passport</em>. Permite llevar un registro digital, interactuar con mapas interactivos a través de códigos QR y Google MyMaps, y conectar con activos digitales en la blockchain.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-[#001721] border border-[#005049]/25 rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#1A56DB]/30 transition-all">
            <div className="space-y-4">
              <h3 className="font-headline text-lg sm:text-xl font-black text-on-surface">
                2. ¿Para quién es?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/90 leading-relaxed">
                Está diseñado principalmente para:
              </p>
              <ul className="space-y-3 pt-2 text-left">
                <li className="flex items-start bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong className="text-white">Familias, niños y adolescentes:</strong> Como una actividad recreativa y colaborativa en el hogar.
                  </span>
                </li>
                <li className="flex items-start bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong className="text-white">Colegios, estudiantes y docentes:</strong> Como un recurso pedagógico e interdisciplinario para las asignaturas de historia, geografía y arte.
                  </span>
                </li>
                <li className="flex items-start bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong className="text-white">Exploradores urbanos y viajeros:</strong> Personas interesadas en la conservación patrimonial, la fotografía urbana y el turismo histórico local.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-[#001721] border border-[#005049]/25 rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#1A56DB]/30 transition-all">
            <div className="space-y-4">
              <h3 className="font-headline text-lg sm:text-xl font-black text-on-surface">
                3. ¿Qué problema resuelve?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/90 leading-relaxed">
                Nuestra propuesta ataca dos desafíos críticos actuales:
              </p>
              <ul className="space-y-3 pt-2 text-left">
                <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong className="text-[#1A56DB]">El uso excesivo de pantallas:</strong> Ofrece una actividad táctil y de trabajo en equipo (el coloreado físico) para permitir "desconectar de los dispositivos y volver a conectar con el entorno", mitigando las horas excesivas frente al móvil.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong className="text-[#1A56DB]">Falta de conexión con la identidad local:</strong> Resuelve el desinterés o desconocimiento del patrimonio cultural e histórico local a través de una experiencia de aprendizaje autónomo y dinámico, tanto visual como kinestésico.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-[#001721] border border-[#005049]/25 rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:border-[#1A56DB]/30 transition-all">
            <div className="space-y-4">
              <h3 className="font-headline text-lg sm:text-xl font-black text-on-surface">
                4. ¿Cuál es la acción principal de la app?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant/90 leading-relaxed">
                La acción principal en la Bitácora Digital es el registro, la exploración y la validación. Invitamos al usuario a transformar sus viajes en una aventura digital mediante:
              </p>
              <ul className="space-y-3 pt-2 text-left">
                <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3.5 rounded-xl border border-[#005049]/10">
                  <span className="text-[#1A56DB] font-black shrink-0">1.</span>
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong>Escaneo de códigos QR</strong> en el mapa físico de Pinta Mapas.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3.5 rounded-xl border border-[#005049]/10">
                  <span className="text-[#1A56DB] font-black shrink-0">2.</span>
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong>GPS Check-in (Validación en tiempo real):</strong> La tecnología de geolocalización integrada valida la presencia física del usuario directamente en el monumento histórico.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3.5 rounded-xl border border-[#005049]/10">
                  <span className="text-[#1A56DB] font-black shrink-0">3.</span>
                  <span className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <strong>Reclamar e-Insignias y cNFTs:</strong> Desbloquear Compressed NFTs (cNFTs) de Solana y medallas de nivel que comprueban de manera permanente su trayectoria de exploración.
                  </span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Section 5 - Wide Block */}
        <div className="bg-[#001721] border border-[#1A56DB]/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:border-[#1A56DB]/40 transition-all text-left">
          <h3 className="font-headline text-lg sm:text-xl font-black text-on-surface">
            5. ¿Cuál es la versión mínima que vamos a terminar?
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant/90 leading-relaxed">
            La versión mínima (MVP) es la <strong className="text-secondary">Bitácora Digital Pinta Mapas MVP • Solana cNFT v1.0</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#000f16]/60 p-4 rounded-2xl border border-secondary/10 space-y-2">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Core Features MVP
              </h4>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                Sistema seguro de inicio de sesión/registro de usuarios (correo y contraseña o modo Invitado), y la vinculación con el mapa físico de la primera ruta emblemática.
              </p>
            </div>
            <div className="bg-[#000f16]/60 p-4 rounded-2xl border border-secondary/10 space-y-2">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Ruta Inicial & Recompensas
              </h4>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                Mapa Casco Histórico de Caracas Vol. 1 Ver. 1.0 (Centro, con 7 lugares emblemáticos), GPS Check-in en tiempo real y la entrega de 6 insignias de explorador coleccionables en Solana.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid: Estado, Próximos Pasos, Equipo */}
        <div id="proyecto-status-bento" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Card: Estado Actual */}
          <div className="bg-[#001721] border border-amber-500/20 rounded-3xl p-6 space-y-3.5 shadow-md text-left relative overflow-hidden group hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            <div className="space-y-3 z-10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="font-headline text-[#f2a83b] font-black text-sm uppercase tracking-wide">
                  Estado actual:
                </h4>
              </div>
              <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                Fase de prototipo funcional y pruebas de interfaz móvil en AI Studio, con integraciones de Firebase y simulación de la acuñación en Solana cNFT completada.
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 text-[9px] font-black tracking-widest uppercase bg-amber-400/10 text-amber-300 rounded border border-amber-400/20">
                MVP en Desarrollo
              </span>
            </div>
          </div>

          {/* Card: Próximos pasos */}
          <div className="bg-[#001721] border border-secondary/20 rounded-3xl p-6 space-y-3.5 shadow-md text-left relative overflow-hidden group hover:border-[#1A56DB]/40 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/15 transition-all" />
            <div className="space-y-3 z-10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <h4 className="font-headline text-[#1A56DB] font-black text-sm uppercase tracking-wide">
                  Próximos pasos:
                </h4>
              </div>
              <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                Pruebas de geolocalización con educadores de Caracas, impresión a gran escala de los mapas físicos de prueba (bond 80g), y despliegue del contrato cNFT en Solana Devnet.
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 text-[9px] font-black tracking-widest uppercase bg-[#1A56DB]/10 text-secondary rounded border border-secondary/20">
                Fase de Pruebas
              </span>
            </div>
          </div>

          {/* Card: Equipo / roles */}
          <div className="bg-[#001721] border border-blue-400/20 rounded-3xl p-6 space-y-3.5 shadow-md text-left relative overflow-hidden group hover:border-blue-400/40 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
            <div className="space-y-3 z-10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h4 className="font-headline text-blue-400 font-black text-sm uppercase tracking-wide">
                  Equipo / roles:
                </h4>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white">
                  Nelson Salinas
                </p>
                <div className="flex flex-col gap-1 text-xs text-on-surface-variant/80 font-mono">
                  <span>• Diseñador</span>
                  <span>• Developer</span>
                  <span>• Vibe Coding</span>
                  <span>• Content Creator</span>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 text-[9px] font-black tracking-widest uppercase bg-blue-400/10 text-blue-300 rounded border border-blue-400/20">
                ACTIVO EN EL DESARROLLO
              </span>
            </div>
          </div>

        </div>

        {/* Elegant Back button at the bottom */}
        <div id="proyecto-bottom-action" className="flex justify-center pt-6">
          <button
            id="proyecto-back-button-bottom"
            onClick={onClose}
            className="px-10 py-4 bg-[#1A56DB] hover:bg-[#c7ffd3] text-[#003732] font-black rounded-xl text-xs uppercase tracking-wider hover:scale-[1.03] transform active:scale-95 transition-all outline-none cursor-pointer shadow-[0_0_20px_rgba(26, 86, 219,0.2)] flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Bitácora</span>
          </button>
        </div>

      </main>

      {/* 3. FOOTER */}
      <footer id="proyecto-footer" className="bg-[#00080d] border-t border-[#005049]/20 py-8 px-6 text-center text-xs text-on-surface-variant/40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BITACORA DIGITAL | PINTA MAPAS. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-secondary/10 px-1.5 py-0.5 rounded text-secondary border border-secondary/20">SOLANA cNFT READY</span>
            <span className="text-[10px] bg-[#001c27] border border-secondary/35 text-secondary px-2 py-0.5 rounded-lg font-mono">MVP v1.0</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
