/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, limit, query, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { UserProfile } from '../types';
import { Users, Sparkles, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

// Import local preset avatar assets as custom default images
import avatarHombre1 from '../assets/images/avatar_hombre_1.png';
import avatarHombre2 from '../assets/images/avatar_hombre_2.png';
import avatarJoven1 from '../assets/images/avatar_joven_1.png';
import avatarJoven2 from '../assets/images/avatar_joven_2.png';
import avatarMujer1 from '../assets/images/avatar_mujer_1.png';
import avatarMujer2 from '../assets/images/avatar_mujer_2.png';
import { resolveAvatar } from '../utils/avatars';


interface ProfileCarouselItem {
  uid: string;
  name: string;
  pseudonym: string;
  bio: string;
  avatarUrl: string;
  title?: string;
}

// 6 beautiful curated fallback profiles with Caracas context matching the digital passport aesthetic
const MOCK_PROFILES: ProfileCarouselItem[] = [
  {
    uid: 'mock-1',
    name: 'Félix Rodríguez',
    pseudonym: '@felix_voyager',
    bio: 'Apasionado por la historia colonial y la fotografía urbana en la gran Caracas.',
    avatarUrl: avatarHombre1,
    title: 'Explorador Supremo'
  },
  {
    uid: 'mock-2',
    name: 'Sofía Mendoza',
    pseudonym: '@sofia_avila',
    bio: 'Coleccionista de atardeceres desde el Ávila y entusiasta del arte moderno e histórico.',
    avatarUrl: avatarMujer1,
    title: 'Guía Local Experta'
  },
  {
    uid: 'mock-3',
    name: 'Mateo Crespo',
    pseudonym: '@mateo_crespo',
    bio: 'Cazador de rutas gastronómicas y senderos históricos. Conectando lo físico y digital.',
    avatarUrl: avatarHombre2,
    title: 'Cazador de Rutas'
  },
  {
    uid: 'mock-4',
    name: 'Camila Pérez',
    pseudonym: '@camilap_fotos',
    bio: 'Fotógrafa documental de Caracas. Registrando contrastes, fachadas y tesoros del casco central.',
    avatarUrl: avatarMujer2,
    title: 'Exploradora Avanzada'
  },
  {
    uid: 'mock-5',
    name: 'Elena Rostova',
    pseudonym: '@elena_exp',
    bio: 'Antropóloga urbana. Buscando rastrear memorias y cartografía viva en cada parada.',
    avatarUrl: avatarJoven2,
    title: 'Exploradora de Reinos'
  },
  {
    uid: 'mock-6',
    name: 'Diego Alarcón',
    pseudonym: '@diego_arq',
    bio: 'Estudiante de arquitectura fascinado por la conservación patrimonial y el urbanismo.',
    avatarUrl: avatarJoven1,
    title: 'Explorador Fluvial'
  }
];

export default function UserProfilesCarousel() {
  const [profiles, setProfiles] = useState<ProfileCarouselItem[]>(MOCK_PROFILES);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  // Load registered profiles from Firestore in real-time
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'), limit(12));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const fetchedList: ProfileCarouselItem[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Map Firestore doc to Carousel item schema, ensuring strict default/fallback structures
          const name = data.name || 'Viajero Misterioso';
          const rawTitle = data.title || 'Explorador';
          
          // Generate clean pseudonym handles from nickname or names
          let pseudo = data.pseudonym || data.title || '';
          if (!pseudo || pseudo.includes(' ')) {
            pseudo = '@' + name.toLowerCase().replace(/\s+/g, '_');
          } else if (!pseudo.startsWith('@')) {
            pseudo = '@' + pseudo;
          }

          fetchedList.push({
            uid: docSnap.id,
            name: name,
            pseudonym: pseudo,
            bio: data.bio || 'Sin biografía escrita aún. ¡Explorando nuevos mapas digitales!',
            avatarUrl: data.avatarUrl || avatarJoven1, // Fallback profile picture
            title: rawTitle
          });
        });

        // Mix fetched profiles with mock profiles to guarantee a full, rich carousel list
        const combined = [...fetchedList];
        MOCK_PROFILES.forEach(mock => {
          if (!combined.some(p => p.pseudonym === mock.pseudonym)) {
            combined.push(mock);
          }
        });
        setProfiles(combined);
      } else {
        // Keep MOCK list if collection is empty
        setProfiles(MOCK_PROFILES);
      }
      setLoading(false);
    }, (err) => {
      console.log('Using robust mockup carousel profiles (read permission restricted to direct admins).', err);
      setProfiles(MOCK_PROFILES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up the configurable rotation clock interval (3.5 seconds)
  useEffect(() => {
    if (isPaused || loading) {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
      return;
    }

    autoPlayTimer.current = setInterval(() => {
      handleNext();
    }, 3500);

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [isPaused, loading, profiles.length, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + profiles.length) % profiles.length);
  };

  // Determine current active cards to show of responsive density
  const getVisibleProfiles = () => {
    if (profiles.length === 0) return [];
    
    const visibleCards: ProfileCarouselItem[] = [];
    for (let i = 0; i < profiles.length; i++) {
      const index = (currentIndex + i) % profiles.length;
      visibleCards.push(profiles[index]);
    }
    return visibleCards;
  };

  const visibleList = getVisibleProfiles();

  return (
    <section 
      id="galeria-exploradores"
      className="py-16 bg-[#000c14] border-b border-[#005049]/20 relative overflow-hidden"
    >
      {/* Background grid details */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1A56DB]/20 to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(26, 86, 219,0.04)_0%,transparent_50%)] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 md:px-16 space-y-10 relative z-10">
        
        {/* Header decoration */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-left space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-secondary text-xs uppercase tracking-widest font-black font-mono">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>BITÁCORA DE EXPLORACIÓN</span>
            </div>
            <h3 className="font-headline text-2xl sm:text-3xl font-black text-on-surface leading-tight">
              COMUNIDAD
            </h3>
            <p className="text-xs sm:text-sm text-[#8c9f9e] leading-relaxed">
              Descubre a otros exploradores conectados a la Bitácora Digital de Pinta Mapas.
            </p>
          </div>

          {/* Slider controls */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl border border-[#005049]/50 bg-[#161F30] text-[#1A56DB] hover:bg-[#1A56DB]/10 hover:border-[#1A56DB] transition-all duration-300 pointer-events-auto cursor-pointer outline-none"
              aria-label="Anterior explorador"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-[#005049]/50 bg-[#161F30] text-[#1A56DB] hover:bg-[#1A56DB]/10 hover:border-[#1A56DB] transition-all duration-300 pointer-events-auto cursor-pointer outline-none"
              aria-label="Siguiente explorador"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel View Container */}
        {loading ? (
          /* Sleek skeleton states while fetching database records */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className="bg-[#001721]/65 border border-[#005049]/20 rounded-3xl p-6 space-y-5 animate-pulse min-h-[220px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#005049]/20"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[#005049]/30 rounded w-2/3"></div>
                    <div className="h-3 bg-[#005049]/20 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-[#005049]/20 rounded w-full"></div>
                  <div className="h-3 bg-[#005049]/20 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Slider frame */
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Overflow wrapper */}
            <div className="overflow-hidden py-4 -my-4 px-2 -mx-2">
              <motion.div 
                className="flex gap-6 w-full"
                layout
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
              >
                {/* 
                  Instead of showing all items, we can display them with responsive column mapping.
                  To ensure smooth infinite translation transitions, we render three cards and filter depending on screen width.
                  However, standard CSS layout with flex and hidden utility classes works perfectly and maintains custom layout cleanliness:
                */}
                {visibleList.map((profile, i) => {
                  // Show item if index meets responsive class requirements
                  const isVisibleOnMobile = i === 0;
                  const isVisibleOnTablet = i < 2;
                  const isVisibleOnDesktop = i < 3;

                  return (
                    <div
                      key={`${profile.uid}-${i}`}
                      className={`min-h-[220px] bg-gradient-to-t from-[#00E676]/20 via-[#161F30] to-[#161F30] border border-[#005049]/30 hover:border-[#00E676]/50 hover:shadow-[0_0_20px_rgba(0,230,118,0.15)] rounded-3xl p-6 text-left flex flex-col justify-between transition-all duration-300 grow shrink-0 basis-full sm:basis-[calc(50%-12px)] md:basis-[calc(33.3333%-16px)] text-left select-none group hover:scale-[1.01] ${
                        isVisibleOnMobile 
                          ? 'flex' 
                          : isVisibleOnTablet 
                            ? 'hidden sm:flex' 
                            : 'hidden md:flex'
                      }`}
                    >
                      {/* Top row with profile pic, name, pseudonym */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-[#00E676]/20 rounded-full blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden p-[2px] z-10">
                              {/* Rotating border background with #1A56DB and #00E676 */}
                              <div className="absolute inset-[-50%] bg-gradient-to-r from-[#1A56DB] to-[#00E676] rounded-full animate-[spin_4s_linear_infinite]" />
                              <img
                                src={resolveAvatar(profile.avatarUrl)}
                                alt={profile.name}
                                className="w-full h-full rounded-full object-cover select-none pointer-events-none relative z-10 bg-[#161F30] p-[1.5px]"
                                onError={(e) => {
                                  // Double safeguard fallback
                                  (e.target as HTMLImageElement).src = avatarJoven1;
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-left">
                            <h4 className="font-headline font-black text-on-surface text-base group-hover:text-secondary transition-colors duration-300 leading-tight">
                              {profile.name}
                            </h4>
                            <span className="text-xs font-mono text-[#8c9f9e] font-semibold block">
                              {profile.title || 'Explorador'}
                            </span>
                          </div>
                        </div>

                        {/* Short biography with overflow protection */}
                        <div className="relative mt-2">
                          <p className="text-xs text-on-surface-variant/90 leading-relaxed font-sans line-clamp-3 text-left">
                            {profile.bio}
                          </p>
                        </div>
                      </div>

                      {/* Bottom decorative flag / subtitle tag */}
                      <div className="pt-4 mt-4 border-t border-[#005049]/15 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-[9px] font-black tracking-widest text-secondary font-mono uppercase">
                            {profile.pseudonym}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-on-surface-variant/40 font-mono tracking-wide uppercase">
                          Pasaporte Sincronizado
                        </span>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Slider track dots indicators */}
            <div className="flex items-center justify-center gap-1.5 pt-8">
              {profiles.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 outline-none cursor-pointer ${
                    currentIndex === idx 
                      ? 'w-6 bg-[#1A56DB]' 
                      : 'w-2 bg-[#005049]/40 hover:bg-[#1A56DB]/40'
                  }`}
                  aria-label={`Ir al explorador ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
