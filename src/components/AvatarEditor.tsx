/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import * as avataaars from '@dicebear/avataaars';
import { Sparkles, Save, RotateCcw, Palette, Smile as SmileIcon, User } from 'lucide-react';

// Nombres legibles en español de cada pestaña de personalización
const TAB_LABELS: Record<string, string> = {
  skinColor: 'Tono de Piel',
  top: 'Pelo y Sombreros',
  hairColor: 'Color de Pelo',
  hatColor: 'Color de Gorra/Sombrero',
  accessories: 'Lentes y Parches',
  accessoriesColor: 'Color de Lentes',
  facialHair: 'Barba y Bigote',
  facialHairColor: 'Color de Barba',
  clothing: 'Estilo de Ropa',
  clothesColor: 'Color de Ropa',
  clothingGraphic: 'Diseño de Camiseta',
  eyes: 'Expresión de Ojos',
  eyebrows: 'Forma de Cejas',
  mouth: 'Expresión de Boca',
  style: 'Formato de Fondo',
  backgroundColor: 'Color de Fondo'
};

// Traducción de los valores en inglés para el usuario final en español
const VALUE_TRANSLATIONS: Record<string, string> = {
  // Pelo / Top
  bald: 'Calvo / Sin Cabello',
  bob: 'Corte Bob',
  bun: 'Chongo / Moño alto',
  curly: 'Rizado Largo',
  curvy: 'Ondulado Largo',
  dreads: 'Rastas Largas',
  frida: 'Estilo Frida Kahlo',
  fro: 'Afro Exuberante',
  froBand: 'Afro con Banda',
  longButNotTooLong: 'Melena Mediana',
  miaWallace: 'Corte Recto Corto',
  shavedSides: 'Lados Rapados',
  straight01: 'Lacio Recto 1',
  straight02: 'Lacio Recto 2',
  straightAndStrand: 'Lacio Mechón al frente',
  dreads01: 'Rastas Medias',
  dreads02: 'Rastas Cortas',
  frizzle: 'Rizo Cortito',
  shaggy: 'Despeinado rebelde',
  shaggyMullet: 'Mullet Despeinado',
  shortCurly: 'Rojo Rizado Corto',
  shortFlat: 'Plano Deportivo',
  shortRound: 'Corto Redondo',
  shortWaved: 'Ondulo Corto',
  sides: 'Sienes Pobladas',
  theCaesar: 'Corte César clásico',
  theCaesarAndSidePart: 'César con partidura',
  bigHair: 'Cabello Exuberante',
  hat: 'Gorra deportiva',
  hijab: 'Hiyab tradicional',
  turban: 'Turbante elegante',
  winterHat1: 'Gorro de frío boreal',
  winterHat02: 'Gorro con pompón 1',
  winterHat03: 'Gorro con pompón 2',
  winterHat04: 'Gorro térmico',

  // Accesorios / Lentes
  none: 'Ninguno',
  kurt: 'Estilo Nirvana (Kurt)',
  prescription01: 'Lentes de Lectura 1',
  prescription02: 'Lentes de Lectura 2',
  round: 'Lentes Circulares',
  sunglasses: 'Lentes de Sol Oscuros',
  wayfarers: 'Lentes de Estilo Retro',
  eyepatch: 'Parche de Aventura',

  // Barba / Bigote
  beardLight: 'Sombra de barba corta',
  beardMedium: 'Barba cerrada media',
  beardMajestic: 'Barba frondosa augusta',
  moustacheFancy: 'Bigote con estilo',
  moustacheMagnum: 'Bigote clásico',

  // Ropa
  blazerAndShirt: 'Saco Formal y Camisa',
  blazerAndSweater: 'Saco Informal y Suéter',
  collarAndSweater: 'Suéter con camisa de cuello',
  graphicShirt: 'Camiseta de Diseños',
  hoodie: 'Sudadera con Capucha',
  overall: 'Overol clásico',
  shirtCrewNeck: 'Camiseta Cuello Redondo',
  shirtScoopNeck: 'Camiseta Escote Amplio',
  shirtVNeck: 'Camiseta Clásica Cuello V',

  // Diseños de Camiseta
  bat: 'Murciélago',
  bear: 'Oso tierno',
  cumbia: 'Bocina Cumbia',
  deer: 'Ciervo',
  diamond: 'Diamante',
  hola: 'Saludo "Hola"',
  pizza: 'Rebanada de Pizza',
  resist: 'Puño Revolucionario',
  skull: 'Calavera Pirata',
  skullOutline: 'Silueta Calavera',

  // Ojos
  closed: 'Cerrados en calma',
  cry: 'Lágrimas y llanto',
  eyeRoll: 'Mirar arriba con fastidio',
  happy: 'Felices y risueños',
  hearts: 'Enamorados (Corazones)',
  side: 'Mirando a un lado con desdén',
  squint: 'Ojos achinados analíticos',
  surprised: 'Sorprendidos/Exaltados',
  wink: 'Guiño coqueto',
  winkWacky: 'Guiño divertido y loco',
  xDizzy: 'Mareados / Inconscientes (Cruz)',

  // Cejas
  defaultNatural: 'Naturales estándar',
  angry: 'Enojadas definidas',
  angryNatural: 'Enojadas orgánicas',
  flatNatural: 'Horizontales planas',
  frownNatural: 'Preocupadas orgánicas',
  raisedExcited: 'Levantadas entusiasmadas',
  raisedExcitedNatural: 'Levantadas entusiasmadas orgánicas',
  sadConcerned: 'Preocupadas definidas',
  sadConcernedNatural: 'Preocupadas con sosiego',
  unibrowNatural: 'Uniceja clásica',
  upDown: 'Una arriba / una abajo',
  upDownNatural: 'Una arriba y una abajo natural',

  // Boca
  concerned: 'De Preocupación',
  disbelief: 'De Incredulidad / Dudas',
  eating: 'Comiendo gustosamente',
  grimace: 'Mueca de disgusto',
  sad: 'Curvada triste hacia abajo',
  screamOpen: 'Boquiabierto gritando',
  serious: 'Línea recta callada',
  smile: 'Sonrisa sincera amable',
  tongue: 'Persona sacando la lengua',
  twinkle: 'Sonrisa con destellos',
  vomit: 'Malestar estomacal',

  // Tipo de Fondo
  circle: 'Círculo de Color',
  default: 'Totalmente Transparente'
};

// Opciones estandarizadas acordes a las especificaciones reales de @dicebear/avataaars
const AVATAR_OPTIONS: Record<string, { label: string; values: string[] }> = {
  skinColor: { 
    label: 'Tono de Piel', 
    values: ['614335', 'd08b5b', 'ae5d29', 'edb98a', 'ffdbb4', 'fd9841', 'f8d25c'] 
  },
  top: {
    label: 'Cabello y Gorras',
    values: [
      'bald', 'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro', 'froBand', 
      'longButNotTooLong', 'miaWallace', 'shavedSides', 'straight01', 'straight02', 
      'straightAndStrand', 'dreads01', 'dreads02', 'frizzle', 'shaggy', 'shaggyMullet', 
      'shortCurly', 'shortFlat', 'shortRound', 'shortWaved', 'sides', 'theCaesar', 
      'theCaesarAndSidePart', 'bigHair', 'hat', 'hijab', 'turban', 'winterHat1', 
      'winterHat02', 'winterHat03', 'winterHat04'
    ]
  },
  hairColor: { 
    label: 'Color de Pelo', 
    values: ['2c1b18', '4a312c', '724133', 'a55728', 'c93305', 'b58143', 'd6b370', 'ecdcbf', 'f59797', 'e8e1e1'] 
  },
  hatColor: { 
    label: 'Color de Sombrero/Gorra', 
    values: ['262e33', '65c9ff', '5199e4', '25557c', 'e6e6e6', '929598', '3c4f5c', 'b1e2ff', 'a7ffc4', 'ffdeb5', 'ffafb9', 'ffffb1', 'ff488e', 'ff5c5c', 'ffffff'] 
  },
  accessories: { 
    label: 'Accesorios/Lentes', 
    values: ['none', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers', 'eyepatch'] 
  },
  accessoriesColor: { 
    label: 'Color de Accesorios', 
    values: ['262e33', '65c9ff', '5199e4', '25557c', 'e6e6e6', '929598', '3c4f5c', 'b1e2ff', 'a7ffc4', 'ffdeb5', 'ffafb9', 'ffffb1', 'ff488e', 'ff5c5c', 'ffffff'] 
  },
  facialHair: { 
    label: 'Barba / Bigote', 
    values: ['none', 'beardLight', 'beardMedium', 'beardMajestic', 'moustacheFancy', 'moustacheMagnum'] 
  },
  facialHairColor: { 
    label: 'Color de Barba', 
    values: ['2c1b18', '4a312c', '724133', 'a55728', 'c93305', 'b58143', 'd6b370', 'ecdcbf', 'f59797', 'e8e1e1'] 
  },
  clothing: { 
    label: 'Estilo de Ropa', 
    values: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'] 
  },
  clothesColor: { 
    label: 'Color de Ropa', 
    values: ['262e33', '65c9ff', '5199e4', '25557c', 'e6e6e6', '929598', '3c4f5c', 'b1e2ff', 'a7ffc4', 'ffdeb5', 'ffafb9', 'ffffb1', 'ff488e', 'ff5c5c', 'ffffff'] 
  },
  clothingGraphic: { 
    label: 'Gráfico Camiseta', 
    values: ['bat', 'bear', 'cumbia', 'deer', 'diamond', 'hola', 'pizza', 'resist', 'skull', 'skullOutline'] 
  },
  eyes: { 
    label: 'Ojos', 
    values: ['default', 'closed', 'cry', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky', 'xDizzy'] 
  },
  eyebrows: { 
    label: 'Cejas', 
    values: ['default', 'defaultNatural', 'angry', 'angryNatural', 'flatNatural', 'frownNatural', 'raisedExcited', 'raisedExcitedNatural', 'sadConcerned', 'sadConcernedNatural', 'unibrowNatural', 'upDown', 'upDownNatural'] 
  },
  mouth: { 
    label: 'Boca', 
    values: ['default', 'concerned', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'] 
  },
  style: {
    label: 'Tipo de Fondo',
    values: ['circle', 'default']
  },
  backgroundColor: {
    label: 'Color de Fondo',
    values: ['65c9ff', 'ffafb9', 'ffffb1', 'a7ffc4', '5199e4', 'e6e6e6', '3c4f5c', 'ffffff']
  }
};

interface AvatarConfig {
  style: 'circle' | 'default';
  skinColor: string[];
  top: string[];
  topProbability: number;
  hairColor: string[];
  hatColor: string[];
  accessories: string[];
  accessoriesProbability: number;
  accessoriesColor: string[];
  facialHair: string[];
  facialHairProbability: number;
  facialHairColor: string[];
  clothing: string[];
  clothesColor: string[];
  clothingGraphic: string[];
  eyes: string[];
  eyebrows: string[];
  mouth: string[];
  backgroundColor: string[];
}

interface AvatarEditorProps {
  initialConfig?: Partial<AvatarConfig>;
  onSave: (data: { config: AvatarConfig; dataUrl: string }) => void;
}

export default function AvatarEditor({ initialConfig, onSave }: AvatarEditorProps) {
  // Inicialización de la configuración con valores por defecto válidos y compatibles
  const [config, setConfig] = useState<AvatarConfig>({
    style: initialConfig?.style || 'circle',
    skinColor: initialConfig?.skinColor || ['edb98a'],
    top: initialConfig?.top || ['shortFlat'],
    topProbability: typeof initialConfig?.topProbability === 'number' ? initialConfig.topProbability : 100,
    hairColor: initialConfig?.hairColor || ['2c1b18'],
    hatColor: initialConfig?.hatColor || ['65c9ff'],
    accessories: initialConfig?.accessories || ['none'],
    accessoriesProbability: typeof initialConfig?.accessoriesProbability === 'number' ? initialConfig.accessoriesProbability : 0,
    accessoriesColor: initialConfig?.accessoriesColor || ['262e33'],
    facialHair: initialConfig?.facialHair || ['none'],
    facialHairProbability: typeof initialConfig?.facialHairProbability === 'number' ? initialConfig.facialHairProbability : 0,
    facialHairColor: initialConfig?.facialHairColor || ['2c1b18'],
    clothing: initialConfig?.clothing || ['hoodie'],
    clothesColor: initialConfig?.clothesColor || ['5199e4'],
    clothingGraphic: initialConfig?.clothingGraphic || ['pizza'],
    eyes: initialConfig?.eyes || ['default'],
    eyebrows: initialConfig?.eyebrows || ['default'],
    mouth: initialConfig?.mouth || ['smile'],
    backgroundColor: initialConfig?.backgroundColor || ['65c9ff']
  });

  const [activeTab, setActiveTab] = useState<keyof AvatarConfig>('skinColor');

  // React useMemo para generar el código SVG del avatar
  const avatarDataUrl = useMemo(() => {
    // Dicebear pide pasar un objeto plano con las propiedades necesarias
    const optionsToPass: any = {
      style: [config.style],
      skinColor: config.skinColor,
      top: config.topProbability === 0 ? [] : config.top,
      topProbability: config.topProbability,
      hairColor: config.hairColor,
      hatColor: config.hatColor,
      accessories: config.accessoriesProbability === 0 ? [] : config.accessories,
      accessoriesProbability: config.accessoriesProbability,
      accessoriesColor: config.accessoriesColor,
      facialHair: config.facialHairProbability === 0 ? [] : config.facialHair,
      facialHairProbability: config.facialHairProbability,
      facialHairColor: config.facialHairColor,
      clothing: config.clothing,
      clothesColor: config.clothesColor,
      clothingGraphic: config.clothingGraphic,
      eyes: config.eyes,
      eyebrows: config.eyebrows,
      mouth: config.mouth,
      size: 240,
    };

    // Solo se aplica el color de fondo si la forma de fondo es circular.
    if (config.style === 'circle') {
      optionsToPass.backgroundColor = config.backgroundColor;
    } else {
      optionsToPass.backgroundColor = ['transparent'];
    }

    const avatar = createAvatar(avataaars, optionsToPass);
    return avatar.toDataUri();
  }, [config]);

  // Manejar el cambio interactivo de una configuración
  const handleOptionChange = (key: keyof AvatarConfig, value: string) => {
    setConfig(prev => {
      const updated = { ...prev };
      
      if (key === 'top') {
        if (value === 'bald') {
          updated.topProbability = 0;
          updated.top = ['bob']; // Mantener un valor válido como respaldo visual invisible
        } else {
          updated.topProbability = 100;
          updated.top = [value];
        }
      } else if (key === 'accessories') {
        if (value === 'none') {
          updated.accessoriesProbability = 0;
          updated.accessories = ['kurt'];
        } else {
          updated.accessoriesProbability = 100;
          updated.accessories = [value];
        }
      } else if (key === 'facialHair') {
        if (value === 'none') {
          updated.facialHairProbability = 0;
          updated.facialHair = ['beardLight'];
        } else {
          updated.facialHairProbability = 100;
          updated.facialHair = [value];
        }
      } else if (key === 'style') {
        updated.style = value as 'circle' | 'default';
      } else if (key === 'topProbability' || key === 'accessoriesProbability' || key === 'facialHairProbability') {
        (updated as any)[key] = Number(value);
      } else {
        (updated as any)[key] = [value];
      }
      
      return updated;
    });
  };

  const handleRandomize = () => {
    const randomConfig: any = { ...config };
    Object.keys(AVATAR_OPTIONS).forEach((key) => {
      const opts = AVATAR_OPTIONS[key].values;
      const randomValue = opts[Math.floor(Math.random() * opts.length)];
      
      if (key === 'top') {
        const isBald = Math.random() < 0.15;
        if (isBald) {
          randomConfig.topProbability = 0;
          randomConfig.top = ['bob'];
        } else {
          randomConfig.topProbability = 100;
          randomConfig.top = [randomValue];
        }
      } else if (key === 'accessories') {
        const hasAcc = Math.random() < 0.40;
        if (!hasAcc || randomValue === 'none') {
          randomConfig.accessoriesProbability = 0;
          randomConfig.accessories = ['kurt'];
        } else {
          randomConfig.accessoriesProbability = 100;
          randomConfig.accessories = [randomValue];
        }
      } else if (key === 'facialHair') {
        const hasBeard = Math.random() < 0.30;
        if (!hasBeard || randomValue === 'none') {
          randomConfig.facialHairProbability = 0;
          randomConfig.facialHair = ['beardLight'];
        } else {
          randomConfig.facialHairProbability = 100;
          randomConfig.facialHair = [randomValue];
        }
      } else {
        if (key === 'style') {
          randomConfig.style = randomValue;
        } else {
          randomConfig[key] = [randomValue];
        }
      }
    });

    setConfig(randomConfig);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        config,
        dataUrl: avatarDataUrl
      });
    }
  };

  // Determinar si el valor está actualmente seleccionado en el estado
  const getIsSelected = (key: keyof AvatarConfig, value: string): boolean => {
    if (key === 'style') {
      return config.style === value;
    }
    if (key === 'top') {
      if (value === 'bald') return config.topProbability === 0;
      return config.topProbability > 0 && config.top[0] === value;
    }
    if (key === 'accessories') {
      if (value === 'none') return config.accessoriesProbability === 0;
      return config.accessoriesProbability > 0 && config.accessories[0] === value;
    }
    if (key === 'facialHair') {
      if (value === 'none') return config.facialHairProbability === 0;
      return config.facialHairProbability > 0 && config.facialHair[0] === value;
    }
    return config[key] && config[key][0] === value;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-1 bg-slate-900 text-white rounded-2xl w-full max-w-5xl mx-auto">
      
      {/* SECCIÓN IZQUIERDA: VISTA PREVIA DEL AVATAR */}
      <div className="flex flex-col items-center justify-start p-6 bg-slate-800/60 border border-slate-700/50 rounded-2xl lg:w-72 w-full shrink-0">
        
        <h3 className="text-base font-bold text-teal-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 animate-bounce text-teal-300" />
          Tu Personaje
        </h3>

        <div className="w-56 h-56 bg-slate-950 rounded-3xl flex items-center justify-center p-4 relative border border-teal-500/20 shadow-[0_0_25px_rgba(20,184,166,0.1)] group-hover:border-teal-500/40 transition-all">
          <img 
            src={avatarDataUrl} 
            alt="Vista Previa de Avatar DiceBear" 
            className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300" 
            referrerPolicy="no-referrer"
          />
        </div>

        <p className="mt-4 text-xs text-slate-400 font-medium">Diseño digital instantáneo</p>
        
        <div className="w-full flex flex-col gap-2.5 mt-6">
          <button
            type="button"
            onClick={handleRandomize}
            className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 hover:border-teal-500/40 text-slate-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
            Generar Aleatorio
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Aplicar y Guardar
          </button>
        </div>
      </div>

      {/* SECCIÓN DERECHA: SELECTOR DE RASGOS */}
      <div className="flex-1 flex flex-col min-h-[460px] bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="mb-4">
          <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
            <Palette className="w-3 h-3" /> Panel de Rasgos
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Personaliza cada Detalle
          </h2>
          <p className="text-xs text-slate-400">
            Elige los colores, peinados, expresiones y accesorios para tu viajero.
          </p>
        </div>

        {/* PESTAÑAS (TABS) RESPONSIVAS Y DESLIZABLES */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin border-b border-slate-800/50">
          {Object.keys(AVATAR_OPTIONS).map((key) => {
            const isTabActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as keyof AvatarConfig)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border-0 ${
                  isTabActive 
                    ? 'bg-teal-600/20 text-teal-300 font-bold border border-teal-500/40 shadow-sm' 
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/75'
                }`}
              >
                {key.toLowerCase().includes('color') ? (
                  <Palette className="w-3 h-3 text-teal-500" />
                ) : (
                  <SmileIcon className="w-3 h-3 text-slate-400" />
                )}
                {TAB_LABELS[key] || key}
              </button>
            );
          })}
        </div>

        {/* CONTENIDO DE LA PESTAÑA ACTIVA (OPCIONES DISPONIBLES) */}
        <div className="flex-1 bg-slate-950/80 border border-slate-800/60 p-4 rounded-xl overflow-y-auto max-h-[300px] scrollbar-thin">
          
          {/* SINOPSIS DE LO QUE ESTÁN EDITANDO */}
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>Editor de {TAB_LABELS[activeTab]}</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
              {AVATAR_OPTIONS[activeTab].values.length} opciones
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AVATAR_OPTIONS[activeTab].values.map((value) => {
              const isSelected = getIsSelected(activeTab, value);
              
              // RENDERIZADO DE SWATCHES SI ES UNA PROPIEDAD DE COLOR (HEX)
              if (activeTab.toLowerCase().includes('color')) {
                const hexColor = value.startsWith('#') ? value : `#${value}`;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleOptionChange(activeTab, value)}
                    className={`h-11 w-full rounded-xl transition-all border-2 cursor-pointer flex items-center justify-between px-3 overflow-hidden group/color ${
                      isSelected ? 'border-teal-400 scale-95 shadow-lg shadow-teal-500/10' : 'border-slate-800 hover:border-slate-600'
                    }`}
                    style={{ backgroundColor: hexColor }}
                    title={`Color: ${value}`}
                  >
                    {/* Indicador de seleccionado */}
                    {isSelected ? (
                      <span className="h-5 w-5 rounded-full bg-slate-900/80 flex items-center justify-center border border-teal-400/40 text-teal-300 font-extrabold text-[10px] mx-auto">
                        ✓
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover/color:opacity-80 px-2 py-0.5 rounded text-[9px] bg-black/60 text-white font-mono font-medium truncate w-full text-center transition-all">
                        {value}
                      </span>
                    )}
                  </button>
                );
              }

              // RENDERIZADO ESTÁNDAR TRADUCIDO CON DISEÑO PULIDO
              const textToShow = VALUE_TRANSLATIONS[value] || value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleOptionChange(activeTab, value)}
                  className={`py-3.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected 
                      ? 'bg-teal-950/60 border-teal-500/70 text-teal-300 shadow-md shadow-teal-950/20' 
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="leading-tight break-words max-w-full">
                    {textToShow}
                  </span>
                  
                  {isSelected && (
                    <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider scale-95 opacity-90">
                      • Seleccionado •
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
