/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowLeft, Calendar, Globe } from 'lucide-react';
import logoPintaMapas from '../assets/images/Logo Pinta Mapas1.png';

interface TermsOfServiceViewProps {
  onClose: () => void;
}

export default function TermsOfServiceView({ onClose }: TermsOfServiceViewProps) {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <motion.div 
      id="terms-of-service-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-[#000f16] text-[#c9d1d6] min-h-screen font-sans flex flex-col justify-between"
    >
      {/* 1. TOP HEADER BAR */}
      <header id="terms-header" className="sticky top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 md:px-12 h-16 sm:h-20 bg-[#001621]/90 backdrop-blur-xl border-b border-[#005049]/35 shadow-[0_0_20px_rgba(67,229,212,0.04)]">
        <div id="terms-header-logo-container" className="flex items-center gap-2 cursor-pointer" onClick={onClose}>
          <img 
            id="terms-header-logo"
            src={logoPintaMapas} 
            alt="Pinta Mapas" 
            referrerPolicy="no-referrer"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
          />
        </div>

        <button
          id="terms-back-button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-[#001c2c]/80 hover:bg-[#43e5d4]/10 border border-[#43e5d4]/30 text-secondary hover:text-white transition-all rounded-full text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-secondary" />
          <span>Regresar</span>
        </button>
      </header>

      {/* 2. MAIN TERMS CONTENT */}
      <main id="terms-main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 space-y-10">
        
        {/* Title Block */}
        <div id="terms-title-block" className="space-y-4 text-center">
          <div id="terms-icon-wrapper" className="w-14 h-14 rounded-2xl bg-[#43e5d4]/10 border border-[#43e5d4]/20 flex items-center justify-center text-[#43e5d4] mx-auto mb-2">
            <FileText className="w-7 h-7 text-[#43e5d4]" />
          </div>
          <h1 id="terms-title-heading" className="font-headline text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tight leading-none">
            TÉRMINOS DE SERVICIO
          </h1>
          <div id="terms-title-divider" className="w-16 h-1 bg-[#43e5d4] mx-auto rounded-full"></div>
          
          <div id="terms-meta-badges" className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-on-surface-variant/80">
            <span id="terms-badge-date" className="flex items-center gap-1.5 px-3 py-1 bg-[#001e2c] border border-secondary/20 rounded-full font-mono text-secondary">
              <Calendar className="w-3.5 h-3.5" />
              Actualizado: 5 de junio de 2026
            </span>
            <span id="terms-badge-platform" className="flex items-center gap-1.5 px-3 py-1 bg-[#001e2c] border border-secondary/20 rounded-full font-mono text-secondary">
              <Globe className="w-3.5 h-3.5 text-secondary" />
              bitacorapintamapas.vercel.app
            </span>
          </div>
        </div>

        {/* Content Box */}
        <div id="terms-content-box" className="bg-[#001721] border border-[#005049]/25 rounded-3xl p-6 sm:p-10 space-y-8 shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
          
          {/* Introduction block */}
          <div id="terms-intro" className="max-w-none">
            <p className="text-sm sm:text-base text-on-surface-variant/90 leading-relaxed text-left">
              Bienvenido a la <strong>Bitácora Pinta Mapas</strong>. Al acceder y utilizar este sitio web y sus herramientas digitales asociadas, usted acepta cumplir y estar sujeto a los siguientes Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, le solicitamos que no utilice la plataforma.
            </p>
          </div>

          <div id="terms-metadata" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#000f16]/50 rounded-2xl border border-[#005049]/15 text-left">
            <div id="terms-meta-plataforma">
              <h4 className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">Plataforma</h4>
              <p className="text-xs text-on-surface-variant font-medium">Bitácora Pinta Mapas (bitacorapintamapas.vercel.app)</p>
            </div>
            <div id="terms-meta-ambito">
              <h4 className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">Ámbito</h4>
              <p className="text-xs text-on-surface-variant font-medium">Registro de actividades, dinámicas educativas y exploración urbana</p>
            </div>
          </div>

          {/* Section 1.1 */}
          <section id="terms-section-1-1" className="space-y-3 pt-2 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#43e5d4] font-mono text-base">1.1.</span>
              Objeto de la Plataforma
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              La Bitácora Pinta Mapas es una herramienta digital diseñada para el seguimiento, registro, visualización y gestión de actividades vinculadas con proyectos de cartografía colectiva, dinámicas educativas, usabilidad y exploración urbana. Su propósito principal es servir de diario técnico y de campo para participantes, coordinadores y la comunidad en general.
            </p>
          </section>

          {/* Section 1.2 */}
          <section id="terms-section-1-2" className="space-y-4 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#43e5d4] font-mono text-base">1.2.</span>
              Uso Aceptable de los Servicios
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              El usuario se compromete a utilizar la plataforma únicamente con fines legítimos y de acuerdo con el propósito del proyecto. Queda estrictamente prohibido:
            </p>
            <ul className="grid grid-cols-1 gap-2.5">
              <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-xs text-on-surface-variant/95 leading-relaxed">Introducir datos falsos, erróneos o que no correspondan a las actividades reales del proyecto.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-xs text-on-surface-variant/95 leading-relaxed">Utilizar la plataforma para distribuir contenido ofensivo, difamatorio, obsceno o que vulnere derechos de terceros.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-xs text-on-surface-variant/95 leading-relaxed">Intentar alterar, dañar, saturar o realizar ingeniería inversa sobre la infraestructura del sitio alojado en Vercel.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-[#001019]/40 p-3 rounded-xl border border-[#005049]/10">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-xs text-on-surface-variant/95 leading-relaxed">Extraer de forma automatizada (scraping indebido) datos de otros usuarios sin autorización expresa.</span>
              </li>
            </ul>
          </section>

          {/* Section 1.3 */}
          <section id="terms-section-1-3" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#43e5d4] font-mono text-base">1.3.</span>
              Cuentas y Registro de Actividades
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              En caso de que la plataforma requiera la creación de un perfil de usuario o el envío de datos mediante formularios integrados:
            </p>
            <div className="pl-4 border-l-2 border-secondary/35 space-y-2.5 mt-1">
              <p className="text-xs text-on-surface-variant/85 leading-relaxed">
                • El usuario es responsable de salvaguardar sus credenciales de acceso (si aplica).
              </p>
              <p className="text-xs text-on-surface-variant/85 leading-relaxed">
                • Toda información enviada a través de los formularios de la bitácora debe ser precisa y respetar los derechos de propiedad intelectual de las metodologías utilizadas.
              </p>
            </div>
          </section>

          {/* Section 1.4 */}
          <section id="terms-section-1-4" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#43e5d4] font-mono text-base">1.4.</span>
              Propiedad Intelectual
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              Los contenidos propios de la plataforma, incluyendo el diseño de la interfaz, logotipos, metodologías de mapeo educativo, código fuente y textos explicativos son propiedad del proyecto Pinta Mapas o se utilizan bajo las licencias de software libre correspondientes. Las aportaciones y registros de los estudiantes y usuarios se recopilan con fines académicos, de prueba de usabilidad y divulgación comunitaria, respetando la autoría moral de los participantes.
            </p>
          </section>

          {/* Section 1.5 */}
          <section id="terms-section-1-5" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#43e5d4] font-mono text-base">1.5.</span>
              Limitación de Responsabilidad
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              La Bitácora Pinta Mapas se ofrece "tal cual" y "según disponibilidad". No se garantiza que la plataforma esté libre de interrupciones temporales causadas por el proveedor de alojamiento (Vercel) o actualizaciones técnicas. El proyecto no se hace responsable por pérdidas de información derivadas de fallos en el dispositivo del usuario o problemas de conectividad.
            </p>
          </section>

          {/* Section 1.6 */}
          <section id="terms-section-1-6" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#43e5d4] font-mono text-base">1.6.</span>
              Modificaciones de los Términos
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento para adaptarlos a nuevas fases de desarrollo del proyecto. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
            </p>
          </section>

        </div>

        {/* Elegant Back button at the bottom */}
        <div id="terms-bottom-action" className="flex justify-center pt-4">
          <button
            id="terms-back-button-bottom"
            onClick={onClose}
            className="px-8 py-3 bg-[#43e5d4] hover:bg-[#c7ffd3] text-[#003732] font-black rounded-full text-xs uppercase tracking-wider hover:scale-[1.02] transform active:scale-95 transition-all outline-none cursor-pointer shadow-[0_0_15px_rgba(67,229,212,0.15)] flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Bitácora</span>
          </button>
        </div>

      </main>

      {/* 3. FOOTER */}
      <footer id="terms-footer" className="bg-[#00080d] border-t border-[#005049]/20 py-8 px-6 text-center text-xs text-on-surface-variant/40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BITÁCORA DIGITAL PINTA MAPAS. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-secondary/10 px-1.5 py-0.5 rounded text-secondary border border-secondary/20">SSL SECURE</span>
            <span className="text-[10px] bg-[#001c27] border border-secondary/35 text-secondary px-2 py-0.5 rounded-lg font-mono">SOLANA SECURED</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
