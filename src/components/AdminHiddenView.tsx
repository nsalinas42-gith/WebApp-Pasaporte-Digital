/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { Location, UserProfile } from '../types';

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

  const addLog = (message: string) => {
    setSimulationLogs(prev => [`[${new Date().toISOString().slice(11, 19)}] ${message}`, ...prev.slice(0, 8)]);
  };

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
          className="px-5 py-2.5 bg-[#001c27] hover:bg-[#43e5d4]/10 border border-[#43e5d4]/30 hover:border-[#43e5d4] text-[#43e5d4] transition-all text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer outline-none"
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
              <span className="text-xs font-bold font-mono text-[#43e5d4] flex items-center gap-1 bg-[#43e5d4]/10 border border-[#43e5d4]/20 px-2 py-1 rounded max-w-fit mt-1">
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
                  <Activity className="w-5 h-5 text-[#43e5d4]" />
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
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isLocked 
                        ? 'bg-red-950/10 border-red-500/20 text-rose-400/90' 
                        : 'bg-[#001c27] border-secondary/20 text-[#c8e7fb]'
                    }`}
                  >
                    <div className="flex flex-col text-left max-w-[70%]">
                      <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">Ruta {i+1}</span>
                      <span className="text-xs font-bold truncate" title={loc.name}>{loc.name}</span>
                    </div>

                    <button
                      onClick={() => handleToggleRouteLock(loc.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer font-mono ${
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
                <Database className="w-4 h-4 text-[#43e5d4]" />
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

            <div className="bg-[#000d14] p-3 rounded-xl border border-[#005049]/15 font-mono text-[10px] text-[#43e5d4] h-52 overflow-y-auto select-all shadow-inner">
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
                className="py-2 px-2.5 bg-[#43e5d4]/10 hover:bg-[#43e5d4]/20 border border-[#43e5d4]/25 text-[#43e5d4] font-bold text-[9px] uppercase tracking-wide rounded-xl cursor-pointer transition-all"
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
