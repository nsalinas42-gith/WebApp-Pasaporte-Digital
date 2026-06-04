/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Accessibility, 
  Type, 
  Contrast, 
  Link as LinkIcon, 
  MousePointer, 
  RotateCcw, 
  X, 
  Eye, 
  Activity,
  TextCursor,
  AlignLeft
} from 'lucide-react';
import { useLanguage } from '../translations';

export default function UserWayAccessibility() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // States for all accessibility options
  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('acc-font-size')) || 100;
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('acc-high-contrast') === 'true';
  });
  const [highlightLinks, setHighlightLinks] = useState<boolean>(() => {
    return localStorage.getItem('acc-highlight-links') === 'true';
  });
  const [dyslexicFont, setDyslexicFont] = useState<boolean>(() => {
    return localStorage.getItem('acc-dyslexic-font') === 'true';
  });
  const [textSpacing, setTextSpacing] = useState<boolean>(() => {
    return localStorage.getItem('acc-text-spacing') === 'true';
  });
  const [largeCursor, setLargeCursor] = useState<boolean>(() => {
    return localStorage.getItem('acc-large-cursor') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('acc-reduced-motion') === 'true';
  });

  // Toggle Panel open/close
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Synchronize visual features with DOM on state change
  useEffect(() => {
    // 1. Text Zoom/Font size
    if (fontSize === 100) {
      document.documentElement.style.fontSize = '';
    } else {
      document.documentElement.style.fontSize = `${fontSize}%`;
    }
    localStorage.setItem('acc-font-size', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    // 2. High Contrast Mode
    if (highContrast) {
      document.documentElement.classList.add('high-contrast-active');
    } else {
      document.documentElement.classList.remove('high-contrast-active');
    }
    localStorage.setItem('acc-high-contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    // 3. Highlight links
    if (highlightLinks) {
      document.body.classList.add('highlight-links-active');
    } else {
      document.body.classList.remove('highlight-links-active');
    }
    localStorage.setItem('acc-highlight-links', String(highlightLinks));
  }, [highlightLinks]);

  useEffect(() => {
    // 4. Dyslexic font
    if (dyslexicFont) {
      document.body.classList.add('dyslexic-font-active');
    } else {
      document.body.classList.remove('dyslexic-font-active');
    }
    localStorage.setItem('acc-dyslexic-font', String(dyslexicFont));
  }, [dyslexicFont]);

  useEffect(() => {
    // 5. Letter/word spacing
    if (textSpacing) {
      document.body.classList.add('text-spacing-active');
    } else {
      document.body.classList.remove('text-spacing-active');
    }
    localStorage.setItem('acc-text-spacing', String(textSpacing));
  }, [textSpacing]);

  useEffect(() => {
    // 6. Large cursor
    if (largeCursor) {
      document.body.classList.add('large-cursor-active');
    } else {
      document.body.classList.remove('large-cursor-active');
    }
    localStorage.setItem('acc-large-cursor', String(largeCursor));
  }, [largeCursor]);

  useEffect(() => {
    // 7. Reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion-active');
    } else {
      document.documentElement.classList.remove('reduced-motion-active');
    }
    localStorage.setItem('acc-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  // Reset helper to clear all custom settings
  const handleResetAll = () => {
    setFontSize(100);
    setHighContrast(false);
    setHighlightLinks(false);
    setDyslexicFont(false);
    setTextSpacing(false);
    setLargeCursor(false);
    setReducedMotion(false);
  };

  // Label translations translated inside the component to keep translate setup easy
  const labels = {
    es: {
      btnTitle: 'Menú de Accesibilidad',
      title: 'Ajustes de Accesibilidad',
      reset: 'Restablecer Todo',
      increaseText: 'Aumentar Texto',
      highContrast: 'Alto Contraste',
      highlightLinks: 'Resaltar Enlaces',
      dyslexicFont: 'Fuente Dislexia',
      textSpacing: 'Espaciado Más Amplio',
      largeCursor: 'Cursor Grande',
      reducedMotion: 'Pausar Animaciones',
      active: 'Activo',
      inactive: 'Desactivado',
      normal: 'Normal'
    },
    en: {
      btnTitle: 'Accessibility Menu',
      title: 'Accessibility Controls',
      reset: 'Reset All',
      increaseText: 'Enlarge Text',
      highContrast: 'High Contrast',
      highlightLinks: 'Highlight Links',
      dyslexicFont: 'Dyslexic Font',
      textSpacing: 'Wider Spacing',
      largeCursor: 'Bigger Cursor',
      reducedMotion: 'Pause Animations',
      active: 'Active',
      inactive: 'Disabled',
      normal: 'Normal'
    }
  };

  const currentLabels = language === 'en' ? labels.en : labels.es;

  // Render text scale indicators
  const getFontSizeText = () => {
    if (fontSize === 100) return currentLabels.normal;
    return `+${fontSize - 100}%`;
  };

  return (
    <div className="relative inline-block text-left" ref={panelRef} id="accessibility-menu-container">
      {/* Universal userway stylesheet for styling dynamic rules */}
      <style>{`
        /* Dynamic rules applied to DOM based on state */
        .high-contrast-active {
          filter: contrast(1.25) saturate(1.1) !important;
        }
        .high-contrast-active body {
          background-color: #000407 !important;
          color: #f1f5f9 !important;
        }
        .high-contrast-active button, 
        .high-contrast-active a {
          border-color: #43e5d4 !important;
          color: #43e5d4 !important;
        }

        .highlight-links-active a, 
        .highlight-links-active button[role="link"] {
          outline: 2px dashed #43e5d4 !important;
          outline-offset: 3px !important;
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
        }

        .dyslexic-font-active, 
        .dyslexic-font-active * {
          font-family: "Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive, sans-serif !important;
        }

        .text-spacing-active p,
        .text-spacing-active span,
        .text-spacing-active a,
        .text-spacing-active button,
        .text-spacing-active h1,
        .text-spacing-active h2,
        .text-spacing-active h3,
        .text-spacing-active h4 {
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
          line-height: 1.75 !important;
        }

        .large-cursor-active,
        .large-cursor-active * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%2343e5d4" stroke="black" stroke-width="2"><path d="M5.5 3V20.5l4.8-4.8h6.2L5.5 3z"/></svg>'), auto !important;
        }

        .reduced-motion-active,
        .reduced-motion-active * {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
      `}</style>

      {/* Trigger Button with human-accessibility logo designed to match UserWay standards */}
      <button
        type="button"
        id="accessibility-trigger-button"
        onClick={togglePanel}
        title={currentLabels.btnTitle}
        aria-label={currentLabels.btnTitle}
        aria-expanded={isOpen}
        className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-xl bg-[#001c2c]/85 hover:bg-[#002e48] border border-secondary/35 text-secondary hover:text-white transition-all outline-none cursor-pointer shadow-[0_0_15px_rgba(67,229,212,0.08)] select-none shrink-0 group"
      >
        {/* Geometric Vitruvian Man representation (circle + square + human) */}
        <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
          {/* Vitruvian Circle */}
          <div className="absolute inset-0.5 rounded-full border border-secondary/30 group-hover:border-secondary/60 transition-colors duration-300"></div>
          {/* Vitruvian Square */}
          <div className="absolute inset-1.5 border border-secondary/25 group-hover:border-secondary/50 transition-colors duration-300"></div>
          {/* Core Human Figure */}
          <Accessibility className={`w-3.5 h-3.5 relative z-10 shrink-0 transition-transform duration-300 ${isOpen ? 'scale-115 text-white' : 'group-hover:scale-105'}`} />
        </div>
        <span className="text-[10px] sm:text-xs font-black font-mono tracking-widest uppercase relative top-px">
          Accesibilidad
        </span>
      </button>

      {/* Accessibility Floating Panel */}
      {isOpen && (
        <div
          id="accessibility-options-panel"
          className="absolute right-0 mt-3 w-80 sm:w-85 rounded-2xl bg-[#001721] border border-secondary/40 shadow-2xl z-50 overflow-hidden divide-y divide-[#005049]/25 text-[#c8e7fb]"
        >
          {/* Panel Header */}
          <div className="px-5 py-4 bg-[#012232] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Vitruvian icon in header */}
              <div className="relative w-7 h-7 flex items-center justify-center">
                <div className="absolute inset-0.5 rounded-full border border-secondary/40"></div>
                <div className="absolute inset-1.5 border border-secondary/30"></div>
                <Accessibility className="w-4 h-4 text-secondary relative z-10 animate-pulse" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase font-mono text-white">
                {currentLabels.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetAll}
                title={currentLabels.reset}
                className="p-1 px-2.5 rounded-lg border border-[#005049]/50 hover:border-secondary/40 text-[10px] text-secondary font-black tracking-wider uppercase bg-transparent transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  {language === 'en' ? 'Reset' : 'Reiniciar'}
                </div>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick toggle settings grid */}
          <div className="p-5 grid grid-cols-2 gap-3 bg-[#001521]/95">
            
            {/* 1. Large Text Size Control */}
            <button
              onClick={() => {
                const nextSize = fontSize === 100 ? 115 : fontSize === 115 ? 130 : fontSize === 130 ? 150 : 100;
                setFontSize(nextSize);
              }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer select-none ${
                fontSize > 100 
                  ? 'bg-secondary/10 border-secondary text-white font-bold' 
                  : 'bg-[#001c27]/50 border-[#005049]/40 hover:border-secondary/30 text-on-surface-variant'
              }`}
            >
              <Type className="w-5 h-5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold block leading-none">{currentLabels.increaseText}</span>
                <span className="text-[9px] font-mono font-medium opacity-60 uppercase tracking-widest">
                  {getFontSizeText()}
                </span>
              </div>
            </button>

            {/* 2. High Contrast toggle */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer select-none ${
                highContrast 
                  ? 'bg-secondary/10 border-secondary text-white font-bold' 
                  : 'bg-[#001c27]/50 border-[#005049]/40 hover:border-secondary/30 text-on-surface-variant'
              }`}
            >
              <Contrast className="w-5 h-5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold block leading-none">{currentLabels.highContrast}</span>
                <span className="text-[9px] font-mono font-medium opacity-60 uppercase tracking-widest">
                  {highContrast ? currentLabels.active : currentLabels.inactive}
                </span>
              </div>
            </button>

            {/* 3. Highlight Links toggle */}
            <button
              onClick={() => setHighlightLinks(!highlightLinks)}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer select-none ${
                highlightLinks 
                  ? 'bg-secondary/10 border-secondary text-white font-bold' 
                  : 'bg-[#001c27]/50 border-[#005049]/40 hover:border-secondary/30 text-on-surface-variant'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold block leading-none">{currentLabels.highlightLinks}</span>
                <span className="text-[9px] font-mono font-medium opacity-60 uppercase tracking-widest">
                  {highlightLinks ? currentLabels.active : currentLabels.inactive}
                </span>
              </div>
            </button>

            {/* 4. Reading/Dyslexia Font toggle */}
            <button
              onClick={() => setDyslexicFont(!dyslexicFont)}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer select-none ${
                dyslexicFont 
                  ? 'bg-secondary/10 border-secondary text-white font-bold' 
                  : 'bg-[#001c27]/50 border-[#005049]/40 hover:border-secondary/30 text-on-surface-variant'
              }`}
            >
              <AlignLeft className="w-5 h-5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold block leading-none">{currentLabels.dyslexicFont}</span>
                <span className="text-[9px] font-mono font-medium opacity-60 uppercase tracking-widest">
                  {dyslexicFont ? currentLabels.active : currentLabels.inactive}
                </span>
              </div>
            </button>

            {/* 5. Text letter/word spacing */}
            <button
              onClick={() => setTextSpacing(!textSpacing)}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer select-none ${
                textSpacing 
                  ? 'bg-secondary/10 border-secondary text-white font-bold' 
                  : 'bg-[#001c27]/50 border-[#005049]/40 hover:border-secondary/30 text-on-surface-variant'
              }`}
            >
              <TextCursor className="w-5 h-5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold block leading-none">{currentLabels.textSpacing}</span>
                <span className="text-[9px] font-mono font-medium opacity-60 uppercase tracking-widest">
                  {textSpacing ? currentLabels.active : currentLabels.inactive}
                </span>
              </div>
            </button>

            {/* 6. Larger mouse Cursor */}
            <button
              onClick={() => setLargeCursor(!largeCursor)}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer select-none ${
                largeCursor 
                  ? 'bg-secondary/10 border-secondary text-white font-bold' 
                  : 'bg-[#001c27]/50 border-[#005049]/40 hover:border-secondary/30 text-on-surface-variant'
              }`}
            >
              <MousePointer className="w-5 h-5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold block leading-none">{currentLabels.largeCursor}</span>
                <span className="text-[9px] font-mono font-medium opacity-60 uppercase tracking-widest">
                  {largeCursor ? currentLabels.active : currentLabels.inactive}
                </span>
              </div>
            </button>

            {/* 7. Reduced motion toggle (takes Spanish as key label column) */}
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`col-span-2 p-3.5 rounded-xl border flex items-center justify-center gap-3 transition-all cursor-pointer select-none ${
                reducedMotion 
                  ? 'bg-secondary/10 border-secondary text-white font-bold' 
                  : 'bg-[#001c27]/50 border-[#005049]/40 hover:border-secondary/30 text-on-surface-variant'
              }`}
            >
              <Activity className="w-5 h-5" />
              <div className="space-y-0.5 text-left flex-1">
                <span className="text-[11px] font-bold block leading-none">{currentLabels.reducedMotion}</span>
                <span className="text-[9px] font-mono font-medium opacity-60 uppercase tracking-widest">
                  {reducedMotion ? currentLabels.active : currentLabels.inactive}
                </span>
              </div>
            </button>
          </div>

          {/* Footer branding */}
          <div className="bg-[#000d14] px-5 py-3 flex items-center justify-between text-[8px] font-mono font-medium text-on-surface-variant/40 tracking-wider">
            <span className="uppercase">UserWay Universal Accessibility</span>
            <span className="uppercase">v1.2.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
