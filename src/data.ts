/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Location, UserProfile, LeaderboardEntry } from './types';
import stampAlhambra from './assets/images/01A_explorador_principiante.png';
import stampCordoba from './assets/images/02B_explorador_intermedio.png';
import stampSegovia from './assets/images/03C_explorador_avanzado.png';
import stampSevilla from './assets/images/04D_Cazador_de_rutas.png';
import stampSagrada from './assets/images/05E_Guia_Local.png';
import stampOlite from './assets/images/06F_guia_local_experto.png';
import mapaCaracasHero from './assets/images/Mapa Caracas.png';
import mapaMuseos from './assets/images/Mapa Museos.png';
import prontoImg from './assets/images/pronto.png';
import { 
  AVATAR_FELIX, 
  AVATAR_SOFIA, 
  AVATAR_MATEO, 
  AVATAR_CAMILA, 
  AVATAR_DIEGO, 
  AVATAR_ELENA 
} from './utils/avatars';

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'alhambra',
    name: 'Mapa casco histórico de Caracas vol.1 ver. 1.0',
    city: 'Caracas, Venezuela',
    category: 'Monumento Histórico',
    latitude: 10.506085,
    longitude: -66.914631,
    points: 4000,
    badgeId: 'alhambra_badge',
    badgeName: 'Explorador Principiante',
    badgeTitle: 'Explorador Bolivariano',
    badgeIcon: 'castle',
    badgeImageUrl: stampAlhambra,
    imageUrl: mapaCaracasHero,
    review: [
      'Mapa casco histórico de Caracas vol.1 ver. 1.0'
    ],
    isCheckedIn: false,
    places: [
      {
        id: 'alh_leones',
        name: 'Estatua ecuestre del Libertador Simón Bolívar',
        category: 'Monumento Central',
        latitude: 10.506085,
        longitude: -66.914631,
        points: 500,
        isCheckedIn: false,
        description: 'La célebre escultura tallada en bronce sobre un pedestal de granito, inaugurada en 1874 en el corazón de la Plaza Bolívar.'
      },
      {
        id: 'alh_comares',
        name: 'La Catedral de Caracas',
        category: 'Templo Metropolitano',
        latitude: 10.5061,
        longitude: -66.9139,
        points: 500,
        isCheckedIn: false,
        description: 'Catedral del siglo XVII que ostenta una hermosa fachada neobarroca y alberga restos de los padres del Libertador.'
      },
      {
        id: 'alh_generalife',
        name: 'Casa Natal del Libertador',
        category: 'Residencia Colonial',
        latitude: 10.5065,
        longitude: -66.9149,
        points: 500,
        isCheckedIn: false,
        description: 'Casa señorial del siglo XVIII donde nació Simón Bolívar, hoy preservada como un museo que guarda reliquias invaluables.'
      },
      {
        id: 'alh_vela',
        name: 'El Palacio Federal Legislativo',
        category: 'Sede del Parlamento',
        latitude: 10.5057,
        longitude: -66.9149,
        points: 500,
        isCheckedIn: false,
        description: 'Singular joya neoclásica construida por Antonio Guzmán Blanco, célebre por su majestuosa Cúpula Dorada y el Salón Elíptico.'
      },
      {
        id: 'alh_carlosv',
        name: 'El Teatro Municipal de Caracas',
        category: 'Patrimonio Teatral',
        latitude: 10.5055,
        longitude: -66.9155,
        points: 500,
        isCheckedIn: false,
        description: 'Uno de los templos de la ópera y el drama de mayor solera en Sudamérica, inaugurado solemnemente en el año 1881.'
      },
      {
        id: 'alh_hermanas',
        name: "La plaza O'Leary",
        category: 'Espacio Cívico',
        latitude: 10.5057,
        longitude: -66.9139,
        points: 500,
        isCheckedIn: false,
        description: "Eje urbano y monumental diseñado por Carlos Raúl Villanueva en la reurbanización de El Silencio, adornado por las fuentes del artista Francisco Narváez."
      },
      {
        id: 'alh_justicia',
        name: 'El Arco de la Federación',
        category: 'Monumento Conmemorativo',
        latitude: 10.5063,
        longitude: -66.9143,
        points: 500,
        isCheckedIn: false,
        description: 'Imponente arco de triunfo neoclásico erigido en El Calvario para ensalzar la victoria de la Guerra Federal venezolana.'
      },
      {
        id: 'alh_baños',
        name: 'La Ceiba de San Francisco',
        category: 'Patrimonio Natural',
        latitude: 10.5060,
        longitude: -66.9145,
        points: 500,
        isCheckedIn: false,
        description: 'Árbol sagrado centenario de la ciudad de Caracas, testigo silente de innumerables hitos políticos y mercantiles frente a la Iglesia de San Francisco.'
      }
    ]
  },
  {
    id: 'mezquita_cordoba',
    name: 'Mapa Circuito Museos de Caracas',
    city: 'Caracas, Venezuela',
    category: 'Arte Mezquita-Catedral',
    latitude: 37.8789,
    longitude: -4.7794,
    points: 4000,
    badgeId: 'mezquita_badge',
    badgeName: 'Explorador Intermedio',
    badgeTitle: 'Explorador Omeya',
    badgeIcon: 'mosque',
    badgeImageUrl: stampCordoba,
    imageUrl: mapaMuseos,
    review: [
      'Mapa Circuito Museos de Caracas'
    ],
    isCheckedIn: false,
    places: [
      {
        id: 'mez_naranjos',
        name: 'Museo de Ciencias',
        category: 'Atrio Exterior',
        latitude: 37.8794,
        longitude: -4.7794,
        points: 500,
        isCheckedIn: false,
        description: 'El frondoso patio de naranjos y palmeras que servía de antesala y lavatorio ritual de la gran mezquita.'
      },
      {
        id: 'mez_mihrab',
        name: 'Museo Bellas Artes',
        category: 'Santuario Sagrado',
        latitude: 37.8784,
        longitude: -4.7792,
        points: 500,
        isCheckedIn: false,
        description: 'El nicho de oración orientado al sur, decorado con fastuosos mosaicos de oro y azulejos bizantinos.'
      },
      {
        id: 'mez_columnas',
        name: 'Museo de Arte Contemporáneo',
        category: 'Sala de Oración',
        latitude: 37.8789,
        longitude: -4.7794,
        points: 500,
        isCheckedIn: false,
        description: 'Un laberinto hipóstilo infinito con arcos de herradura bicolores en ladrillo rojo y piedra caliza blanca.'
      },
      {
        id: 'mez_alminar',
        name: 'Galería de Arte Nacional (GAN)',
        category: 'Campanario',
        latitude: 37.8797,
        longitude: -4.7795,
        points: 500,
        isCheckedIn: false,
        description: 'El antiguo alminar de Abderramán III, revestido posteriormente con una estructura de campanario barroco.'
      },
      {
        id: 'mez_villaviciosa',
        name: 'Museo del Niño',
        category: 'Conversión Cristiana',
        latitude: 37.8790,
        longitude: -4.7796,
        points: 500,
        isCheckedIn: false,
        description: 'La primera capilla mayor construida tras la conquista cristiana, encajada de forma hermosa bajo arcos polilobulados.'
      },
      {
        id: 'mez_crucero',
        name: 'Museo Cruz Diez',
        category: 'Basílica Mayor',
        latitude: 37.8788,
        longitude: -4.7793,
        points: 500,
        isCheckedIn: false,
        description: 'La imponente catedral plateresca y renacentista erigida justo en mitad de las naves islámicas durante el siglo XVI.'
      },
      {
        id: 'mez_almodovar',
        name: 'Museo de Arquitectura',
        category: 'Acceso Amurallado',
        latitude: 37.8805,
        longitude: -4.7820,
        points: 500,
        isCheckedIn: false,
        description: 'Una imponente puerta de origen medieval que unía la mezquita con el antiguo barrio de la judería.'
      },
      {
        id: 'mez_tesoro',
        name: 'Museo de Caracas',
        category: 'Bóveda Histórica',
        latitude: 37.8785,
        longitude: -4.7798,
        points: 500,
        isCheckedIn: false,
        description: 'Exhibición de arte sacro donde destaca la Custodia Procesional del Corpus Christi, labrada en plata dorada.'
      }
    ]
  },
  {
    id: 'acueducto_segovia',
    name: 'Mapa casco histórico de Caracas vol.3 ver. 3.0',
    city: 'Caracas, Venezuela',
    category: 'Ingeniería Romana',
    latitude: 40.9478,
    longitude: -4.1184,
    points: 4000,
    badgeId: 'acueducto_badge',
    badgeName: 'Explorador Avanzado',
    badgeTitle: 'Explorador Flavio',
    badgeIcon: 'aqueduct',
    badgeImageUrl: stampSegovia,
    imageUrl: prontoImg,
    review: [
      'Mapa casco histórico de Caracas vol.3 ver. 3.0'
    ],
    isCheckedIn: false,
    places: [
      {
        id: 'acu_azoguejo',
        name: 'Arcos Altos del Azoguejo',
        category: 'Ingeniería Monumental',
        latitude: 40.9478,
        longitude: -4.1184,
        points: 500,
        isCheckedIn: false,
        description: 'La sección más icónica del acueducto, donde los arcos dobles alcanzan casi 30 metros de altura sobre la plaza civil.'
      },
      {
        id: 'acu_canal',
        name: 'Canal de Conducción',
        category: 'Sifón de Agua',
        latitude: 40.9480,
        longitude: -4.1170,
        points: 500,
        isCheckedIn: false,
        description: 'La canaleta superior de piedra por donde discurría el agua desde el río Frío hasta la ciudad alta.'
      },
      {
        id: 'acu_desarenador',
        name: 'Desarenador de San Gabriel',
        category: 'Filtro Romano',
        latitude: 40.9472,
        longitude: -4.1140,
        points: 500,
        isCheckedIn: false,
        description: 'La primera cisterna de decantación romana que servía para limpiar el agua filtrando la arena y los sedimentos.'
      },
      {
        id: 'acu_hornacina',
        name: 'Hornacina de la Virgen',
        category: 'Santuario Central',
        latitude: 40.9477,
        longitude: -4.1182,
        points: 500,
        isCheckedIn: false,
        description: 'El nicho central sobre los arcos del acueducto que alberga la estatua de la Virgen de la Fuencisla.'
      },
      {
        id: 'acu_torre',
        name: 'Torre del Agua',
        category: 'Origen del Canal',
        latitude: 40.9460,
        longitude: -4.1080,
        points: 500,
        isCheckedIn: false,
        description: 'La torre de recogida de aguas donde se iniciaba la canalización a ras de suelo en las afueras de Segovia.'
      },
      {
        id: 'acu_postigo',
        name: 'Postigo del Consuelo',
        category: 'Acceso Amurallado',
        latitude: 40.9482,
        longitude: -4.1188,
        points: 500,
        isCheckedIn: false,
        description: 'Las escaleras históricas de piedra que suben junto al acueducto hacia la muralla medieval del alcázar.'
      },
      {
        id: 'acu_mirador',
        name: 'Mirador de los Arcos',
        category: 'Punto Fotográfico',
        latitude: 40.9485,
        longitude: -4.1180,
        points: 500,
        isCheckedIn: false,
        description: 'Gran mirador panorámico que permite apreciar la asombrosa perspectiva de fuga y alineamiento de las piedras romanas.'
      },
      {
        id: 'acu_artilleria',
        name: 'Plaza de la Artillería',
        category: 'Entorno Urbano',
        latitude: 40.9474,
        longitude: -4.1190,
        points: 500,
        isCheckedIn: false,
        description: 'Eje donde se cruzan las miradas turísticas y donde descansan las bases de los pilares de piedra sin argamasa.'
      }
    ]
  },
  {
    id: 'alcazar_sevilla',
    name: 'Mapa casco histórico de Caracas vol.4 ver. 4.0',
    city: 'Caracas, Venezuela',
    category: 'Fortaleza Mudéjar',
    latitude: 37.3831,
    longitude: -5.9902,
    points: 4000,
    badgeId: 'alcazar_badge',
    badgeName: 'Cazador de Rutas',
    badgeTitle: 'Explorador de Reinos',
    badgeIcon: 'fortress',
    badgeImageUrl: stampSevilla,
    imageUrl: prontoImg,
    review: [
      'Mapa casco histórico de Caracas vol.4 ver. 4.0'
    ],
    isCheckedIn: false,
    places: [
      {
        id: 'alc_doncellas',
        name: 'Patio de las Doncellas',
        category: 'Palacio Mudéjar',
        latitude: 37.3831,
        longitude: -5.9902,
        points: 500,
        isCheckedIn: false,
        description: 'El hermosísimo patio rectangular con un estanque longitudinal, rodeado de intrincados arcos lobulados.'
      },
      {
        id: 'alc_embajadores',
        name: 'Salón de Embajadores',
        category: 'Trono Real',
        latitude: 37.3833,
        longitude: -5.9904,
        points: 500,
        isCheckedIn: false,
        description: 'La suntuosa sala del trono coronada por una impresionante cúpula hemisférica de madera dorada tallada a mano.'
      },
      {
        id: 'alc_baños',
        name: 'Baños de Doña María de Padilla',
        category: 'Cámara Subterránea',
        latitude: 37.3828,
        longitude: -5.9900,
        points: 500,
        isCheckedIn: false,
        description: 'Un aljibe abovedado gótico situado bajo el patio del crucero, famoso por su misterioso ambiente reflejado en el agua.'
      },
      {
        id: 'alc_muñecas',
        name: 'Patio de las Muñecas',
        category: 'Cámara Privada',
        latitude: 37.3830,
        longitude: -5.9905,
        points: 500,
        isCheckedIn: false,
        description: 'Un patio de columnas íntimo de uso residencial, que oculta pequeñas cabezas talladas en sus capiteles ornamentales.'
      },
      {
        id: 'alc_mercurio',
        name: 'Jardín de Mercurio',
        category: 'Estanque Ornamental',
        latitude: 37.3835,
        longitude: -5.9895,
        points: 500,
        isCheckedIn: false,
        description: 'Un gran estanque de riego presidido por la estatua de bronce del dios Mercurio y delimitado por la Galería del Grutesco.'
      },
      {
        id: 'alc_templete',
        name: 'Cenador de Carlos V',
        category: 'Pabellón de Placer',
        latitude: 37.3825,
        longitude: -5.9892,
        points: 500,
        isCheckedIn: false,
        description: 'Un templete mudéjar y renacentista recubierto de preciosos azulejos donde el emperador disfrutaba de las brisas veraniegas.'
      },
      {
        id: 'alc_grutesco',
        name: 'Galería del Grutesco',
        category: 'Paseo de Muralla',
        latitude: 37.3838,
        longitude: -5.9890,
        points: 500,
        isCheckedIn: false,
        description: 'Un muro de piedra rústica tallado que imita formaciones rocosas naturales y ofrece vistas sobre los frondosos jardines.'
      },
      {
        id: 'alc_tapices',
        name: 'Sala de los Tapices',
        category: 'Galería de Arte',
        latitude: 37.3822,
        longitude: -5.9908,
        points: 500,
        isCheckedIn: false,
        description: 'Gran salón neoclásico que resguarda una valiosa colección de tapices flamencos que relatan la expedición a Túnez de Carlos V.'
      }
    ]
  },
  {
    id: 'sagrada_familia',
    name: 'Mapa casco histórico de Caracas vol.5 ver. 5.0',
    city: 'Caracas, Venezuela',
    category: 'Arquitectura Catalana',
    latitude: 41.4036,
    longitude: 2.1744,
    points: 4000,
    badgeId: 'sagrada_badge',
    badgeName: 'Guía Local',
    badgeTitle: 'Explorador Modernista',
    badgeIcon: 'cathedral',
    badgeImageUrl: stampSagrada,
    imageUrl: prontoImg,
    review: [
      'Mapa casco histórico de Caracas vol.5 ver. 5.0'
    ],
    isCheckedIn: false,
    places: [
      {
        id: 'sag_nacimiento',
        name: 'Fachada del Nacimiento',
        category: 'Portal Escultórico',
        latitude: 41.4036,
        longitude: 2.1744,
        points: 500,
        isCheckedIn: false,
        description: 'La única fachada iniciada directamente por Gaudí en vida, caracterizada por un estallido de esculturas inspiradas en la flora y fauna.'
      },
      {
        id: 'sag_pasion',
        name: 'Fachada de la Pasión',
        category: 'Portal Expresionista',
        latitude: 41.4034,
        longitude: 2.1741,
        points: 500,
        isCheckedIn: false,
        description: 'Diseñada con líneas angulosas y pilares descarnados de piedra gris para representar de forma dramática el sufrimiento del Vía Crucis.'
      },
      {
        id: 'sag_columnas',
        name: 'Nave de los Bosques Pétreos',
        category: 'Santuario de Columnas',
        latitude: 41.4036,
        longitude: 2.1743,
        points: 500,
        isCheckedIn: false,
        description: 'El espacio interior dominado por gigantescas columnas ramificadas que soportan las bóvedas celestes hiperboloides.'
      },
      {
        id: 'sag_cripta',
        name: 'Cripta de Antoni Gaudí',
        category: 'Mausoleo de la Basílica',
        latitude: 41.4038,
        longitude: 2.1745,
        points: 500,
        isCheckedIn: false,
        description: 'La capilla subterránea donde se celebran misas diarias y donde reposan los restos mortales del emblemático arquitecto catalán.'
      },
      {
        id: 'sag_estrella',
        name: 'Torre de la Virgen María',
        category: 'Torres Celestiales',
        latitude: 41.4035,
        longitude: 2.1742,
        points: 500,
        isCheckedIn: false,
        description: 'Coronada por una magnífica estrella de cristal de doce puntas que brilla en el cielo iluminando la noche barcelonesa.'
      },
      {
        id: 'sag_abside',
        name: 'Ábside de la Sagrada Familia',
        category: 'Gótico Orgánico',
        latitude: 41.4039,
        longitude: 2.1746,
        points: 500,
        isCheckedIn: false,
        description: 'El coro semicircular custodiado por siete capillas interiores y rematado con gárgolas que representan ranas, reptiles y caracoles.'
      },
      {
        id: 'sag_museo',
        name: 'Museo Gaudí del Templo',
        category: 'Centro Interpretativo',
        latitude: 41.4033,
        longitude: 2.1740,
        points: 500,
        isCheckedIn: false,
        description: 'Espacio subterráneo que conserva maquetas de yeso originales, dibujos geométricos y planos colgantes con pesas de Gaudí.'
      },
      {
        id: 'sag_rosario',
        name: 'Portal del Rosario',
        category: 'Capilla de Oración',
        latitude: 41.4037,
        longitude: 2.1747,
        points: 500,
        isCheckedIn: false,
        description: 'Un vestíbulo ricamente esculpido con motivos de rosas trepadoras y encajes tallados que conduce al claustro perimetral.'
      }
    ]
  },
  {
    id: 'castillo_olite',
    name: 'Mapa casco histórico de Caracas vol.6 ver. 6.0',
    city: 'Caracas, Venezuela',
    category: 'Palacio de Reyes de Navarra',
    latitude: 42.4841,
    longitude: -1.6483,
    points: 4000,
    badgeId: 'olite_badge',
    badgeName: 'Guía Local Experto',
    badgeTitle: 'Explorador de Navarra',
    badgeIcon: 'tower',
    badgeImageUrl: stampOlite,
    imageUrl: prontoImg,
    review: [
      'Mapa casco histórico de Caracas vol.6 ver. 6.0'
    ],
    isCheckedIn: false,
    places: [
      {
        id: 'oli_homenaje',
        name: 'Torre del Homenaje',
        category: 'Torre Militar',
        latitude: 42.4841,
        longitude: -1.6483,
        points: 500,
        isCheckedIn: false,
        description: 'La gran torre defensiva central desde donde se custodiaba el palacio y se desplegaban los estandartes de los reyes navarros.'
      },
      {
        id: 'oli_reina',
        name: 'Galería de la Reina',
        category: 'Jardín Colgante',
        latitude: 42.4843,
        longitude: -1.6480,
        points: 500,
        isCheckedIn: false,
        description: 'Un elegante corredor medieval gótico con arquerías ojivales de piedra caliza calada que daba paso a los jardines reales suspendidos.'
      },
      {
        id: 'oli_naranjos',
        name: 'Patio de los Naranjos',
        category: 'Atrio de Recepción',
        latitude: 42.4839,
        longitude: -1.6485,
        points: 500,
        isCheckedIn: false,
        description: 'El patio ajardinado donde los nobles y cortesanos se reunían bajo el aroma cítrico de los naranjos de Navarra.'
      },
      {
        id: 'oli_trescoronas',
        name: 'Torre de las Tres Coronas',
        category: 'Capricho Arquitectónico',
        latitude: 42.4842,
        longitude: -1.6481,
        points: 500,
        isCheckedIn: false,
        description: 'Una silueta inconfundible con tres nidos superpuestos, concebida para pasatiempo y mirador ornamental de la realeza.'
      },
      {
        id: 'oli_rey',
        name: 'Mirador del Rey',
        category: 'Sala de Audiencias',
        latitude: 42.4845,
        longitude: -1.6478,
        points: 500,
        isCheckedIn: false,
        description: 'Un ventanal gótico calado que se asoma a las llanuras agrícolas históricas del reino y a los viñedos locales de Olite.'
      },
      {
        id: 'oli_puente',
        name: 'Fosa y Puente Levadizo',
        category: 'Sistema Defensivo',
        latitude: 42.4836,
        longitude: -1.6486,
        points: 500,
        isCheckedIn: false,
        description: 'La fosa perimetral de piedra que dividía la zona noble del poblamiento exterior para brindar seguridad a la realeza.'
      },
      {
        id: 'oli_bodega',
        name: 'Bodega Real de los Monjes',
        category: 'Sótano de Almacén',
        latitude: 42.4840,
        longitude: -1.6488,
        points: 500,
        isCheckedIn: false,
        description: 'Cámaras subterráneas de piedra fresca de arcos apuntados donde se añejaban los mejores caldos navarros para banquetes.'
      },
      {
        id: 'oli_arcos',
        name: 'Sala de los Arcos',
        category: 'Estructura de Descarga',
        latitude: 42.4844,
        longitude: -1.6484,
        points: 500,
        isCheckedIn: false,
        description: 'Una imponente sala subterránea de arcos diafragma diseñada para sostener el enorme peso del palacio gótico superior.'
      }
    ]
  }
];

export const INITIAL_USER: UserProfile = {
  name: 'Felix "The Voyager"',
  title: 'Explorador Supremo',
  email: 'felix.voyager@gmail.com',
  avatarUrl: AVATAR_FELIX,
  level: 12,
  xp: 3550, // Let's say XP progress: 3550/6000 XP (with 2450 XP remaining to reach Level 13!)
  xpToNextLevel: 6000,
  joinedDate: 'Miembro desde: Ene 2024',
  linkedWallet: 'felix.voyager@solana.inv' // Invisible linked wallet linked to email
};

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'Sofia "Mountain Queen"', title: 'Custodio del Olimpo', avatarUrl: AVATAR_SOFIA, points: 1450, badgesUnlocked: 6 },
  { rank: 2, name: 'Mateo "Globetrotter"', title: 'Embajador del Desierto', avatarUrl: AVATAR_MATEO, points: 1280, badgesUnlocked: 6 },
  { rank: 3, name: 'Camila "Eco Scout"', title: 'Sabio Forestal', avatarUrl: AVATAR_CAMILA, points: 1050, badgesUnlocked: 5 },
  { rank: 4, name: 'Felix "The Voyager"', title: 'Explorador Supremo', avatarUrl: AVATAR_FELIX, points: 570, badgesUnlocked: 4, isCurrentUser: true },
  { rank: 5, name: 'Diego "Trailblazer"', title: 'Cazador Marino', avatarUrl: AVATAR_DIEGO, points: 450, badgesUnlocked: 3 },
  { rank: 6, name: 'Elena "Arqueo Fan"', title: 'Iniciado del Templo', avatarUrl: AVATAR_ELENA, points: 300, badgesUnlocked: 2 }
];
