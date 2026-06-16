/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location, SubLocation, UserProfile } from './types';
import { INITIAL_LOCATIONS } from './data';

export type Language = 'es' | 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateLocation: (loc: Location) => Location;
  translateUser: (user: UserProfile) => UserProfile;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  es: {
    // Top Navbar and Landing Header
    'lng_esp': 'ESPAÑOL',
    'lng_ing': 'INGLES',
    'ingresar_gmail': 'Ingresar con Gmail',
    'entrar_como': 'Entrar como {name}',
    'salir_btn': 'Salir',
    'cerrar_sesion_title': 'Cerrar sesión e ir a Inicio',

    // Landing View Hero
    'descubre_mundo': 'Descubre tu Ciudad,',
    'colecciona_historia': 'Colecciona Historia',
    'hero_desc': 'Transforma tus viajes en una aventura digital. Visita monumentos, completa tu mapa y desbloquea activos digitales únicos.',
    'saber_mas': 'Saber más',
    'iniciar_como_invitado': 'Iniciar como Invitado',
    'empieza_ahora_gratis': 'Empieza Ahora Gratis',
    'listo_comenzar_coleccion': 'Sobre el Proyecto',

    // Landing How It Works
    'como_funciona': '¿Cómo funciona?',
    'physical_map_title': 'Adquiere tu Mapa Físico',
    'physical_map_desc': 'Empieza tu viaje con nuestros mapas de alta calidad. Contiene los sitios históricos y códigos QR necesarios para poder obtener más información en la página web.',
    'visit_sites_title': 'Visita los Sitios',
    'visit_sites_desc': 'Explora monumentos históricos y maravillas naturales. Cada ubicación es un nuevo hito en tu carrera como Explorador Digital.',
    'gps_checkin_title': 'GPS Check-in',
    'gps_checkin_desc': 'Nuestra tecnología de geolocalización valida tu presencia. Solo los verdaderos viajeros obtienen su insignia.',
    'realtime_validation': 'VALIDACIÓN EN TIEMPO REAL',
    'earn_cnft_title': 'Gana Postales Digitales y cNFTs Exclusivos',
    'earn_cnft_desc': 'Por cada ruta desbloqueada podrás obtener una POSTAL DIGITAL reclamada con tu Wallet en la blockchain como firma criptográfica descentralizada. (Solana Proof-Stamping). Cada ruta desbloqueada obtendrás un (Compressed NFT), único que vive en la blockchain. Son coleccionables, transferibles y demuestran tu historial viajero.',

    // Landing Footer
    'footer_manifesto': 'Digitalizando el patrimonio cultural a través de experiencias gamificadas y tecnología blockchain.',
    'comunidad': 'COMUNIDAD',
    'legal': 'LEGAL',
    'soporte': 'SOPORTE',
    'terminos': 'Términos de Servicio',
    'privacidad': 'Privacidad',
    'cookies_policy': 'Política de Cookies',
    'centro_ayuda': 'Centro de Ayuda',
    'contacto': 'Contacto',
    'derechos_reservados': '© 2026 BITACORA DIGITAL | PINTA MAPAS. Todos los derechos reservados.',

    // Sidebar & Navigation
    'dashboard': 'Dashboard',
    'exploration': 'Rutas',
    'my_stamps': 'Mis Logros',
    'leaderboard': 'Ranking',
    'settings': 'Configuración',
    'postales_digitales': 'Postales',
    'status': 'STATUS',
    'explorer_level': 'Nivel del Explorador {level}',
    'xp_to_level_up': '{xp} XP to Level Up',
    'unlock_new_region': 'Unlock New Region',
    'support': 'Support',
    'cerrar_sesion': 'Cerrar Sesión',
    'ruta_prefix': 'Ruta',

    // Dashboard View - Header & Stats
    'tu_pasaporte': 'Tu Pasaporte de Aventuras',
    'dashboard_welcome': '¡Bienvenido, {name}! Continúa explorando los secretos históricos para subir de nivel y obtener medallas.',
    'estrellas_ganadas': 'Estampas Ganadas',
    'total_rutas': 'Progreso de Rutas',
    'estadisticas_viaje': 'Estadísticas del Viaje',
    'regiones_visitadas_label': 'Regiones Visitadas',
    'momentos_capturados_label': 'Momentos Capturados',
    'logros_compartidos_label': 'Logros Compartidos',
    'ver_detalles': 'Ver detalles',
    'buscar_monumentos': 'Buscar mapas históricos...',

    // Dashboard View - Recent Badges & cNFTs
    'rutas_recientes_insignias': 'Insignias Desbloqueadas de Rutas',
    'recompensas_blockchain': 'Recompensas Blockchain',
    'solana_cnfts_desc': 'Sincroniza tus logros con la red Solana y hazlos eternos.',
    'ver_todas_estampas': 'Ver estampas de tu colección',
    'completado': 'Completado',
    'puntos_pts': 'puntos',
    'puntos_uppercase': 'PUNTOS',
    'comenzar_exploracion': 'Comenzar Exploración',
    'explorar_ruta': 'Explorar ruta',
    'insignia_reclamada': 'Insignia Reclamada',
    'reclama_cnft': 'Reclamar insignia como cNFT de Solana',
    'reclamando_tx': 'Procesando en Solana Mainnet...',
    'transaccion_exitosa': 'Transacción exitosa',
    'firma_transaccion': 'Firma la transacción en tu wallet',
    'ver_en_solscan': 'Ver en Solscan',
    'cerrar_popup': 'Cerrar',

    // Exploration View
    'guia_ruta_interactive': 'Ficha Interactiva de la Ruta',
    'mapa_caracas_subtitle': 'Guía visual e histórica para check-ins GPS',
    'instrucciones_checking': 'Instrucciones: Para registrar tu visita, haz clic en cada punto del mapa o usa el botón "GPS Check-In". Debes estar en las coordenadas correspondientes del Casco Histórico.',
    'marcador_seleccionado': 'Marcador Seleccionado',
    'puntos_ruta': 'Puntos de Interés de la Ruta',
    'unloaded_route_desc': 'Seleccione un punto de interés en el mapa interactivo de la izquierda para ver su reseña histórica y realizar el check-in.',
    'esta_bloqueado_checkin': 'Aún no has visitado este monumento histórico.',
    'hacer_checkin_gps': 'Simular GPS Check-In',
    'esta_visitado_checkin': '¡Visita Completada con Éxito!',
    'puntos_ganados': 'Has ganado {points} puntos por verificar este hito.',
    'escribir_resena': 'Escribir Reseña Colectiva',
    'compartir_comunidad': 'Compartir con la Comunidad',
    'tomar_ selfi': 'Tomar Foto del Recuerdo',
    'visitar_ruta_stamps': 'Ver mi colección de medallas de esta ruta',
    'eliminar_progreso_sitio': 'Reiniciar Check-in (Mantenimiento)',
    'monumento_historico': 'Monumento Histórico',

    // Exploration Photo & Alerts
    'selfie_tomada': '¡Foto del recuerdo guardada!',
    'selfie_subt': 'Foto registrada en la bitácora del explorador.',
    'campana_checkin': 'Nueva exploración aprobada',
    'campana_checkin_body': '¡Check-in geolocalizado en {name} validado con éxito!',
    'alerta_region_nueva': '¡Nueva Región Desbloqueada!',
    'alerta_region_body': 'Has expandido tu mapa de exploración a un nuevo cuadrante histórico. Abre la lista de rutas para ver las nuevas ubicaciones.',
    'desbloquear_insignia_notif': '¡Nueva Insignia Recibida!',
    'desbloquear_insignia_body': 'Has alcanzado el rango de {badgeName} en esta ruta.',

    // Stamps View
    'catalogo_sellos': 'Colección Personal de Medallas y Estampillas',
    'mis_estampillas_filosofia': 'Cada estampilla simboliza un hito histórico certificado. Las insignias se otorgan progresivamente al completar check-ins en la ruta.',
    'filtros': 'Filtros',
    'todos_stamps': 'Todos',
    'desbloqueados_stamps': 'Desbloqueados',
    'bloqueados_stamps': 'Bloqueados',
    'no_se_encontraron_medallas': 'No se encontraron medallas que coincidan con tu búsqueda.',
    'detalle_estampa': 'Ficha de Estampilla',
    'clase_monumento': 'Monumento',
    'ubicacion': 'Ubicación',
    'coordenadas': 'Coordenadas',
    'estado_actual': 'Estado',
    'bloqueado_caps': 'BLOQUEADO',
    'desbloqueado_caps': 'DESBLOQUEADO',
    'siguiente_insignia_progreso': 'Insígnia de Ruta Relacionada',
    'conseguida': '¡CONSEGUIDA!',
    'aun_no_desbloqueada': 'AÚN NO DESBLOQUEADA',

    // Leaderboard View
    'leaderboard_title': 'Paseo de la Fama de Exploradores',
    'leaderboard_subtitle': 'Aquí convergen los mejores exploradores locales de la región. Haz check-in geográfico en más monumentos, sube de nivel y escala posiciones para presumir tus medallas Web3.',
    'rango': 'RANGO',
    'explorador': 'EXPLORADOR',
    'rango_adquirido': 'RANGO ADQUIRIDO',
    'puntos_caps': 'PUNTOS',
    'medallas_unlocked': 'MEDALLAS',
    'buscar_explorador_placeholder': 'Buscar explorador...',
    'no_se_encontraron_usuarios': 'No se encontraron exploradores que coincidan con tu búsqueda.',

    // Settings View
    'config_perfil': 'Configuración del Perfil de Explorador',
    'ajustes_cuenta_desc': 'Personaliza tu identidad digital de explorador y administra los parámetros de simulación.',
    'editar_perfil': 'Editar Perfil',
    'nombre_completo': 'Nombre o Alias de Explorador',
    'rol_titulo_digital': 'Título Digital de Viajero',
    'correo_electronico': 'Correo Electrónico',
    'direccion_billetera': 'Dirección de Billetera Solana (Descentralizada)',
    'joined_date_label': 'Fecha de Registro',
    'guardar_cambios': 'Guardar Cambios de Perfil',
    'mantenimiento_simulacion': 'Mantenimiento del Sistema & Parámetros de Simulación',
    'mantenimiento_desc': 'Usa estos botones especiales para alternar entre el estado inicial de la demo y un estado con check-ins ya completados.',
    'resetear_cero': 'Estado Inicial (Resetear a 0 Check-ins)',
    'modo_mockup_completo': 'Modo Demo (Pre-completar Alhambra, Córdoba, Segovia)',
    'success_perfil_guardado': '¡Perfil guardado con éxito!',

    // Dynamic Route specific details
    'lh_alh_name': 'Mapa casco histórico de Caracas vol.1 ver. 1.0',
    'lh_mez_name': 'Mapa casco histórico de Caracas vol.2 ver. 2.0',
    'lh_acu_name': 'Mapa casco histórico de Caracas vol.3 ver. 3.0',
    'lh_alc_name': 'Mapa casco histórico de Caracas vol.4 ver. 4.0',
    'lh_sag_name': 'Mapa casco histórico de Caracas vol.5 ver. 5.0',
    'lh_oli_name': 'Mapa casco histórico de Caracas vol.6 ver. 6.0',

    // Categories
    'cat_monumento': 'Monumento Histórico',
    'cat_sagr': 'Arte Mezquita-Catedral',
    'cat_aque': 'Ingeniería Romana',
    'cat_fort': 'Fortaleza Real',
    'cat_basilica': 'Basílica Neogótica',
    'cat_castillo': 'Castillo de Ensueño',

    // Badges Name translations
    'badge_1_name': 'Explorador Principiante',
    'badge_1_title': 'Explorador Bolivariano',
    'badge_2_name': 'Explorador Intermedio',
    'badge_2_title': 'Explorador Omeya',
    'badge_3_name': 'Explorador Avanzado',
    'badge_3_title': 'Explorador del Imperio',
    'badge_4_name': 'Cazador de rutas',
    'badge_4_title': 'Explorador Mudéjar',
    'badge_5_name': 'Guia Local',
    'badge_5_title': 'Maestre del Templo',
    'badge_6_name': 'Guia Local Experto',
    'badge_6_title': 'Rey de Olite',

    // New keys for complete visual translation
    // DashboardView:
    'explorador_digital': 'Explorador Digital',
    'tu_pasaporte_al_mundo': 'Tu Pasaporte a tu Ciudad',
    'tu_pasaporte_desc': 'Descubre el patrimonio histórico como nunca antes. Colecciona Badges digitales, desbloquea insignias exclusivas y forja tu propio camino a través de la historia.',
    'empezar_aventura': 'Empezar Aventura',
    'hola_explorador': 'Hola, Explorador',
    'tu_viaje_continua': 'Tu viaje digital continúa. Revisa tus estadísticas y próximos objetivos.',
    'puntos_totales': 'Puntos Totales',
    'tu_progreso': 'Tu Progreso',
    'progreso_completo_desc': '¡Felicitaciones! Has completado todas las insignias del mapa actual. Reclama tu cNFT Colectivo de Solana abajo para sellar tu gesta.',
    'progreso_incompleto_desc': 'Completa el reto en {dest} para alcanzar el siguiente nivel. Sigue explorando para desbloquear nuevas regiones y recompensas exclusivas.',
    'inicia_tu_exploracion': 'Inicia tu exploración',
    'inicia_tu_exploracion_desc': 'Lista de rutas habilitadas en tu viaje digital. Haz click en iniciar para ver los monumentos en el mapa:',
    'iniciar_ruta': 'Iniciar Ruta',
    'insignias_recientes': 'Insignias Recientes',
    'ver_coleccion_completa': 'Ver Colección Completa',
    'insignia_prefix': 'Insignia: {name}',
    'de_fichas': '{completed} de {required} fichas',
    'completa_cnft_title': 'Completa las 6 Insignias y Reclama tu cNFT Colectivo',
    'completa_cnft_desc': 'Por tu espíritu andador urbano, la red Solana grabará tu estatus inmortal de embajador. Acuñado de forma segura con bajos costos de compresión directo a tu billetera personal vinculada.',
    'solana_reward': 'Solana Web3 Ledger Reward',
    'verificar_receipt': 'Verificar Solscan Receipt',
    'acuñando_cnft': 'Acuñando cNFT Colectivo...',
    'reclamar_cnft_btn': 'Reclamar cNFT Colectivo ({unlocked}/6)',
    'estadisticas_exploracion': 'Estadísticas de Exploración de Viaje',
    'regiones_visitadas_uppercase': 'REGIONES VISITADAS',
    'momentos_capturados_uppercase': 'MOMENTOS CAPTURADOS',
    'logros_compartidos_uppercase': 'LOGROS COMPARTIDOS',
    'compartir_pasaporte_title': 'Compartir Pasaporte',
    'compartir_pasaporte_desc': 'Presume a tus amigos de tu avance histórico. Llevas {unlocked} insignias de {total} desbloqueadas con éxito.',
    'copiado': 'Copiado',
    'copiar': 'Copiar',
    'cerrar_modal': 'Cerrar',

    // ExplorationView:
    'aviso_gps_title': 'Aviso GPS:',
    'aviso_gps_desc': '(Se ha mantenido la simulación manual para que puedas jugar sin problemas)',
    'sub_menu_rutas': 'Sub-menú de Rutas Disponibles',
    'ruta_label': 'Ruta {num}',
    'progreso_label': 'Progreso',
    'fichas_historicas_label': '8 Fichas Históricas',
    'ruta_certificada': 'Ruta Certificada',
    'completados_label': '{num}/8 Completados',
    'completados_listas_label': '{num} / 8 Listas',
    'suma_total_xp': 'Suma Total: {xp} XP',
    'fichas_historicas_title': 'Las 8 Fichas Históricas de la Ruta',
    'fichas_historicas_desc': 'Telesimula tu posición para cada una de las fichas y clica en validar para fichar el lugar.',
    'coordenadas_ficha': 'Coordenadas Ficha:',
    'gps_activo': 'GPS Activo',
    'tus_coordenadas': 'Tus Coordenadas',
    'gps_real_btn': 'GPS Real',
    'resetear_btn': 'Resetear',
    'lugar_validado_title': 'Lugar Historico Validado',
    'lugar_validado_desc': 'Certificado emitido en blockchain correctamente.',
    'posicion_correcta_title': '¡Posición Geográfica Correcta!',
    'presencia_fisica_title': 'Se requiere Presencia Física',
    'metros_number': '{num} metros',
    'posicion_correcta_desc': 'Estás en el radio de presencia permitido (< 150m). Procede a fichar el lugar.',
    'presencia_fisica_desc': 'Para certificar esta ficha, debes teletransportarte o usar tu GPS cerca de las coordenadas.',
    'simular_visita_btn': 'Simular Visita',
    'validando_btn': 'Validando...',
    'fichar_lugar_btn': 'Fichar Lugar',
    'ubicacion_ok': 'UBICACIÓN OK',
    'checkin_verificado_desc': '¡Check-in verificado para el lugar de interés ({name})! Has obtenido +{points} de XP en tu bitácora de viaje.',
    'registrar_foto': '¿Registrar foto del lugar?',
    'foto_instantanea_btn': 'Foto Instantánea',
    'continuar_ruta_btn': 'Continuar la Ruta',

    // StampsView:
    'insignias_digitales_title': 'Insignias Digitales (Badges)',
    'insignias_digitales_desc': 'Cada insignia se desbloquea de forma sucesiva según tu progreso verificado. Para obtener la insignia Explorador Principiante deberás completar la primera geolocalización de la ficha de ruta, y así sucesivamente (2 para intermedia, 3 para avanzada, 4 para cazador, 6 para guía y las 8 fichas para el guía experto) hasta coleccionar las 6 insignias.',
    'tu_cuenta_sello': 'Tu cuenta de insignias',
    'canjeados_label': '{completed} de {total} canjeados',
    'album_supremo_congrats': '¡Felicidades Explorador Supremo! Has dominado el mapa entero por completo. Tu cNFT de Solana te espera en la pantalla principal.',
    'album_supremo_missing': 'Te faltan {num} monumentos por recorrer para reclamar el título final de Embajador Supremo y acuñar tu cNFT.',
    'compartir_logro': 'Compartir Logro',
    'en_twitter': 'En X (Twitter)',
    'en_facebook': 'En Facebook',
    'en_whatsapp': 'En WhatsApp',
    'copiar_enlace': 'Copiar Enlace',
    'ir_a_gps': 'Ir a GPS',
    'marcar_listo': 'Marcar Listo',
    'listo_caps': 'Listo',

    // LeaderboardView:
    'ranking_global_title': 'Ranking de Exploradores',
    'ranking_global_desc': 'Aquí convergen los mejores exploradores locales de la región. Haz check-in geográfico en más monumentos, sube de nivel y escala posiciones para presumir tus medallas Web3.',
    'puesto_index': 'Puesto {num}',
    'rey_del_mapapodium': 'Líder del Mapa',
    'pts_suffix': '{points} Pts • {badges} Badges',
    'exploradores_comunidad_title': 'Exploradores de la Comunidad ({num})',
    'buscar_explorador': 'Buscar explorador...',
    'tu_label': 'Tú',
    'sellos_label': '{num} Badges',
    'pts_label': '{num} Pts',

    // SettingsView:
    'config_explorador_title': 'Configuración del Explorador',
    'config_explorador_desc': 'Administra las credenciales de tu perfil físico-digital. Los cambios realizados se guardan localmente en la caché de tu dispositivo y se sincronizan al instante en todo el tablero.',
    'editar_cuenta_section': 'Editar Perfil',
    'avatar_viajero_title': 'Fotografía y Avatar del Viajero',
    'avatar_viajero_desc': 'Carga una fotografía desde tu computadora o celular, o arrastra la imagen directamente aquí. O si prefieres, escoge uno de estos avatares oficiales de la red:',
    'subir_foto_overlay': 'Subir Foto',
    'subir_foto_btn': 'Subir Fotografía Personalizada',
    'avatar_limit_msg': 'La imagen de avatar supera el límite de 1.5 MB recomendado para persistencia offline.',
    'nombre_explorador_lbl': 'Nombre de Explorador',
    'titulo_honorifico_lbl': 'Seudónimo',
    'biografia_lbl': 'Biografía',
    'correo_vinculado_lbl': 'Correo vinculado (Cuenta)',
    'billetera_destino_lbl': 'Billetera de Destino (Solana Hash)',
    'sincronizacion_exitosa': 'Sincronización Exitosa',
    'wallet_implicit_msg': 'La wallet invisible se asocia a tu correo de forma encriptada bajo Solana.',
    'guardar_cambios_btn': 'Guardar Cambios',
    'mi_cartera_title': 'Mi Cartera Solana',
    'direccion_destino_cnft': 'Dirección de Destino cNFT',
    'no_vinculada': 'No vinculada',
    'copiado_exito': '¡Copiado con Éxito!',
    'copiar_wallet_btn': 'Copiar Dirección Wallet',
    'pruebas_reseteo_title': 'Zona de Pruebas y Reseteo',
    'pruebas_reseteo_desc': 'Utiliza estas opciones para restablecer los estados de check-in del mapa de datos virtuales para testing. Esto permite simular los recorridos múltiples veces.',
    'cerrar_sesion_btn': '🚪 Cerrar Sesión e Ir a Inicio',
    'regresar_mockup_btn': 'Regresar a Modo Mockup (4 / 6 Completado)',
    'regresar_mockup_confirm': '¿Deseas restablecer al estado original de la foto (4 Badges desbloqueados y 2 por canjear)?',
    'si_restablecer_btn': 'Sí, Restablecer',
    'cancelar_btn': 'Cancelar',
    'reiniciar_cero_btn': 'Reiniciar desde Cero (0 / 6 Completados)',
    'reiniciar_cero_confirm': '¿Confirmas borrar todos tus check-ins de GPS y comenzar tu viaje de 0/6 Badges?',
    'si_borrar_todo_btn': 'Sí, Borrar Todo',
  },
  en: {
    // Top Navbar and Landing Header
    'lng_esp': 'ESPAÑOL',
    'lng_ing': 'ENGLISH',
    'ingresar_gmail': 'Log In with Gmail',
    'entrar_como': 'Enter as {name}',
    'salir_btn': 'Log Out',
    'cerrar_sesion_title': 'Log out and return to Home',

    // Landing View Hero
    'descubre_mundo': 'Discover your City,',
    'colecciona_historia': 'Collect History',
    'hero_desc': 'Transform your travels into a digital adventure. Visit monuments, complete your map, and unlock unique digital assets.',
    'saber_mas': 'Learn more',
    'iniciar_como_invitado': 'Start as Guest',
    'empieza_ahora_gratis': 'Start Now For Free',
    'listo_comenzar_coleccion': 'About the Project',

    // Landing How It Works
    'como_funciona': 'How it works',
    'physical_map_title': 'Acquire your Physical Map',
    'physical_map_desc': 'Start your journey with our high-quality premium map. It contains the secret markers and QR codes required to activate your digital Passport.',
    'visit_sites_title': 'Visit the Sites',
    'visit_sites_desc': 'Explore historic monuments and natural wonders. Each location is a new milestone in your career as a Digital Explorer.',
    'gps_checkin_title': 'GPS Check-In',
    'gps_checkin_desc': 'Our geolocalization technology validates your presence. Only real travelers get their badge.',
    'realtime_validation': 'REAL-TIME VALIDATION',
    'earn_cnft_title': 'Earn Digital Postcards and Exclusive cNFTs',
    'earn_cnft_desc': 'For each unlocked route you can get a DIGITAL POSTCARD claimed with your Wallet on the blockchain as a decentralized cryptographic signature. (Solana Proof-Stamping). For each unlocked route you will obtain a unique (Compressed NFT) that lives on the blockchain. They are collectible, transferable, and prove your travel history.',

    // Landing Footer
    'footer_manifesto': 'Digitalizing cultural heritage through gamified experiences and blockchain technology.',
    'comunidad': 'COMMUNITY',
    'legal': 'LEGAL',
    'soporte': 'SUPPORT',
    'terminos': 'Terms of Service',
    'privacidad': 'Privacy Policy',
    'cookies_policy': 'Cookie Policy',
    'centro_ayuda': 'Help Center',
    'contacto': 'Contact Us',
    'derechos_reservados': '© 2026 BITACORA DIGITAL | PINTA MAPAS. All rights reserved.',

    // Sidebar & Navigation
    'dashboard': 'Dashboard',
    'exploration': 'Exploration',
    'my_stamps': 'My Stamps',
    'leaderboard': 'Leaderboard',
    'settings': 'Settings',
    'postales_digitales': 'Postcards',
    'status': 'STATUS',
    'explorer_level': 'Explorer Level {level}',
    'xp_to_level_up': '{xp} XP to Level Up',
    'unlock_new_region': 'Unlock New Region',
    'support': 'Support',
    'cerrar_sesion': 'Log Out',
    'ruta_prefix': 'Route',

    // Dashboard View - Header & Stats
    'tu_pasaporte': 'Your Adventure Passport',
    'dashboard_welcome': 'Welcome, {name}! Continue exploring historical secrets to level up and earn badges.',
    'estrellas_ganadas': 'Badges Earned',
    'total_rutas': 'Route Progress',
    'estadisticas_viaje': 'Travel Statistics',
    'regiones_visited_label': 'Regions Visited',
    'momentos_capturados_label': 'Moments Captured',
    'logros_compartidos_label': 'Shared Achievements',
    'ver_detalles': 'View details',
    'buscar_monumentos': 'Search historical maps...',

    // Dashboard View - Recent Badges & cNFTs
    'rutas_recientes_insignias': 'Unlocked Route Badges',
    'recompensas_blockchain': 'Blockchain Rewards',
    'solana_cnfts_desc': 'Sync your achievements with the Solana network and make them everlasting.',
    'ver_todas_estampas': 'View your stamp collection',
    'completado': 'Completed',
    'puntos_pts': 'points',
    'puntos_uppercase': 'POINTS',
    'comenzar_exploracion': 'Start Exploration',
    'explorar_ruta': 'Explore route',
    'insignia_reclamada': 'Badge Claimed',
    'reclama_cnft': 'Claim badge as Solana cNFT',
    'reclamando_tx': 'Processing on Solana Mainnet...',
    'transaccion_exitosa': 'Transaction successful',
    'firma_transaccion': 'Sign the transaction in your wallet',
    'ver_en_solscan': 'View on Solscan',
    'cerrar_popup': 'Close',

    // Exploration View
    'guia_ruta_interactive': 'Interactive Route Sheet',
    'mapa_caracas_subtitle': 'Visual and historical guide for GPS check-ins',
    'instrucciones_checking': 'Instructions: To log your visit, click each point on the map or use the "GPS Check-In" button. You must be at the corresponding coordinates in the Historic Center.',
    'marcador_seleccionado': 'Selected Marker',
    'puntos_ruta': 'Points of Interest of the Route',
    'unloaded_route_desc': 'Select a point of interest on the interactive map on the left to view its historical review and perform check-in.',
    'esta_bloqueado_checkin': 'You have not visited this historical monument yet.',
    'hacer_checkin_gps': 'Simulate GPS Check-In',
    'esta_visitado_checkin': 'Visit Completed Successfully!',
    'puntos_ganados': 'You have earned {points} points for verifying this milestone.',
    'escribir_resena': 'Write a Collective Review',
    'compartir_comunidad': 'Share with the Community',
    'tomar_ selfi': 'Take Memory Photo',
    'visitar_ruta_stamps': 'View my badge collection of this route',
    'eliminar_progreso_sitio': 'Reset Check-In (Maintenance)',
    'monumento_historico': 'Historical Monument',

    // Exploration Photo & Alerts
    'selfie_tomada': 'Memory photo saved!',
    'selfie_subt': 'Photo recorded in the explorer\'s logbook.',
    'campana_checkin': 'New Exploration Approved',
    'campana_checkin_body': 'Geolocated check-in at {name} validated successfully!',
    'alerta_region_nueva': 'New Region Unlocked!',
    'alerta_region_body': 'You have expanded your exploration map to a new historical quadrant. Open the route sheet list to view the new locations.',
    'desbloquear_insignia_notif': 'New Badge Received!',
    'desbloquear_insignia_body': 'You have reached the rank of {badgeName} on this route.',

    // Stamps View
    'catalogo_sellos': 'Personal Medals and Stamp Collection',
    'mis_estampillas_filosofia': 'Each stamp represents a certified historical milestone. Badges are awarded progressively as route check-ins are completed.',
    'filtros': 'Filters',
    'todos_stamps': 'All',
    'desbloqueados_stamps': 'Unlocked',
    'bloqueados_stamps': 'Locked',
    'no_se_encontraron_medallas': 'No badges found matching your search.',
    'detalle_estampa': 'Stamp Details',
    'clase_monumento': 'Monument',
    'ubicacion': 'Location',
    'coordenadas': 'Coordinates',
    'estado_actual': 'Status',
    'bloqueado_caps': 'LOCKED',
    'desbloqueado_caps': 'UNLOCKED',
    'siguiente_insignia_progreso': 'Related Route Badge',
    'conseguida': 'EARNED!',
    'aun_no_desbloqueada': 'NOT YET UNLOCKED',

    // Leaderboard View
    'leaderboard_title': 'Explorers\' Hall of Fame',
    'leaderboard_subtitle': 'The region\'s top local explorers benchmark here. Geolocate more monuments, level up, and step up the leaderboard to display your Web3 credentials.',
    'rango': 'RANK',
    'explorador': 'EXPLORER',
    'rango_adquirido': 'EARNED RANK',
    'puntos_caps': 'POINTS',
    'medallas_unlocked': 'MEDALS',
    'buscar_explorador_placeholder': 'Search explorer...',
    'no_se_encontraron_usuarios': 'No explorers found matching your search.',

    // Settings View
    'config_perfil': 'Explorer Profile Configuration',
    'ajustes_cuenta_desc': 'Personalize your digital explorer identity and manage simulation variables.',
    'editar_perfil': 'Edit Profile',
    'nombre_completo': 'Explorer Name or Handle',
    'rol_titulo_digital': 'Traveler Digital Title',
    'correo_electronico': 'Email Address',
    'direccion_billetera': 'Solana Wallet Address (Decentralized)',
    'joined_date_label': 'Registration Date',
    'guardar_cambios': 'Save Profile Changes',
    'mantenimiento_simulacion': 'System Maintenance & Simulation Parameters',
    'mantenimiento_desc': 'Use these special buttons to toggle between the clean demo start state and a pre-loaded checked-in state.',
    'resetear_cero': 'Reset State (Clear all 0 Check-ins)',
    'modo_mockup_completo': 'Demo Mode (Pre-complete Alhambra, Córdoba, Segovia)',
    'success_perfil_guardado': 'Profile saved successfully!',

    // Dynamic Route specific details
    'lh_alh_name': 'Historic Center of Caracas Map vol.1 ver. 1.0',
    'lh_mez_name': 'Historic Center of Caracas Map vol.2 ver. 2.0',
    'lh_acu_name': 'Historic Center of Caracas Map vol.3 ver. 3.0',
    'lh_alc_name': 'Historic Center of Caracas Map vol.4 ver. 4.0',
    'lh_sag_name': 'Historic Center of Caracas Map vol.5 ver. 5.0',
    'lh_oli_name': 'Historic Center of Caracas Map vol.6 ver. 6.0',

    // Categories
    'cat_monumento': 'Historical Monument',
    'cat_sagr': 'Mosque-Cathedral Art',
    'cat_aque': 'Roman Engineering',
    'cat_fort': 'Royal Fortress',
    'cat_basilica': 'Neo-Gothic Basilica',
    'cat_castillo': 'Dreamy Castle',

    // Badges Name translations
    'badge_1_name': 'Beginner Explorer',
    'badge_1_title': 'Bolivarian Explorer',
    'badge_2_name': 'Intermediate Explorer',
    'badge_2_title': 'Umayyad Explorer',
    'badge_3_name': 'Advanced Explorer',
    'badge_3_title': 'Imperial Explorer',
    'badge_4_name': 'Route Hunter',
    'badge_4_title': 'Mudejar Explorer',
    'badge_5_name': 'Local Guide',
    'badge_5_title': 'Temple Master',
    'badge_6_name': 'Expert Local Guide',
    'badge_6_title': 'King of Olite',

    // New keys for complete visual translation
    // DashboardView:
    'explorador_digital': 'Digital Explorer',
    'tu_pasaporte_al_mundo': 'Your passport to your City',
    'tu_pasaporte_desc': 'Discover historical heritage like never before. Collect digital stamps, unlock exclusive badges and forge your own path through history.',
    'empezar_aventura': 'Start Adventure',
    'hola_explorador': 'Hello, Explorer',
    'tu_viaje_continua': 'Your digital journey continues. Keep track of your stats and next goals.',
    'puntos_totales': 'Total Points',
    'tu_progreso': 'Your Progress',
    'progreso_completo_desc': 'Congratulations! You have completed all badges on the current map. Claim your Solana Collective cNFT below to seal your feat.',
    'progreso_incompleto_desc': 'Complete the challenge at {dest} to reach the next level. Keep exploring to unlock new regions and exclusive rewards.',
    'inicia_tu_exploracion': 'Start your exploration',
    'inicia_tu_exploracion_desc': 'List of routes enabled in your digital journey. Click start to see monuments on the map:',
    'iniciar_ruta': 'Start Route',
    'insignias_recientes': 'Recent Badges',
    'ver_coleccion_completa': 'View Complete Collection',
    'insignia_prefix': 'Badge: {name}',
    'de_fichas': '{completed} of {required} stamps',
    'completa_cnft_title': 'Complete all 6 Badges and Claim your Collective cNFT',
    'completa_cnft_desc': 'For your urban explorer spirit, the Solana network will record your immortal status of ambassador. Securely minted with low compression costs directly to your linked personal wallet.',
    'solana_reward': 'Solana Web3 Ledger Reward',
    'verificar_receipt': 'Verify Solscan Receipt',
    'acuñando_cnft': 'Minting Collective cNFT...',
    'reclamar_cnft_btn': 'Claim Collective cNFT ({unlocked}/6)',
    'estadisticas_exploracion': 'Journey Exploration Statistics',
    'regiones_visitadas_uppercase': 'REGIONS VISITED',
    'momentos_capturados_uppercase': 'MOMENTS CAPTURED',
    'logros_compartidos_uppercase': 'SHARED ACHIEVEMENTS',
    'compartir_pasaporte_title': 'Share Passport',
    'compartir_pasaporte_desc': 'Show off your historic progress to your friends. You have successfully unlocked {unlocked} of {total} badges.',
    'copiado': 'Copied',
    'copiar': 'Copy',
    'cerrar_modal': 'Close',

    // ExplorationView:
    'aviso_gps_title': 'GPS Notice:',
    'aviso_gps_desc': '(Manual simulation has been active so you can play without issues)',
    'sub_menu_rutas': 'Available Routes Sub-menu',
    'ruta_label': 'Route {num}',
    'progreso_label': 'Progress',
    'fichas_historicas_label': '8 Historical Stamps',
    'ruta_certificada': 'Route Certified',
    'completados_label': '{num}/8 Completed',
    'completados_listas_label': '{num} / 8 Completed',
    'suma_total_xp': 'Total Sum: {xp} XP',
    'fichas_historicas_title': 'The 8 Historical Stamps of the Route',
    'fichas_historicas_desc': 'Teleport your position for each stamp and click validate to check in.',
    'coordenadas_ficha': 'Stamp Coordinates:',
    'gps_activo': 'GPS Active',
    'tus_coordenadas': 'Your Coordinates',
    'gps_real_btn': 'Real GPS',
    'resetear_btn': 'Reset',
    'lugar_validado_title': 'Historical Place Validated',
    'lugar_validado_desc': 'Certificate successfully issued on the blockchain.',
    'posicion_correcta_title': 'Correct Geographical Position!',
    'presencia_fisica_title': 'Physical Presence Required',
    'metros_number': '{num} meters',
    'posicion_correcta_desc': 'You are in the permitted presence radius (< 150m). Proceed to check in.',
    'presencia_fisica_desc': 'To certify this stamp, you must teleport or use your GPS near the coordinates.',
    'simular_visita_btn': 'Simulate Visit',
    'validando_btn': 'Validating...',
    'fichar_lugar_btn': 'Check In Place',
    'ubicacion_ok': 'LOCATION OK',
    'checkin_verificado_desc': 'Check-in verified for the point of interest ({name})! You earned +{points} XP in your travel logbook.',
    'registrar_foto': 'Record photo of the place?',
    'foto_instantanea_btn': 'Instant Photo',
    'continuar_ruta_btn': 'Continue Route',

    // StampsView:
    'insignias_digitales_title': 'Digital Badges',
    'insignias_digitales_desc': 'Each badge is unlocked successively based on your verified progress. To earn the Beginner Explorer badge you must complete the first geolocation of the route sheet, and so on (2 for intermediate, 3 for advanced, 4 for hunter, 6 for guide, and all 8 sheets for the expert local guide) until you collect all 6 badges.',
    'tu_cuenta_sello': 'Your Stamp Count',
    'canjeados_label': '{completed} of {total} claimed',
    'album_supremo_congrats': 'Congratulations Supreme Explorer! You have fully mastered the entire map. Your Solana cNFT awaits you on the main screen.',
    'album_supremo_missing': 'You need {num} more monuments to explore to claim the final title of Supreme Ambassador and mint your cNFT.',
    'compartir_logro': 'Share Achievement',
    'en_twitter': 'On X (Twitter)',
    'en_facebook': 'On Facebook',
    'en_whatsapp': 'On WhatsApp',
    'copiar_enlace': 'Copy Link',
    'ir_a_gps': 'Go to GPS',
    'marcar_listo': 'Mark Ready',
    'listo_caps': 'Ready',

    // LeaderboardView:
    'ranking_global_title': 'Explorer Ranking',
    'ranking_global_desc': 'Here the region\'s top local explorers benchmark. Geolocate more monuments, level up, and step up the rank to display your Web3 credentials.',
    'puesto_index': 'Rank {num}',
    'rey_del_mapapodium': 'Leader of the Map',
    'pts_suffix': '{points} Pts • {badges} Badges',
    'exploradores_comunidad_title': 'Community Explorers ({num})',
    'buscar_explorador': 'Search explorer...',
    'tu_label': 'You',
    'sellos_label': '{num} Badges',
    'pts_label': '{num} Pts',

    // SettingsView:
    'config_explorador_title': 'Explorer Configuration',
    'config_explorador_desc': 'Manage your physical-digital profile credentials. Changes made are saved locally in browser cache and synchronized instantly across the entire board.',
    'editar_cuenta_section': 'Edit Profile',
    'avatar_viajero_title': 'Traveler Photograph & Avatar',
    'avatar_viajero_desc': 'Upload a photo from your computer or phone, or drag the image directly here. Or if you prefer, choose one of these official network avatars:',
    'subir_foto_overlay': 'Upload Photo',
    'subir_foto_btn': 'Upload Custom Photograph',
    'avatar_limit_msg': 'The avatar image exceeds the 1.5 MB limit recommended for offline persistence.',
    'nombre_explorador_lbl': 'Explorer Name',
    'titulo_honorifico_lbl': 'Pseudonym',
    'biografia_lbl': 'Biography',
    'correo_vinculado_lbl': 'Linked Email (Account)',
    'billetera_destino_lbl': 'Destination Wallet (Solana Hash)',
    'sincronizacion_exitosa': 'Synchronization Successful',
    'wallet_implicit_msg': 'The invisible wallet is encrypted and associated with your email on Solana.',
    'guardar_cambios_btn': 'Save Changes',
    'mi_cartera_title': 'My Solana Wallet',
    'direccion_destino_cnft': 'cNFT Destination Address',
    'no_vinculada': 'Not linked',
    'copiado_exito': 'Successfully Copied!',
    'copiar_wallet_btn': 'Copy Wallet Address',
    'pruebas_reseteo_title': 'Testing & Reset Zone',
    'pruebas_reseteo_desc': 'Use these options to reset checkout states of virtual data maps for testing. This lets you simulate journeys multiple times.',
    'cerrar_sesion_btn': '🚪 Log Out and Go to Home',
    'regresar_mockup_btn': 'Reset to Mockup Mode (4 / 6 Completed)',
    'regresar_mockup_confirm': 'Do you want to restore the original state of the picture (4 unlocked stamps and 2 pending)?',
    'si_restablecer_btn': 'Yes, Restore',
    'cancelar_btn': 'Cancel',
    'reiniciar_cero_btn': 'Reset from Scratch (0 / 6 Completed)',
    'reiniciar_cero_confirm': 'Do you confirm clearing all your GPS check-ins and starting your journey with 0/6 stamps?',
    'si_borrar_todo_btn': 'Yes, Clear All',
  },
};

// Maps of place translations
const PLACE_TRANSLATIONS: Record<Language, Record<string, { name: string; category: string; description: string }>> = {
    es: {}, // Uses the default Spanish entries from data.ts
    en: {
      // Places Alhambra / Caracas vol.1
      'alh_leones': {
        name: 'Bolívar Equestrian Statue',
        category: 'Central Monument',
        description: 'The famous bronze sculpture on a granite pedestal, cast by Tadolini in 1874.'
      },
      'alh_comares': {
        name: 'Caracas Cathedral',
        category: 'Colloquial Temple',
        description: 'Historic Cathedral with its elegant baroque facade and colonial bell tower.'
      },
      'alh_generalife': {
        name: 'Yellow House (Casa Amarilla)',
        category: 'Historic Residence',
        description: 'Colonial headquarters of the city council and current chancellery, witness to milestones of independence.'
      },
      'alh_vela': {
        name: 'Municipal Palace of Caracas',
        category: 'Neoclassical Building',
        description: 'Beautiful building with neoclassical reliefs and the historic Act Room.'
      },
      'alh_carlosv': {
        name: 'Federal Capitol',
        category: 'Legislative Seat',
        description: 'The lavish Federal Legislative Palace with its majestic golden dome and republican milestone.'
      },
      'alh_hermanas': {
        name: 'Gradillas Corner',
        category: 'Corner of Legends',
        description: 'Historic colonial discussion point located at the southeast corner of the plaza.'
      },
      'alh_justicia': {
        name: 'The Four Iron Fountains',
        category: 'Ornamental Detail',
        description: 'Allegorical fountains decorated with cherubs, located at the four inner corners of the plaza.'
      },
      'alh_baños': {
        name: 'Shadow of Mahogany and Jacaranda trees',
        category: 'Plaza Gardens',
        description: 'The lush urban forest and gardening that adorns the marble pathways of the plaza.'
      },

    // Places Córdoba / Caracas vol.2
    'mez_naranjos': {
      name: 'Courtyard of the Orange Trees',
      category: 'Outer Atrium',
      description: 'The leafy courtyard of orange trees and palms that served as ante-room and ritual wash area of the great mosque.'
    },
    'mez_mihrab': {
      name: 'The Main Mihrab',
      category: 'Sacred Sanctuary',
      description: 'The prayer niche oriented south, decorated with lavish gold mosaics and Byzantine tiles.'
    },
    'mez_columnas': {
      name: 'Forest of Columns',
      category: 'Prayer Hall',
      description: 'An infinite hypostyle labyrinth with bicolor double double-arcs of red brick and white limestone.'
    },
    'mez_alminar': {
      name: 'Minaret Tower',
      category: 'Belfry',
      description: 'The ancient minaret of Abderramán III, later encased in a baroque bell tower structure.'
    },
    'mez_villaviciosa': {
      name: 'Villaviciosa Chapel',
      category: 'Christian Conversion',
      description: 'The first chapel major built after the Christian conquest, beautifully fitted under polylobed arches.'
    },
    'mez_crucero': {
      name: 'Cathedral Crossing',
      category: 'Major Basilica',
      description: 'The imposing Plateresque and Renaissance cathedral built right in the middle of the Islamic aisles during the 16th century.'
    },
    'mez_almodovar': {
      name: 'Almodóvar Gate',
      category: 'Walled Access',
      description: 'One of the medieval gates of the walled city, of Islamic origin, flanked by battlements.'
    },
    'mez_tesoro': {
      name: 'Cathedral Treasure',
      category: 'Sacred Exhibition',
      description: 'A valuable gold custody by Enrique de Arfe and historic liturgical elements of high artistic and religious interest.'
    },

    // Places Segovia / Caracas vol.3
    'acu_azoguejo': {
      name: 'High Arches of Azoguejo',
      category: 'Monumental Plaza',
      description: 'The most photogenic and highest section of the aqueduct, where the granite rows reach a total height of 28 meters.'
    },
    'acu_canal': {
      name: 'Conduction Canal',
      category: 'Hydraulic System',
      description: 'The topmost U-shaped stone channel where water flowed continuously from the Sierra.'
    },
    'acu_desarenador': {
      name: 'San Gabriel Sand Trap',
      category: 'Desanding Chamber',
      description: 'An ancient stone decantation tank used to filter sand and sediment from the water before entering the city.'
    },
    'acu_hornacina': {
      name: 'Niche of the Virgin',
      category: 'Votive Offering',
      description: 'Central niche that holds the statue of the protective Virgin of the city, replacing previous Roman pagan images.'
    },
    'acu_torre': {
      name: 'Water Tower',
      category: 'Distribution Terminal',
      description: 'Ancient fort where flowing water was split and directed via deep channels to various public fountains.'
    },
    'acu_postigo': {
      name: 'Postigo del Consuelo',
      category: 'Medieval Gate',
      description: 'Walled gate located right beside the aqueduct arches, a defensive link to the historic core.'
    },
    'acu_mirador': {
      name: 'Arches Viewpoint',
      category: 'Scenic Balcony',
      description: 'A beautiful viewpoint at the steps of the Postigo offering a wide panorama over the Azoguejo plaza.'
    },
    'acu_artilleria': {
      name: 'Artillery Square',
      category: 'Public Forum',
      description: 'The wide open square flanking the aqueduct where ancient artillery battalions used to pitch their campaign tents.'
    },

    // Places Sevilla / Caracas vol.4
    'alc_doncellas': {
      name: 'Courtyard of the Maidens',
      category: 'Mudejar Heart',
      description: 'A spectacular courtyard with a central pool and sunken gardens, surrounded by exquisite lobed arches.'
    },
    'alc_embajadores': {
      name: 'Ambassadors Hall',
      category: 'Throne Room',
      description: 'The most magnificent room of the palace, featuring a majestic golden wooden dome decorated with stalactites (muqarnas).'
    },
    'alc_baños': {
      name: 'Baths of Lady María de Padilla',
      category: 'Underground Vaults',
      description: 'A peaceful, rib-vaulted underground rainwater pool with amazing subterranean light playing.'
    },
    'alc_muñecas': {
      name: 'Courtyard of the Dolls',
      category: 'Private Residence',
      description: 'An intimate, highly decorated courtyard named after the tiny carved faces at the base of its delicate columns.'
    },
    'alc_mercurio': {
      name: 'Mercury Garden',
      category: 'Pond & Statuary',
      description: 'An elevated pond featuring a bronze statue of Mercury, flanked by a beautiful scenic gallery.'
    },
    'alc_templete': {
      name: 'Carlos V Pavilion',
      category: 'Garden Oasis',
      description: 'A gorgeous brick and tile pavilion situated inside physical orchards, a perfect fusion of Gothic and Mudejar art.'
    },
    'alc_grutesco': {
      name: 'Grotto Gallery',
      category: 'Scenic Loggia',
      description: 'A scenic stone wall modified with rusticated blocks and niches, overlooking the royal palace orchards.'
    },
    'alc_tapices': {
      name: 'Tapestry Hall',
      category: 'Historic Hall',
      description: 'Vast ballroom hosting large-scale wool tapestries depicting historical conquest journeys of Carlos V.'
    },

    // Places Sagrada Familia / Caracas vol.5
    'sag_nacimiento': {
      name: 'Nativity Facade',
      category: 'Gothic Detail',
      description: 'The only facade built directly under Gaudí\'s supervision, deeply organic and rich with natural symbolism.'
    },
    'sag_pasion': {
      name: 'Passion Facade',
      category: 'Dramatic Sculpture',
      description: 'A stark, high-contrast facade depicting the drama of Christ\'s passion with geometric, angular sculptures.'
    },
    'sag_columnas': {
      name: 'Stone Forest Nave',
      category: 'Cathedral Columns',
      description: 'An awe-inspiring interior vault supported by branching stone pillars resembling giant tree trunks.'
    },
    'sag_cripta': {
      name: 'Antoni Gaudí Crypt',
      category: 'Santuario',
      description: 'The peaceful subterranean chapel where the mastermind architect Antoni Gaudí lies entombed.'
    },
    'sag_estrella': {
      name: 'Virgin Mary Tower Star',
      category: 'Luminous Symbol',
      description: 'The monumental 12-pointed glass star capping the Tower of Mary, illuminated beautifully at night.'
    },
    'sag_abside': {
      name: 'Sg. Familia Apse',
      category: 'Gothic Apse',
      description: 'The circular rear of the temple, featuring gorgeous stone windows and gargoyles depicting local fauna.'
    },
    'sag_museo': {
      name: 'Gaudí Temple Museum',
      category: 'Creative Hub',
      description: 'Historical exhibition containing plaster scale models and original draft concepts created in the master\'s workshop.'
    },
    'sag_rosario': {
      name: 'Rosary Portal',
      category: 'Intimate Doorway',
      description: 'A beautifully sculpted small portal inside the cloister, featuring intricate floral stone carvings.'
    },

    // Places Olite / Caracas vol.6
    'oli_homenaje': {
      name: 'Keep (Torre de Homenaje)',
      category: 'Defensive Tower',
      description: 'The highest and most robust tower of the palace, featuring spectacular views over Navarrese vineyards.'
    },
    'oli_reina': {
      name: 'Queen\'s Gallery',
      category: 'Gothic Cloister',
      description: 'A beautiful external balcony with arches, where royal families gathered to admire the gardens below.'
    },
    'oli_naranjos': {
      name: 'Courtyard of the Oranges',
      category: 'Royal Garden',
      description: 'An enclosed hanging garden where exotic citrus trees were grown, watered by an ingenious hydraulic system.'
    },
    'oli_trescoronas': {
      name: 'Three Crowns Tower',
      category: 'Scenic Watchtower',
      description: 'An elegant, octagonal tower styled with three successive concentric tiers, resembling a crowns crown.'
    },
    'oli_rey': {
      name: 'King\'s Chambers',
      category: 'Royal Quarters',
      description: 'Vast gothic chambers featuring elegant fireplaces, carved stone ceilings, and high gothic windows.'
    },
    'oli_puente': {
      name: 'Moat & Drawbridge',
      category: 'Outer Fort',
      description: 'The defensive moat and historic drawbridge separating the old palace from the new structure.'
    },
    'oli_bodega': {
      name: 'Monks\' Royal Wine Cellar',
      category: 'Subterranean Vaults',
      description: 'Subterranean brick vaults used for centuries to store local royal wines at perfect temperature.'
    },
    'oli_arcos': {
      name: 'Hall of the Arches',
      category: 'Gothic Arcade',
      description: 'A massive gothic hall supported by massive arches, serving as the foundation of the palace hanging gardens.'
    }
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('passport_language') as Language;
    return saved === 'es' || saved === 'en' ? saved : 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('passport_language', lang);
  };

  // Safe global translate utility
  const t = (key: string): string => {
    const translation = DICTIONARY[language][key];
    if (translation !== undefined) {
      return translation;
    }
    // Check Spanish fallback
    const fallback = DICTIONARY['es'][key];
    return fallback !== undefined ? fallback : key;
  };

  // Helper to translate route info dynamically on the fly based on current language
  const translateLocation = (loc: Location): Location => {
    const matchingInitial = INITIAL_LOCATIONS.find(initial => initial.id === loc.id);
    const resolvedLoc: Location = {
      ...loc,
      imageUrl: matchingInitial ? matchingInitial.imageUrl : loc.imageUrl,
      badgeImageUrl: matchingInitial ? matchingInitial.badgeImageUrl : loc.badgeImageUrl
    };

    if (language === 'es') return resolvedLoc; // Already Spanish in database

    const lKey = `lh_${loc.id}_name`;
    const name = t(lKey) !== lKey ? t(lKey) : loc.name;

    // Categories
    let category = loc.category;
    if (loc.id === 'alhambra') category = t('cat_monumento');
    if (loc.id === 'mezquita_cordoba') category = t('cat_sagr');
    if (loc.id === 'acueducto_segovia') category = t('cat_aque');
    if (loc.id === 'alcazar_sevilla') category = t('cat_fort');
    if (loc.id === 'sagrada_familia') category = t('cat_basilica');
    if (loc.id === 'castillo_olite') category = t('cat_castillo');

    // Badges Names
    let badgeName = loc.badgeName;
    let badgeTitle = loc.badgeTitle;
    if (loc.id === 'alhambra') {
      badgeName = t('badge_1_name');
      badgeTitle = t('badge_1_title');
    }
    if (loc.id === 'mezquita_cordoba') {
      badgeName = t('badge_2_name');
      badgeTitle = t('badge_2_title');
    }
    if (loc.id === 'acueducto_segovia') {
      badgeName = t('badge_3_name');
      badgeTitle = t('badge_3_title');
    }
    if (loc.id === 'alcazar_sevilla') {
      badgeName = t('badge_4_name');
      badgeTitle = t('badge_4_title');
    }
    if (loc.id === 'sagrada_familia') {
      badgeName = t('badge_5_name');
      badgeTitle = t('badge_5_title');
    }
    if (loc.id === 'castillo_olite') {
      badgeName = t('badge_6_name');
      badgeTitle = t('badge_6_title');
    }

    // Process review / descriptions
    let review = loc.review;
    if (loc.id === 'alhambra') review = ['Historic Center of Caracas Map vol.1 ver. 1.0'];
    if (loc.id === 'mezquita_cordoba') review = ['Historic Center of Caracas Map vol.2 ver. 2.0'];
    if (loc.id === 'acueducto_segovia') review = ['Historic Center of Caracas Map vol.3 ver. 3.0'];
    if (loc.id === 'alcazar_sevilla') review = ['Historic Center of Caracas Map vol.4 ver. 4.0'];
    if (loc.id === 'sagrada_familia') review = ['Historic Center of Caracas Map vol.5 ver. 5.0'];
    if (loc.id === 'castillo_olite') review = ['Historic Center of Caracas Map vol.6 ver. 6.0'];

    // Sublocations
    const translatedPlaces = (loc.places || []).map((place): SubLocation => {
      const entry = PLACE_TRANSLATIONS['en'][place.id];
      if (entry) {
        return {
          ...place,
          name: entry.name,
          category: entry.category,
          description: entry.description
        };
      }
      return place;
    });

    return {
      ...resolvedLoc,
      name,
      category,
      badgeName,
      badgeTitle,
      review,
      places: translatedPlaces
    };
  };

  // Helper to translate user title if required
  const translateUser = (user: UserProfile): UserProfile => {
    if (language === 'es') return user;
    let title = user.title;
    if (user.title === 'Explorador Supremo') title = 'Supreme Explorer';
    if (user.title === 'Explorador Novato') title = 'Novice Explorer';
    if (user.title === 'Iniciado del Templo') title = 'Temple Initiate';
    if (user.title === 'Custodio del Olimpo') title = 'Olympus Warden';
    if (user.title === 'Embajador del Desierto') title = 'Desert Ambassador';
    if (user.title === 'Sabio Forestal') title = 'Forest Sage';
    if (user.title === 'Cazador Marino') title = 'Marine Hunter';

    return {
      ...user,
      title
    };
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateLocation, translateUser }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
