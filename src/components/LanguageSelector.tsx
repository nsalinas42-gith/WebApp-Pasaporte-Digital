/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../translations';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (lang: 'es' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const currentLabel = language === 'es' ? 'ESP' : 'ING';

  return (
    <div className="relative inline-block text-left select-none" ref={dropdownRef} id="language-selector-container">
      {/* Selector Button */}
      <button
        type="button"
        id="language-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#001c2c]/85 hover:bg-[#002e48] border border-secondary/35 text-secondary hover:text-white transition-all text-xs font-black uppercase tracking-wider outline-none cursor-pointer shadow-[0_0_15px_rgba(26, 86, 219,0.08)] h-10 select-none"
      >
        <Globe className="w-4 h-4 text-secondary group-hover:rotate-12 transition-transform duration-300 shrink-0" />
        <span className="font-bold tracking-widest">{currentLabel}</span>
        <ChevronDown className={`w-3 h-3 text-secondary transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div 
          id="language-dropdown-menu"
          className="absolute right-0 mt-2 w-32 rounded-xl bg-[#001721] border border-secondary/40 shadow-xl z-50 overflow-hidden divide-y divide-[#005049]/20"
        >
          <button
            onClick={() => handleSelectLanguage('es')}
            className={`w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all flex justify-between items-center ${
              language === 'es' 
                ? 'text-secondary bg-[#01262d] font-bold' 
                : 'text-on-surface-variant hover:text-secondary hover:bg-[#002e48]/30'
            }`}
          >
            <span>ESPAÑOL</span>
            {language === 'es' && <span className="text-[10px] text-secondary">●</span>}
          </button>
          
          <button
            onClick={() => handleSelectLanguage('en')}
            className={`w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all flex justify-between items-center ${
              language === 'en' 
                ? 'text-secondary bg-[#01262d] font-bold' 
                : 'text-on-surface-variant hover:text-secondary hover:bg-[#002e48]/30'
            }`}
          >
            <span>INGLES</span>
            {language === 'en' && <span className="text-[10px] text-secondary">●</span>}
          </button>
        </div>
      )}
    </div>
  );
}
