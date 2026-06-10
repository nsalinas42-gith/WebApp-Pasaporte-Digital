/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Database, 
  Settings, 
  Award, 
  RefreshCw, 
  Trash2, 
  EyeOff, 
  Unlock, 
  Check, 
  Cpu, 
  FileText,
  Compass,
  ArrowLeft,
  ShieldCheck,
  Users,
  Search,
  UserX
} from 'lucide-react';
import { Location, UserProfile } from '../types';
import { INITIAL_LOCATIONS } from '../data';
import { resolveAvatar } from '../utils/avatars';

import { 
  getAllRegisteredUsers, 
  resetUserProgress, 
  deleteUserEntirely,
  saveSolanaGlobalSettings,
  subscribeSolanaGlobalSettings,
  saveCloudPostcard,
  deleteCloudPostcard,
  subscribeCloudPostcards,
  resetCloudPostcardsToDefault,
  POSTCARD_IMAGE_MAP
} from '../utils/firebase';

import stampAlhambra from '../assets/images/explorador_principiante.png';
import stampCordoba from '../assets/images/explorador_intermedio.png';
import stampSegovia from '../assets/images/explorador_avanzado.png';
import stampSevilla from '../assets/images/cazador_de_rutas.png';
import stampSagrada from '../assets/images/guia_local.png';
import stampOlite from '../assets/images/guia_local_experto.png';

// Import local postales folder images
import postal1 from '../assets/images/postales/postal_1.png';
import postal2 from '../assets/images/postales/postal_2.png';

const DEFAULT_POSTCARDS = [
  {
    id: 'alhambra',
    name: 'Postales - Casco Histórico de Caracas',
    routeKey: 'alhambra',
    image: stampAlhambra,
  },
  {
    id: 'mezquita_cordoba',
    name: 'Postales - Circuito Museos de Caracas',
    routeKey: 'mezquita_cordoba',
    image: stampCordoba,
  },
  {
    id: 'acueducto_segovia',
    name: 'Postales - Casco Histórico Vol. 3',
    routeKey: 'acueducto_segovia',
    image: stampSegovia,
  },
  {
    id: 'alcazar_sevilla',
    name: 'Postales - Casco Histórico Vol. 4',
    routeKey: 'alcazar_sevilla',
    image: stampSevilla,
  },
  {
    id: 'sagrada_familia',
    name: 'Postales - Casco Histórico Vol. 5',
    routeKey: 'sagrada_familia',
    image: stampSagrada,
  },
  {
    id: 'castillo_olite',
    name: 'Postales - Casco Histórico Vol. 6',
    routeKey: 'castillo_olite',
    image: stampOlite,
  },
];

const PRESET_IMAGES: Record<string, string> = {
  'preset-1': stampAlhambra,
  'preset-2': stampCordoba,
  'preset-3': stampSegovia,
  'preset-4': stampSevilla,
  'preset-5': stampSagrada,
  'preset-6': stampOlite
};

const POSTALES_IMAGES: Record<string, string> = {
  'postal_1.png': postal1,
  'postal_2.png': postal2,
};

interface AdminHiddenViewProps {
  locations: Location[];
  user: UserProfile;
  lockedRouteIds: string[];
  setLockedRouteIds: (ids: string[]) => void;
  onResetToMockupState: () => void;
  onResetToZeroState: () => void;
  onToggleLocationCheckIn: (locationId: string) => void;
  onClose: () => void;
}

export default function AdminHiddenView({
  locations,
  user,
  lockedRouteIds,
  setLockedRouteIds,
  onResetToMockupState,
  onResetToZeroState,
  onToggleLocationCheckIn,
  onClose
}: AdminHiddenViewProps) {
  const [selectedDbTable, setSelectedDbTable] = useState<'locations' | 'user' | 'system'>('locations');
  const [simulationLogs, setSimulationLogs] = useState<string[]>(() => [
    `[${new Date().toISOString().slice(11, 19)}] Sistema inicializado de forma segura.`,
    `[${new Date().toISOString().slice(11, 19)}] Solana RPC devnet conectada: 100% operativa.`,
    `[${new Date().toISOString().slice(11, 19)}] Sesión de administración de alta jerarquía establecida.`
  ]);

  const [globalWalletEnabled, setGlobalWalletEnabled] = useState<boolean>(true);
  const [globalNetwork, setGlobalNetwork] = useState<'MAINET' | 'DEVNET'>('DEVNET');

  useEffect(() => {
    const unsubscribe = subscribeSolanaGlobalSettings((settings) => {
      setGlobalWalletEnabled(settings.walletEnabled);
      setGlobalNetwork(settings.network);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // If the authorized administrator is logged in, verify if the postcards collection in Firestore is empty.
    // If empty, automatically seed the 6 default postcards to Firestore so they are real persisted documents.
    const autoSeedPostcardsIfEmpty = async () => {
      const isAdminEmail = isCurrentAdmin;
      if (isAdminEmail) {
        try {
          const { db } = await import('../utils/firebase');
          const { collection, getDocs } = await import('firebase/firestore');
          const querySnapshot = await getDocs(collection(db, 'postcards'));
          if (querySnapshot.empty) {
            addLog("La colección de postales en Firestore está vacía. Iniciando auto-sembrado de las 6 postales de Caracas en la base de datos...");
            await resetCloudPostcardsToDefault();
            addLog("Auto-sembrado de postales completado con éxito en Firestore.");
          }
        } catch (error: any) {
          console.warn("No se pudo auto-sembrar las postales (puede ser offline o falta de permisos):", error);
        }
      }
    };

    autoSeedPostcardsIfEmpty();
  }, [user]);

  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isLoadingDbUsers, setIsLoadingDbUsers] = useState<boolean>(true);
  const [dbUserSearch, setDbUserSearch] = useState<string>('');
  const [actionStatusMsg, setActionStatusMsg] = useState<string | null>(null);

  // Dynamic Administrators state
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState<boolean>(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const loadAdminsCollection = async () => {
    setIsLoadingAdmins(true);
    try {
      const { getCloudAdmins } = await import('../utils/firebase');
      const list = await getCloudAdmins();
      setAdminsList(list);
    } catch (err) {
      console.warn("Could not load admins list:", err);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdminsCollection();
  }, [user]);

  const isCurrentAdmin = user && (
    user.email === 'nsalinas42@gmail.com' || 
    user.email === 'felix.voyager@gmail.com' ||
    adminsList.some(a => a.email?.toLowerCase() === user.email?.toLowerCase())
  );

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) {
      alert("Por favor ingresa el correo y la clave del nuevo administrador.");
      return;
    }

    try {
      const { saveCloudAdmin, signUpWithEmail } = await import('../utils/firebase');
      const emailLower = newAdminEmail.trim().toLowerCase();
      
      // Save admin in firestore
      await saveCloudAdmin(emailLower, newAdminPassword);
      
      // Target register in firebase auth list as well
      try {
        await signUpWithEmail(emailLower, newAdminPassword, 'Administrador', '');
      } catch (authErr) {
        console.log("Firebase Auth entry already exists or skipped:", authErr);
      }

      setNewAdminEmail('');
      setNewAdminPassword('');
      addLog(`Administrador '${emailLower}' registrado en Firestore.`);
      await loadAdminsCollection();
      setActionStatusMsg(`Administrador "${emailLower}" agregado con éxito.`);
      setTimeout(() => setActionStatusMsg(null), 3500);
    } catch (err: any) {
      alert(`Error al registrar administrador: ${err.message || err}`);
    }
  };

  const handleDeleteAdmin = async (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === 'nsalinas42@gmail.com') {
      alert("No se puede eliminar el administrador principal (nsalinas42@gmail.com).");
      return;
    }

    if (!window.confirm(`¿Seguro que deseas revocar los privilegios de administrador para ${emailToDelete}?`)) {
      return;
    }

    try {
      const { deleteCloudAdmin } = await import('../utils/firebase');
      await deleteCloudAdmin(emailToDelete);
      addLog(`Administrador '${emailToDelete}' revocado de Firestore.`);
      await loadAdminsCollection();
      setActionStatusMsg(`Administrador "${emailToDelete}" eliminado.`);
      setTimeout(() => setActionStatusMsg(null), 3000);
    } catch (err: any) {
      alert(`Error al eliminar administrador: ${err.message || err}`);
    }
  };

  // Dynamic Postcards Configuration states
  const [postcards, setPostcards] = useState<any[]>([]);

  useEffect(() => {
    // Realtime subscription to cloud postcards
    const unsubscribe = subscribeCloudPostcards((cardList) => {
      // Map stored cards back to image assets for display
      const mapped = cardList.map((card) => ({
        ...card,
        image: card.imageBase64 || POSTCARD_IMAGE_MAP[card.imageKey] || POSTALES_IMAGES[card.imageKey] || postal1
      }));
      setPostcards(mapped);
    });

    return () => unsubscribe();
  }, []);

  const [newPostcardId, setNewPostcardId] = useState('');
  const [newPostcardName, setNewPostcardName] = useState('');
  const [newPostcardRouteKey, setNewPostcardRouteKey] = useState(locations[0]?.id || 'alhambra');
  const [newPostcardImage, setNewPostcardImage] = useState('postal_1.png');
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [customImageFileName, setCustomImageFileName] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        alert('Por favor selecciona únicamente archivos de formato .png');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomImageBase64(base64);
        setCustomImageFileName(file.name);
        
        // Auto-populate helper ID and Name for easier authoring
        const namePart = file.name.replace(/\.[^/.]+$/, "");
        const cleanId = namePart.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
        setNewPostcardId(cleanId);
        setNewPostcardName('Postales - ' + namePart.replace(/[-_]/g, ' '));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper utility for generating localized security logs
  const addLog = (message: string) => {
    const timestamp = `[${new Date().toISOString().slice(11, 19)}]`;
    setSimulationLogs(prev => [
      `${timestamp} ${message}`,
      ...prev.slice(0, 50)
    ]);
  };

  const handleAddPostcard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isAdminEmail = isCurrentAdmin;
    if (!isAdminEmail) {
      alert(`Operación denegada. Solo los administradores autorizados pueden cargar y guardar nuevas postales en Firestore.`);
      return;
    }

    if (!newPostcardId || !newPostcardName) {
      alert("Por favor introduce el ID único y el Título de la Postal.");
      return;
    }

    const preparedId = newPostcardId.toLowerCase().trim().replace(/\s+/g, '_');

    // Check duplicate
    if (postcards.some(p => p.id === preparedId)) {
      alert("Ya existe una postal registrada con ese ID.");
      return;
    }

    try {
      await saveCloudPostcard({
        id: preparedId,
        name: newPostcardName.trim(),
        routeKey: newPostcardRouteKey,
        imageKey: customImageBase64 ? 'custom_uploaded' : newPostcardImage,
        ...(customImageBase64 ? { imageBase64: customImageBase64 } : {})
      });

      // Reset inputs
      setNewPostcardId('');
      setNewPostcardName('');
      setNewPostcardImage('postal_1.png');
      setCustomImageBase64(null);
      setCustomImageFileName('');
      
      addLog(`Nueva Postal '${newPostcardName}' cargada en la cola de acuñación en Firestore.`);
      setActionStatusMsg(`Postal "${newPostcardName}" agregada con éxito.`);
      setTimeout(() => setActionStatusMsg(null), 3500);
    } catch (err: any) {
      alert(`Error al guardar postal: ${err.message || err}`);
    }
  };

  const handleDeletePostcard = async (postcardId: string, name: string) => {
    const isAdminEmail = isCurrentAdmin;
    if (!isAdminEmail) {
      alert(`Operación denegada. Solo los administradores autorizados pueden eliminar postales de Firestore.`);
      return;
    }

    try {
      await deleteCloudPostcard(postcardId);
      addLog(`Postal '${name}' eliminada del gestor por el Administrador.`);
      setActionStatusMsg(`Postal "${name}" removida.`);
      setTimeout(() => setActionStatusMsg(null), 3000);
    } catch (err: any) {
      alert(`Error al eliminar postal: ${err.message || err}`);
    }
  };

  const handleResetPostcardsToDefault = async () => {
    const isAdminEmail = isCurrentAdmin;
    if (!isAdminEmail) {
      alert(`Operación denegada. Solo los administradores autorizados pueden restablecer la colección.`);
      return;
    }

    if (window.confirm("¿Seguro que deseas restablecer las 6 postales originales de Caracas? Esto eliminará cualquier postal cargada manualmente en Firestore.")) {
      try {
        await resetCloudPostcardsToDefault();
        addLog(`Colección de postales restablecida a las 6 iniciales en Firestore.`);
        setActionStatusMsg(`Postales restablecidas con éxito.`);
        setTimeout(() => setActionStatusMsg(null), 3000);
      } catch (err: any) {
        alert(`Error al restablecer postales: ${err.message || err}`);
      }
    }
  };

  const fetchUsers = async () => {
    setIsLoadingDbUsers(true);
    try {
      const users = await getAllRegisteredUsers();
      setDbUsers(users);
    } catch (err) {
      console.error("Failed to fetch registered users list:", err);
    } finally {
      setIsLoadingDbUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetProgressInCloud = async (userId: string, userName: string) => {
    try {
      await resetUserProgress(userId, INITIAL_LOCATIONS);
      addLog(`Progreso en la nube de '${userName}' REINICIADO con éxito.`);
      setActionStatusMsg(`Progreso de ${userName} reiniciado.`);
      setTimeout(() => setActionStatusMsg(null), 3000);
      fetchUsers();
    } catch (err) {
      console.error("Failed to reset progress:", err);
      addLog(`Error al reiniciar progreso de '${userName}'.`);
    }
  };

  const handleDeleteUserInCloud = async (userId: string, userName: string) => {
    try {
      await deleteUserEntirely(userId);
      addLog(`Usuario '${userName}' ELIMINADO de Firestore permanentemente.`);
      setActionStatusMsg(`Usuario ${userName} eliminado.`);
      setTimeout(() => setActionStatusMsg(null), 3000);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      addLog(`Error al eliminar al usuario '${userName}'.`);
    }
  };

  // Toggle custom routing mechanisms

  const handleToggleRouteLock = (id: string) => {
    if (lockedRouteIds.includes(id)) {
      setLockedRouteIds(lockedRouteIds.filter(x => x !== id));
      addLog(`Ruta '${id}' DESBLOQUEADA de forma forzada por el Administrador.`);
    } else {
      setLockedRouteIds([...lockedRouteIds, id]);
      addLog(`Ruta '${id}' BLOQUEADA de forma forzada por el Administrador.`);
    }
  };

  const handleForceCompleteAll = () => {
    locations.forEach(loc => {
      if (!loc.isCheckedIn) {
        onToggleLocationCheckIn(loc.id);
      }
    });
    addLog(`Todas las insignias y rutas completadas con éxito de forma artificial.`);
  };

  return (
    <div className="bg-[#00080d] min-h-screen text-on-surface font-sans p-4 sm:p-8 md:p-12 animate-in fade-in duration-300">
      
      {/* Upper Navigation Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#005049]/35 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 glow-red animate-pulse">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest font-mono">
                Pág. Oculta de Seguridad
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant/50">v1.2.9_SECURE</span>
            </div>
            <h1 className="font-headline text-xl sm:text-2xl font-black text-on-surface uppercase tracking-tight">
              PANEL DE CONTROL SUPREMO (ADMIN)
            </h1>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-[#001c27] hover:bg-[#1A56DB]/10 border border-[#1A56DB]/30 hover:border-[#1A56DB] text-[#1A56DB] transition-all text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </button>
      </header>

      {/* Grid Layout of Admin Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Column (8 cols): Advanced Diagnostics & Live Logs */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECURE METRICS AND STATS CARD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#00121a] border border-[#005049]/20 p-5 rounded-2xl text-left space-y-1 shadow-md">
              <span className="text-[9px] text-[#8c9f9e] font-black uppercase tracking-wider block">Insígnias Disp.</span>
              <span className="text-2xl font-black text-secondary font-mono">{locations.length}</span>
              <div className="h-1 w-8 bg-secondary/35 rounded mt-2"></div>
            </div>

            <div className="bg-[#00121a] border border-[#005049]/20 p-5 rounded-2xl text-left space-y-1 shadow-md">
              <span className="text-[9px] text-[#8c9f9e] font-black uppercase tracking-wider block">Check-ins Listos</span>
              <span className="text-2xl font-black text-tertiary font-mono">
                {locations.filter(l => l.isCheckedIn).length}
              </span>
              <div className="h-1 w-8 bg-tertiary/35 rounded mt-2"></div>
            </div>

            <div className="bg-[#00121a] border border-[#005049]/20 p-5 rounded-2xl text-left space-y-1 shadow-md">
              <span className="text-[9px] text-[#8c9f9e] font-black uppercase tracking-wider block">Rutas Bloqueadas</span>
              <span className="text-2xl font-black text-red-400 font-mono">{lockedRouteIds.length}</span>
              <div className="h-1 w-8 bg-red-400/35 rounded mt-2"></div>
            </div>

            <div className="bg-[#00121a] border border-[#005049]/20 p-5 rounded-2xl text-left space-y-1 shadow-md">
              <span className="text-[9px] text-[#8c9f9e] font-black uppercase tracking-wider block">Solana Devnet</span>
              <span className="text-xs font-bold font-mono text-[#1A56DB] flex items-center gap-1 bg-[#1A56DB]/10 border border-[#1A56DB]/20 px-2 py-1 rounded max-w-fit mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                CONECTADO
              </span>
            </div>
          </div>

          {/* MASTER BYPASS CHECK-IN LIST */}
          <div className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-[#005049]/15 pb-3">
              <div>
                <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#1A56DB]" />
                  Control Maestro de Geolocalización (Check-ins Manuales)
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Bypasea de forma segura los requerimientos GPS desde aquí para activar/desactivar insignias completas.
                </p>
              </div>
              
              <button
                onClick={handleForceCompleteAll}
                className="py-1.5 px-3 bg-tertiary/10 border border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20 text-tertiary text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all shrink-0"
              >
                Auto-Completar Todo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((loc, i) => {
                const isUnlocked = loc.isCheckedIn;
                return (
                  <div key={loc.id} className="bg-[#000f16]/60 border border-[#005049]/15 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 space-y-0.5 text-left truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#ffffff]/5 flex items-center justify-center text-secondary shrink-0 font-mono text-xs font-black">
                        #{i + 1}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-on-surface truncate">{loc.name}</p>
                        <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider block">
                          Badge: {loc.badgeName}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onToggleLocationCheckIn(loc.id);
                        addLog(`Insignia del mapa '${loc.name}' toggled manualmente.`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono cursor-pointer shrink-0 transition-all ${
                        isUnlocked 
                          ? 'bg-tertiary/20 text-tertiary border border-tertiary/35 hover:bg-tertiary/30' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                      }`}
                    >
                      {isUnlocked ? '✓ Completado' : '⚡ Forzar Check-In'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CLOUD USER PERSISTENCE & RESET MANAGER CARD */}
          <div className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-4 shadow-lg text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#005049]/15 pb-4">
              <div>
                <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1A56DB]" />
                  Gestión Central de Exploradores (Firestore Database)
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Lista viva de usuarios registrados en el servidor. Reinicia stamps a cero o elimina registros de manera irreversible.
                </p>
              </div>
              
              <button
                onClick={fetchUsers}
                className="py-1.5 px-3.5 bg-[#1A56DB]/10 border border-[#1A56DB]/30 hover:border-[#1A56DB] hover:bg-[#1A56DB]/20 text-[#1A56DB] text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all shrink-0 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3 animate-pulse" />
                Actualizar base
              </button>
            </div>

            {/* Searches filters */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8c9f9e]/50 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o correo electrónico..."
                value={dbUserSearch}
                onChange={(e) => setDbUserSearch(e.target.value)}
                className="w-full bg-[#000d14] border border-[#005049]/25 rounded-xl py-2 px-10 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#1A56DB] transition-all font-sans"
              />
            </div>

            {actionStatusMsg && (
              <div className="py-2.5 px-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                ✓ {actionStatusMsg}
              </div>
            )}

            {/* Main scroll window pane */}
            <div className="bg-[#000d14] rounded-2xl border border-[#005049]/15 p-2 overflow-hidden shadow-inner">
              <div className="max-h-64 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#005049]/40 scrollbar-track-transparent">
                {isLoadingDbUsers ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#8c9f9e]/50">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#1A56DB]" />
                    <span className="text-xs font-mono uppercase tracking-wider">Conectando con Firestore...</span>
                  </div>
                ) : dbUsers.filter((u: any) => {
                  const q = dbUserSearch.toLowerCase().trim();
                  return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                }).length === 0 ? (
                  <div className="py-12 text-center text-[#8c9f9e]/40 flex flex-col items-center justify-center gap-1.5">
                    <span className="text-2xl">👥</span>
                    <span className="text-xs font-semibold">Ningún explorador activo coincide con tu búsqueda.</span>
                  </div>
                ) : (
                  dbUsers.filter((u: any) => {
                    const q = dbUserSearch.toLowerCase().trim();
                    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                  }).map((u) => (
                    <div 
                      key={u.uid} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#001721]/45 hover:bg-[#001c27]/70 border border-[#005049]/10 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img 
                            src={resolveAvatar(u.avatarUrl)} 
                            alt={u.name} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-[#1A56DB]/20 bg-[#000d14]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center font-bold text-secondary shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div className="text-left space-y-0.5 truncate">
                          <p className="text-xs font-black text-on-surface truncate flex items-center gap-1.5">
                            {u.name}
                            {u.email === 'felix.voyager@gmail.com' && (
                              <span className="text-[8px] tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-bold">GUEST</span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#8c9f9e]/80 font-mono truncate max-w-[200px] sm:max-w-xs">{u.email}</p>
                          <span className="text-[9px] text-on-surface-variant/40 font-mono block select-all">ID: {u.uid}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-[#005049]/10 pt-2.5 sm:pt-0">
                        <button
                          onClick={() => handleResetProgressInCloud(u.uid, u.name)}
                          className="flex items-center gap-1 py-1.5 px-3 bg-[#1A56DB]/10 hover:bg-[#1A56DB]/20 border border-[#1A56DB]/25 hover:border-[#1A56DB] text-[#1A56DB] text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reiniciar
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUserInCloud(u.uid, u.name)}
                          className="flex items-center gap-1 py-1.5 px-3 bg-red-950/20 hover:bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 text-rose-400 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                        >
                          <UserX className="w-3 h-3" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* DYNAMIC SYSTEM ADMINISTRATORS MANAGEMENT CARD */}
          <div className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-6 shadow-lg text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#005049]/15 pb-4">
              <div>
                <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-secondary animate-pulse" />
                  Gestión de Administradores Autorizados
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Agrega o elimina administradores del sistema con privilegios de escritura en Firestore.
                </p>
              </div>
            </div>

            {/* List of current administrators */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-secondary uppercase tracking-wider">Administradores Registrados ({adminsList.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {isLoadingAdmins ? (
                  <div className="col-span-2 py-8 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant/50">
                    <RefreshCw className="w-5 h-5 animate-spin text-secondary" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Cargando administradores...</span>
                  </div>
                ) : adminsList.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-on-surface-variant/40 text-xs">
                    No hay administradores guardados en la base de datos.
                  </div>
                ) : (
                  adminsList.map((admin) => (
                    <div key={admin.email} className="bg-[#000d14] border border-[#005049]/15 p-3 rounded-2xl flex gap-3 items-center justify-between group hover:border-[#1A56DB]/30 transition-all">
                      <div className="truncate">
                        <p className="text-xs font-bold text-on-surface truncate">{admin.email}</p>
                        <p className="text-[10px] text-[#8c9f9e] font-mono">Clave: {admin.password}</p>
                      </div>

                      {admin.email?.toLowerCase() !== 'nsalinas42@gmail.com' ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(admin.email)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-all"
                          title="Revocar permisos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[9px] uppercase bg-secondary/15 text-secondary font-mono px-2 py-0.5 rounded font-bold">
                          Principal
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add administrator form fields */}
            <form onSubmit={handleAddAdmin} className="space-y-4 pt-4 border-t border-[#005049]/15">
              <h4 className="text-xs font-black text-secondary uppercase tracking-wider">Añadir Nuevo Administrador</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c9f9e] uppercase font-bold tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-[#000d14] border border-[#005049]/25 rounded-xl py-2 px-3 text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c9f9e] uppercase font-bold tracking-wider">Contraseña / Clave</label>
                  <input
                    type="text"
                    required
                    placeholder="Clave de acceso"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full bg-[#000d14] border border-[#005049]/25 rounded-xl py-2 px-3 text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-secondary hover:brightness-110 active:scale-[0.98] text-on-secondary text-xs uppercase font-black tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                Registrar Administrador
              </button>
            </form>
          </div>

          {/* POSTCARD REGISTRATION & MANAGEMENT CARD */}
          <div className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-6 shadow-lg text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#005049]/15 pb-4">
              <div>
                <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary animate-bounce-slow" />
                  Gestor de Acuñación de Postales (Web3 Setup)
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Carga, modifica y autoriza nuevas postales con insignias asignadas para que los usuarios puedan acuñarlas como cNFTs de Solana.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetPostcardsToDefault}
                className="py-1.5 px-3 bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all shrink-0"
              >
                Reestablecer Postales Iniciales
              </button>
            </div>

            {/* List of currently active postcards */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-secondary uppercase tracking-wider">Postales Autorizadas ({postcards.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {postcards.map((p) => {
                  const associatedRoute = locations.find(l => l.id === p.routeKey);
                  return (
                    <div key={p.id} className="bg-[#000d14] border border-[#005049]/15 p-3 rounded-2xl flex gap-3 items-center justify-between group hover:border-secondary/35 transition-all">
                      <div className="flex items-center gap-3 truncate">
                        <img 
                          src={p.image} 
                          alt={p.name}
                          onError={(e) => {
                            // custom fallback image placeholder
                            e.currentTarget.src = stampAlhambra;
                          }}
                          className="w-11 h-11 rounded-lg border border-[#005049]/30 object-cover bg-surface-container shrink-0"
                        />
                        <div className="text-left truncate space-y-0.5">
                          <p className="text-xs font-bold text-on-surface truncate leading-tight">{p.name}</p>
                          <p className="text-[10px] font-mono text-secondary truncate">ID: {p.id}</p>
                          <p className="text-[9px] text-[#8c9f9e]/70 truncate">
                            Ruta: {associatedRoute ? associatedRoute.name : p.routeKey}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePostcard(p.id, p.name)}
                        className="p-1 px-2.5 bg-red-950/20 text-rose-400 border border-red-500/15 hover:border-rose-500 rounded-lg hover:bg-red-500/10 cursor-pointer transition-all self-center"
                        title="Eliminar de la cola de acuñación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form to load / add a new postcard card */}
            <form onSubmit={handleAddPostcard} className="space-y-4 pt-4 border-t border-[#005049]/15">
              <h4 className="text-xs font-black text-secondary uppercase tracking-wider">Cargar Nueva Postal Digital</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c9f9e] uppercase tracking-wider">ID Único de la Postal</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: ruta_caracas_centro"
                    value={newPostcardId}
                    onChange={(e) => setNewPostcardId(e.target.value)}
                    className="w-full bg-[#000d14] border border-[#005049]/30 rounded-xl px-3.5 py-2 text-xs text-on-surface placeholder:text-[#8c9f9e]/30 outline-none focus:border-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c9f9e] uppercase tracking-wider">Título de la Postal</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Postales - Casco Histórico Vol. 7"
                    value={newPostcardName}
                    onChange={(e) => setNewPostcardName(e.target.value)}
                    className="w-full bg-[#000d14] border border-[#005049]/30 rounded-xl px-3.5 py-2 text-xs text-on-surface placeholder:text-[#8c9f9e]/30 outline-none focus:border-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c9f9e] uppercase tracking-wider">Vincular a Ruta de la Bitácora</label>
                  <select
                    value={newPostcardRouteKey}
                    onChange={(e) => setNewPostcardRouteKey(e.target.value)}
                    className="w-full bg-[#000d14] border border-[#005049]/30 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-secondary cursor-pointer"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8c9f9e] uppercase tracking-wider">Diseño / Imagen Core (De carpeta postales)</label>
                  <select
                    value={newPostcardImage}
                    onChange={(e) => setNewPostcardImage(e.target.value)}
                    disabled={!!customImageBase64}
                    className={`w-full bg-[#000d14] border border-[#005049]/30 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-secondary cursor-pointer font-mono text-secondary ${customImageBase64 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="postal_1.png">postal_1.png</option>
                    <option value="postal_2.png">postal_2.png</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2 border-t border-[#005049]/15 pt-3 mt-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                    <span>O Cargar una Imagen .PNG propia</span>
                    <span className="text-xs text-[#8c9f9e]/60">(Recomendado 7:5 / 1700x1080px)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#000d14] border border-dashed border-[#005049]/30 rounded-2xl p-4">
                    <label id="upload-postcard-btn" className="w-full sm:w-auto px-4 py-2.5 bg-[#001721] hover:bg-[#002b3d] text-on-surface border border-[#005049]/45 rounded-xl cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-colors select-none">
                      <Cpu className="w-4 h-4 text-secondary" />
                      <span>Elegir Archivo .png</span>
                      <input 
                        type="file" 
                        accept="image/png" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                    </label>
                    <div className="flex-1 text-center sm:text-left">
                      {customImageBase64 ? (
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                          <div className="w-10 h-10 border border-[#00554d] rounded-lg overflow-hidden bg-[#00080d] flex-shrink-0">
                            <img src={customImageBase64} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-secondary truncate max-w-[200px]" title={customImageFileName}>
                              {customImageFileName}
                            </p>
                            <button 
                              type="button" 
                              onClick={() => { setCustomImageBase64(null); setCustomImageFileName(''); }}
                              className="text-[10px] text-red-400 hover:underline font-semibold block outline-none"
                            >
                              Eliminar y usar core
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#8c9f9e]/50 font-medium">Ningún archivo seleccionado. Se usará el Diseño Core seleccionado.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-secondary text-on-secondary font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-105 active:scale-95 transition-all outline-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Cargar Postal Digital Autorizada</span>
                </button>
              </div>
            </form>
          </div>

          {/* SIMULATED SYSTEM EVENT LOG */}
          <div className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-4 shadow-lg text-left">
            <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-400 animate-pulse" />
              Bitácora de Eventos de Seguridad del Sistema (Línea de Vida)
            </h3>
            
            <div className="bg-[#000d14] rounded-2xl border border-red-500/15 p-4 font-mono text-xs text-red-300 space-y-2 h-44 overflow-y-auto select-none shadow-inner">
              {simulationLogs.map((log, idx) => (
                <p key={idx} className="truncate">
                  <span className="text-[#8c9f9e]/40 select-none">&bull;&bull;&bull;</span> {log}
                </p>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): DB Explorer & Settings */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Estado de Cuenta de Usuario */}
          <div className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-4 shadow-lg text-left">
            <div className="flex justify-between items-center border-[#005049]/15 border-b pb-2">
              <h3 className="font-headline text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-secondary" style={{ display: 'inline-block' }} /> Autenticación de Usuario
              </h3>
              <div className="flex items-center gap-1.5 text-[9px] bg-secondary/10 border border-secondary/20 px-2.5 py-0.5 rounded-full text-secondary font-bold">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
                <span>SECURE ID</span>
              </div>
            </div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Las cuentas creadas con correo electrónico y contraseña se sincronizan en tiempo real directamente con Firebase Firestore.
            </p>

            <div className="flex flex-col gap-3 p-3.5 bg-[#000f16]/60 rounded-2xl border border-secondary/15">
              <div className="text-left space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#8c9f9e] block">Estado de Conexión</span>
                <span className="text-xs text-[#c8e7fb] font-semibold flex flex-wrap items-center gap-1">
                  {user && user.email && user.email !== 'felix.voyager@gmail.com' ? (
                    <>
                      <span className="text-[#1A56DB] font-bold">● Sesión Iniciada:</span> {user.name} ({user.email})
                    </>
                  ) : (
                    <>
                      <span className="text-on-surface-variant/70 font-semibold">● Modo Invitado (Local)</span>
                    </>
                  )}
                </span>
                <p className="text-[10px] text-on-surface-variant/60 leading-normal">
                  Inicia sesión o regístrate en la pantalla principal para vincular tu progreso de forma permanente.
                </p>
              </div>
            </div>
          </div>

          {/* ADMIN BLOCKCHAIN SOLANA CARD */}
          <div id="admin-blockchain-solana-card" className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-5 shadow-lg text-left">
            <h3 className="font-headline text-sm font-bold text-secondary uppercase tracking-wider border-b border-[#005049]/15 pb-2 flex items-center gap-1.5">
              <span className="text-secondary select-none">🌐</span>
              ADMIN BLOCKCHAIN SOLANA
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#8c9f9e] font-black uppercase tracking-wider block mb-2">
                  Función de wallet (Todos los usuarios)
                </span>
                
                <button
                  id="btn-toggle-wallet-global"
                  onClick={async () => {
                    const newValue = !globalWalletEnabled;
                    try {
                      await saveSolanaGlobalSettings(newValue, globalNetwork);
                      addLog(`Función Solana Wallet ${newValue ? 'ACTIVADA' : 'DESACTIVADA'} para todos los usuarios.`);
                    } catch (err) {
                      console.error("Error setting wallet global flag:", err);
                      addLog(`[Local] Función Solana Wallet cambiada localmente a ${newValue ? 'ACTIVADA' : 'DESACTIVADA'}. (Se requiere inicio de sesión de admin para sincronizar en la nube).`);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    globalWalletEnabled
                      ? 'bg-[#1A56DB]/10 hover:bg-[#1A56DB]/20 border border-[#1A56DB] text-[#1A56DB]'
                      : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500 text-red-500 font-bold'
                  }`}
                >
                  <span>{globalWalletEnabled ? '⚡ Wallet Habilitada' : '🚫 Wallet Deshabilitada'}</span>
                </button>
                <p className="text-[10px] text-on-surface-variant/70 mt-1.5 leading-relaxed font-sans">
                  Activa o desactiva de forma global el acceso y visibilidad de la Solana Wallet para todos los exploradores.
                </p>
              </div>

              <div id="admin-solana-network-section" className="pt-2 border-t border-[#005049]/15">
                <span className="text-xs font-black uppercase tracking-wider block text-[#c8e7fb] mb-1 font-headline">
                  RED
                </span>
                
                <div className="bg-[#000f16] p-1 rounded-xl flex items-center mt-2 border border-[#005049]/10">
                  <button
                    id="btn-sol-network-mainnet"
                    onClick={async () => {
                      try {
                        await saveSolanaGlobalSettings(globalWalletEnabled, 'MAINET');
                        addLog(`Red Solana cambiada globalmente a MAINET.`);
                      } catch (err) {
                        console.error("Error updating network to mainnet:", err);
                        addLog(`[Local] Red Solana cambiada localmente a MAINET. (Se requiere inicio de sesión de admin para sincronizar en la nube).`);
                      }
                    }}
                    className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                      globalNetwork === 'MAINET'
                        ? 'bg-red-500/15 border border-red-400 text-red-400'
                        : 'text-[#8c9f9e] hover:text-on-surface'
                    }`}
                  >
                    MAINET
                  </button>
                  <button
                    id="btn-sol-network-devnet"
                    onClick={async () => {
                      try {
                        await saveSolanaGlobalSettings(globalWalletEnabled, 'DEVNET');
                        addLog(`Red Solana cambiada globalmente a DEVNET.`);
                      } catch (err) {
                        console.error("Error updating network to devnet:", err);
                        addLog(`[Local] Red Solana cambiada localmente a DEVNET. (Se requiere inicio de sesión de admin para sincronizar en la nube).`);
                      }
                    }}
                    className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                      globalNetwork === 'DEVNET'
                        ? 'bg-[#1A56DB]/10 border border-[#1A56DB]/30 text-[#1A56DB]'
                        : 'text-[#8c9f9e] hover:text-on-surface'
                    }`}
                  >
                    DEVNET
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-variant/70 mt-1.5 leading-relaxed font-sans">
                  Selecciona la red de Solana de destino utilizada para emitir transacciones Web3.
                </p>
              </div>
            </div>
          </div>

          {/* ACTIVATE/DISABLE MAPS INTERACTIVE TOGGLE */}
          <div className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-4 shadow-lg text-left">
            <h3 className="font-headline text-sm font-bold text-secondary uppercase tracking-wider border-b border-secondary/15 pb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-secondary" style={{ animation: 'spin 10s linear infinite' }} />
              Estado General de Rutas Pinta Mapas
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Define el acceso que tendrán tus usuarios a cada uno de los mapas del juego. Si lo bloqueas, no podrán interactuar ni ganar medallas.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {locations.map((loc, i) => {
                const isLocked = lockedRouteIds.includes(loc.id);
                return (
                  <div 
                    key={loc.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border gap-2 transition-all ${
                      isLocked 
                        ? 'bg-red-950/10 border-red-500/20 text-rose-400/90' 
                        : 'bg-[#001c27] border-secondary/20 text-[#c8e7fb]'
                    }`}
                  >
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">Ruta {i+1}</span>
                      <span className="text-xs font-bold truncate" title={loc.name}>{loc.name}</span>
                    </div>

                    <button
                      onClick={() => handleToggleRouteLock(loc.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer font-mono ${
                        isLocked
                          ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                          : 'bg-secondary/10 text-secondary border border-secondary/30'
                      }`}
                    >
                      {isLocked ? '🔒 Bloqueada' : '🔓 Activa'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LOCALSTORAGE DATABASE VISUAL ENGINE */}
          <div className="bg-[#001721] border border-[#005049]/25 p-6 rounded-3xl space-y-4 shadow-lg text-left">
            <div className="flex items-center justify-between border-b border-[#005049]/15 pb-2">
              <h3 className="font-headline text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase">
                <Database className="w-4 h-4 text-[#1A56DB]" />
                Explorador de Datos (LocalDB)
              </h3>
            </div>

            {/* Selector Tables */}
            <div className="grid grid-cols-3 gap-1 bg-[#000f16] p-1 rounded-xl text-center">
              <button
                onClick={() => setSelectedDbTable('locations')}
                className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  selectedDbTable === 'locations' ? 'bg-[#001e2c] border border-secondary/35 text-secondary' : 'text-on-surface-variant'
                }`}
              >
                Maps
              </button>
              <button
                onClick={() => setSelectedDbTable('user')}
                className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  selectedDbTable === 'user' ? 'bg-[#001e2c] border border-secondary/35 text-secondary' : 'text-on-surface-variant'
                }`}
              >
                User
              </button>
              <button
                onClick={() => setSelectedDbTable('system')}
                className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  selectedDbTable === 'system' ? 'bg-[#001e2c] border border-secondary/35 text-secondary' : 'text-on-surface-variant'
                }`}
              >
                SysInfo
              </button>
            </div>

            <div className="bg-[#000d14] p-3 rounded-xl border border-[#005049]/15 font-mono text-[10px] text-[#1A56DB] h-52 overflow-y-auto select-all shadow-inner">
              {selectedDbTable === 'locations' && (
                <pre>{JSON.stringify(locations.map(l => ({ id: l.id, isCheckedIn: l.isCheckedIn, points: l.points, childrenCount: l.places?.length })), null, 2)}</pre>
              )}
              {selectedDbTable === 'user' && (
                <pre>{JSON.stringify(user, null, 2)}</pre>
              )}
              {selectedDbTable === 'system' && (
                <pre>{JSON.stringify({
                  time: "2026-06-02T15:36:15Z",
                  platform: "Google Cloud Run Sandboxed Architecture",
                  browser: navigator.userAgent,
                  secureSessionHash: "b3f8g19_4038a8b1112bc552"
                }, null, 2)}</pre>
              )}
            </div>

            {/* Quick Testing Resets inside Footer table */}
            <div className="pt-2 border-t border-[#005049]/15 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onResetToMockupState();
                  addLog("Se ha restablecido los datos al estado de Demo Mágnum (4/6 sellos).");
                }}
                className="py-2 px-2.5 bg-[#1A56DB]/10 hover:bg-[#1A56DB]/20 border border-[#1A56DB]/25 text-[#1A56DB] font-bold text-[9px] uppercase tracking-wide rounded-xl cursor-pointer transition-all"
              >
                Regresar a Mockup
              </button>
              <button
                onClick={() => {
                  onResetToZeroState();
                  addLog("Base de datos purgada completamente a ceros (0/6 sellos).");
                }}
                className="py-2 px-2.5 bg-red-950/20 hover:bg-rose-950/50 border border-rose-500/30 text-rose-400 font-bold text-[9px] uppercase tracking-wide rounded-xl cursor-pointer transition-all"
              >
                Purgar Todo a Cero
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
