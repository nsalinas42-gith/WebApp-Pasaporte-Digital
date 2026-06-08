/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Calendar, UserCheck } from 'lucide-react';
import logoPintaMapas from '../assets/images/Logo Pinta Mapas2.png';

interface PrivacyPolicyViewProps {
  onClose: () => void;
}

export default function PrivacyPolicyView({ onClose }: PrivacyPolicyViewProps) {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <motion.div 
      id="privacy-policy-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-[#000f16] text-[#c9d1d6] min-h-screen font-sans flex flex-col justify-between"
    >
      {/* 1. TOP HEADER BAR */}
      <header id="privacy-header" className="sticky top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 md:px-12 h-16 sm:h-20 bg-[#001621]/90 backdrop-blur-xl border-b border-[#005049]/35 shadow-[0_0_20px_rgba(26, 86, 219,0.04)]">
        <div id="privacy-header-logo-container" className="flex items-center gap-2 cursor-pointer" onClick={onClose}>
          <img 
            id="privacy-header-logo"
            src={logoPintaMapas} 
            alt="Pinta Mapas" 
            referrerPolicy="no-referrer"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
          />
        </div>

        <button
          id="privacy-back-button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-[#001c2c]/80 hover:bg-[#1A56DB]/10 border border-[#1A56DB]/30 text-secondary hover:text-white transition-all rounded-full text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-secondary" />
          <span>Regresar</span>
        </button>
      </header>

      {/* 2. MAIN PRIVACY CONTENT */}
      <main id="privacy-main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 space-y-10">
        
        {/* Title Block */}
        <div id="privacy-title-block" className="space-y-4 text-center">
          <div id="privacy-icon-wrapper" className="w-14 h-14 rounded-2xl bg-[#1A56DB]/10 border border-[#1A56DB]/20 flex items-center justify-center text-[#1A56DB] mx-auto mb-2">
            <Shield className="w-7 h-7 text-[#1A56DB]" />
          </div>
          <h1 id="privacy-title-heading" className="font-headline text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tight leading-none">
            POLÍTICA DE PRIVACIDAD
          </h1>
          <div id="privacy-title-divider" className="w-16 h-1 bg-[#1A56DB] mx-auto rounded-full"></div>
          
          <div id="privacy-meta-badges" className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-on-surface-variant/80">
            <span id="privacy-badge-date" className="flex items-center gap-1.5 px-3 py-1 bg-[#001e2c] border border-secondary/20 rounded-full font-mono text-secondary">
              <Calendar className="w-3.5 h-3.5" />
              Actualizado: 5 de junio de 2026
            </span>
            <span id="privacy-badge-compliance" className="flex items-center gap-1.5 px-3 py-1 bg-[#001e2c] border border-secondary/20 rounded-full font-mono text-secondary">
              <UserCheck className="w-3.5 h-3.5 text-secondary" />
              Protección de Datos Educativos
            </span>
          </div>
        </div>

        {/* Content Box */}
        <div id="privacy-content-box" className="bg-[#001721] border border-[#005049]/25 rounded-3xl p-6 sm:p-10 space-y-8 shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
          
          {/* Introduction block */}
          <div id="privacy-intro" className="max-w-none text-left">
            <p className="text-sm sm:text-base text-on-surface-variant/90 leading-relaxed">
              En la <strong>Bitácora Pinta Mapas</strong>, la privacidad de nuestros usuarios y la transparencia en el manejo de datos son fundamentales. Esta Política de Privacidad describe el tipo de información que recopilamos, cómo la tratamos y las medidas de seguridad adoptadas para garantizar un entorno seguro y de confianza para toda nuestra comunidad.
            </p>
          </div>

          <div id="privacy-metadata-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#000f16]/50 rounded-2xl border border-[#005049]/15 text-left">
            <div id="privacy-meta-responsable">
              <h4 className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">Responsable</h4>
              <p className="text-xs text-on-surface-variant font-medium">Equipo de Coordinación de Pinta Mapas</p>
            </div>
            <div id="privacy-meta-cumplimiento">
              <h4 className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">Cumplimiento</h4>
              <p className="text-xs text-on-surface-variant font-medium">Estándares de protección de datos personales y anonimización educativa</p>
            </div>
          </div>

          {/* Section 2.1 */}
          <section id="privacy-section-2-1" className="space-y-3 pt-2 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#1A56DB] font-mono text-base">2.1.</span>
              Información que Recopilamos
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              Dependiendo de la interacción con la plataforma, podemos recopilar los siguientes datos de forma transparente y voluntaria:
            </p>
            <ul className="grid grid-cols-1 gap-3.5 mt-2">
              <li className="flex flex-col gap-1 bg-[#001019]/40 p-4 rounded-xl border border-[#005049]/10">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider font-mono">Datos de Registro de Actividades</span>
                <span className="text-xs text-on-surface-variant/95 leading-relaxed">Información cualitativa o cuantitativa relacionada con las pruebas de usabilidad, mapas coloreados, coordenadas de exploración o dinámicas de campo enviadas por los usuarios de forma voluntaria.</span>
              </li>
              <li className="flex flex-col gap-1 bg-[#001019]/40 p-4 rounded-xl border border-[#005049]/10">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider font-mono">Datos de Identificación Básica</span>
                <span className="text-xs text-on-surface-variant/95 leading-relaxed">Nombre, alias o correo electrónico en caso de uso de formularios de contacto o registro de participantes.</span>
              </li>
              <li className="flex flex-col gap-1 bg-[#001019]/40 p-4 rounded-xl border border-[#005049]/10">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider font-mono">Datos Técnicos</span>
                <span className="text-xs text-on-surface-variant/95 leading-relaxed">Dirección IP, tipo de navegador y datos de uso recopilados de forma automática por la infraestructura de Vercel con fines de optimización y analítica ligera.</span>
              </li>
            </ul>
          </section>

          {/* Section 2.2 */}
          <section id="privacy-section-2-2" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#1A56DB] font-mono text-base">2.2.</span>
              Finalidad del Tratamiento de Datos
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              Los datos recopilados se utilizan estrictamente para mejorar fines formativos y de experiencia, destacando los siguientes propósitos:
            </p>
            <div className="pl-4 border-l-2 border-secondary/35 space-y-3 mt-1 text-xs">
              <p className="text-on-surface-variant/85 leading-relaxed">
                • <strong>Evaluación:</strong> Evaluar los resultados del proyecto educativo y la usabilidad de las herramientas cartográficas de Pinta Mapas.
              </p>
              <p className="text-on-surface-variant/85 leading-relaxed">
                • <strong>Control:</strong> Llevar un control cronológico y ordenado (bitácora) del avance del proyecto y la participación estudiantil.
              </p>
              <p className="text-on-surface-variant/85 leading-relaxed">
                • <strong>Evolución:</strong> Mejorar la experiencia de usuario y diseñar futuras funciones del ecosistema digital.
              </p>
              <p className="text-on-surface-variant/85 leading-relaxed">
                • <strong>Atención:</strong> Responder a consultas, soporte técnico o solicitudes de información de los participantes.
              </p>
            </div>
          </section>

          {/* Section 2.3 */}
          <section id="privacy-section-2-3" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#1A56DB] font-mono text-base">2.3.</span>
              Retención y Anonimización de Datos
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              Dado el carácter educativo, de investigación e histórico del proyecto, los datos agregados y los resultados de las bitácoras podrán conservarse de manera indefinida con fines estadísticos y de portafolio pedagógico. Siempre que sea posible, los datos de los estudiantes y menores de edad participantes se mantendrán de forma estrictamente anonimizada o bajo seudónimos para proteger su identidad.
            </p>
          </section>

          {/* Section 2.4 */}
          <section id="privacy-section-2-4" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#1A56DB] font-mono text-base">2.4.</span>
              Compartición de Información con Terceros
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              No vendemos, comercializamos ni transferimos información de identificación personal a terceros. Los datos solo podrán ser visualizados por los coordinadores del proyecto, el equipo de desarrollo técnico y, en formatos consolidados no identificables, en reportes públicos sobre el impacto del proyecto.
            </p>
          </section>

          {/* Section 2.5 */}
          <section id="privacy-section-2-5" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#1A56DB] font-mono text-base">2.5.</span>
              Seguridad de la Información
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra el acceso no autorizado, alteración o destrucción. El tráfico web está cifrado mediante el protocolo HTTPS provisto de forma nativa por la plataforma de despliegue Vercel.
            </p>
          </section>

          {/* Section 2.6 */}
          <section id="privacy-section-2-6" className="space-y-3 text-left">
            <h3 className="font-headline text-lg font-black text-on-surface flex items-center gap-2">
              <span className="text-[#1A56DB] font-mono text-base">2.6.</span>
              Derechos del Usuario
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
              Los usuarios tienen derecho a solicitar el acceso, rectificación o eliminación de cualquier información personal que se haya almacenado a través de los formularios de la bitácora. Para ejercer estos derechos, puede ponerse en contacto con la administración del proyecto a través de los canales oficiales habilitados en la web.
            </p>
          </section>

        </div>

        {/* Elegant Back button at the bottom */}
        <div id="privacy-bottom-action" className="flex justify-center pt-4">
          <button
            id="privacy-back-button-bottom"
            onClick={onClose}
            className="px-8 py-3 bg-[#1A56DB] hover:bg-[#c7ffd3] text-[#003732] font-black rounded-full text-xs uppercase tracking-wider hover:scale-[1.02] transform active:scale-95 transition-all outline-none cursor-pointer shadow-[0_0_15px_rgba(26, 86, 219,0.15)] flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Bitácora</span>
          </button>
        </div>

      </main>

      {/* 3. FOOTER */}
      <footer id="privacy-footer" className="bg-[#00080d] border-t border-[#005049]/20 py-8 px-6 text-center text-xs text-on-surface-variant/40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BITACORA DIGITAL | PINTA MAPAS. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-secondary/10 px-1.5 py-0.5 rounded text-secondary border border-secondary/20">SSL SECURE</span>
            <span className="text-[10px] bg-[#001c27] border border-secondary/35 text-secondary px-2 py-0.5 rounded-lg font-mono">SOLANA SECURED</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
