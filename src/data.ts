/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Location, UserProfile, LeaderboardEntry } from './types';
import stampAlhambra from './assets/images/01-Badge explorador principiante.png';
import stampCordoba from './assets/images/02-Badge explorador avanzado.png';
import stampSegovia from './assets/images/03-Badge Guia Local.png';
import stampSevilla from './assets/images/04-Badge Cazador de joyas.png';

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'alhambra',
    name: 'La Alhambra',
    city: 'Granada, España',
    category: 'Patrimonio Andalusí',
    latitude: 37.1773,
    longitude: -3.5898,
    points: 300,
    badgeId: 'alhambra_badge',
    badgeName: 'Explorador Principiante',
    badgeTitle: 'Explorador Nazarí',
    badgeIcon: 'castle',
    badgeImageUrl: stampAlhambra,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    review: [
      'La Alhambra es un impresionante complejo de palacios, jardines y fortalezas situado en Granada, España. Concebido originalmente como una zona militar, se convirtió en residencia real de la dinastía Nazarí durante la época andalusí, constituyendo una de las obras cumbre de la arquitectura islámica.',
      'Su exquisita filigrana en yeso, sus detallados techos de mocárabes y el icónico Patio de los Leones transportan al visitante a la cumbre poética del arte andalusí. Es un santuario de luz y agua donde los estanques reflejan la simetría perfecta de sus salas palaciegas.'
    ],
    isCheckedIn: true
  },
  {
    id: 'mezquita_cordoba',
    name: 'Mezquita de Córdoba',
    city: 'Córdoba, España',
    category: 'Arte Mezquita-Catedral',
    latitude: 37.8789,
    longitude: -4.7794,
    points: 300,
    badgeId: 'mezquita_badge',
    badgeName: 'Mezquita de Córdoba',
    badgeTitle: 'Explorador Omeya',
    badgeIcon: 'mosque',
    badgeImageUrl: stampCordoba,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    review: [
      'La Mezquita-Catedral de Córdoba es un monumento único que amalgama influencias islámicas y cristianas en una estructura sin precedentes. Famosa por su inmenso bosque de más de 850 columnas de mármol y jaspe coronadas por arcos dobles de herradura bicolores.',
      'En el corazón de este antiguo templo andalusí se erigió posteriormente una majestuosa catedral gótico-renacentista. El Mihrab, revestido con hermosos mosaicos dorados obsequiados por el imperio bizantino, brilla con una suntuosidad espiritual incomparable.'
    ],
    isCheckedIn: true
  },
  {
    id: 'acueducto_segovia',
    name: 'Acueducto Segovia',
    city: 'Segovia, España',
    category: 'Ingeniería Romana',
    latitude: 40.9478,
    longitude: -4.1184,
    points: 300,
    badgeId: 'acueducto_badge',
    badgeName: 'Acueducto Segovia',
    badgeTitle: 'Explorador Flavio',
    badgeIcon: 'aqueduct',
    badgeImageUrl: stampSegovia,
    imageUrl: 'https://images.unsplash.com/photo-1518638150341-f706e86654de?auto=format&fit=crop&w=800&q=80',
    review: [
      'El Acueducto de Segovia es una de las obras de ingeniería civil romana más soberbias y mejor conservadas del planeta. Construido a finales del siglo I d.C., transportaba agua desde la sierra de Guadarrama hasta la ciudad de Segovia sin una sola gota de mortero.',
      'Sus imponentes dos pisos de arcos entrelazados se sostienen firmemente gracias a un equilibrio perfecto de fuerzas físicas y bloques tallados de granito. Destaca como el gran símbolo identitario de la ciudad de Segovia dominando la plaza del Azoguejo.'
    ],
    isCheckedIn: true
  },
  {
    id: 'alcazar_sevilla',
    name: 'Alcázar de Sevilla',
    city: 'Sevilla, España',
    category: 'Fortaleza Mudéjar',
    latitude: 37.3831,
    longitude: -5.9902,
    points: 400,
    badgeId: 'alcazar_badge',
    badgeName: 'Alcázar de Sevilla',
    badgeTitle: 'Explorador de Reinos',
    badgeIcon: 'fortress',
    badgeImageUrl: stampSevilla,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    review: [
      'El Real Alcázar de Sevilla es el palacio real activo más antiguo de Europa. Sus edificaciones constituyen una fastuosa muestra del mestizaje cultural mudéjar, combinando arcos islámicos con patios renacentistas y salones decorados en tiempos góticos.',
      'Sus deslumbrantes jardines repletos de naranjos, laberintos de setos y fuentes cantarinas han sido escenario de múltiples rodajes cinematográficos internacionales. Subir este peldaño reconoce el paso del caminante por los patios reales más opulentos de Andalucía.'
    ],
    isCheckedIn: false
  },
  {
    id: 'sagrada_familia',
    name: 'Sagrada Familia',
    city: 'Barcelona, España',
    category: 'Arquitectura Catalana',
    latitude: 41.4036,
    longitude: 2.1744,
    points: 500,
    badgeId: 'sagrada_badge',
    badgeName: 'Sagrada Familia',
    badgeTitle: 'Explorador Modernista',
    badgeIcon: 'cathedral',
    imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80',
    review: [
      'La Basílica y Templo Expiatorio de la Sagrada Familia de Antoni Gaudí es la obra cumbre del modernismo catalán. Una estructura colosal que busca imitar las formas orgánicas de la naturaleza, convirtiendo las columnas interiores en troncos de un bosque místico pétreo.',
      'El caleidoscopio de luz que se filtra por sus vitrales de vivos colores baña el espacio interior de una atmósfera onírica y celestial. Cada una de sus fachadas talladas y torres ascendentes narra detalladamente pasajes teológicos de un simbolismo asombroso.'
    ],
    isCheckedIn: false
  },
  {
    id: 'castillo_olite',
    name: 'Castillo de Olite',
    city: 'Navarra, España',
    category: 'Palacio de Reyes de Navarra',
    latitude: 42.4841,
    longitude: -1.6483,
    points: 500,
    badgeId: 'olite_badge',
    badgeName: 'Castillo de Olite',
    badgeTitle: 'Explorador de Navarra',
    badgeIcon: 'tower',
    imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800&q=80',
    review: [
      'El Palacio Real de Olite es una joya imponente de la arquitectura gótica ubicada en Navarra, España. Construido entre los siglos XIV y XV como una de las sedes de la corte del Reino de Navarra, destaca por su fisonomía caprichosa repleta de torres, jardines colgantes y miradores de película.',
      'Pasear por sus galerías reales y subir sus empinadas escaleras de caracol ofrece un retorno directo al imaginario de los caballeros medievales. Su delicado relieve sobre las llanuras circundantes lo convierte en uno de los castillos con silueta más bellas y fantásticas del mundo.'
    ],
    isCheckedIn: false
  }
];

export const INITIAL_USER: UserProfile = {
  name: 'Felix "The Voyager"',
  title: 'Explorador Supremo',
  email: 'felix.voyager@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  level: 12,
  xp: 3550, // Let's say XP progress: 3550/6000 XP (with 2450 XP remaining to reach Level 13!)
  xpToNextLevel: 6000,
  joinedDate: 'Miembro desde: Ene 2024',
  linkedWallet: 'felix.voyager@solana.inv' // Invisible linked wallet linked to email
};

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'Sofia "Mountain Queen"', title: 'Custodio del Olimpo', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', points: 1450, badgesUnlocked: 6 },
  { rank: 2, name: 'Mateo "Globetrotter"', title: 'Embajador del Desierto', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', points: 1280, badgesUnlocked: 6 },
  { rank: 3, name: 'Camila "Eco Scout"', title: 'Sabio Forestal', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', points: 1050, badgesUnlocked: 5 },
  { rank: 4, name: 'Felix "The Voyager"', title: 'Explorador Supremo', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', points: 570, badgesUnlocked: 4, isCurrentUser: true },
  { rank: 5, name: 'Diego "Trailblazer"', title: 'Cazador Marino', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', points: 450, badgesUnlocked: 3 },
  { rank: 6, name: 'Elena "Arqueo Fan"', title: 'Iniciado del Templo', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', points: 300, badgesUnlocked: 2 }
];
