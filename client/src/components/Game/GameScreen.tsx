import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import CharacterPanel from '../HUD/CharacterPanel';
import NarrativeChat from '../Chat/NarrativeChat';
import CharSheet from '../CharSheet/CharSheet';
import Inventory from '../Inventory/Inventory';
import CombatLog from '../CombatLog/CombatLog';
import DiceRoller from '../DiceRoller/DiceRoller';
import MissionBoard from '../MissionBoard/MissionBoard';
import WorldMap from '../Map/WorldMap';
import MobileDrawer from './MobileDrawer';
import { useAudio } from '../../hooks/useAudio';
import { LogOut, Map, Scroll, Backpack, Swords, User, Dice5, ArrowLeft, Volume2, VolumeX, Menu, PanelRightOpen } from 'lucide-react';

type RightTab = 'stats' | 'inventory' | 'missions' | 'combat' | 'dice';

const TABS: { id: RightTab; label: string; icon: typeof User }[] = [
  { id: 'stats', label: 'Ficha', icon: User },
  { id: 'inventory', label: 'Itens', icon: Backpack },
  { id: 'missions', label: 'Missões', icon: Scroll },
  { id: 'combat', label: 'Combate', icon: Swords },
  { id: 'dice', label: 'Dados', icon: Dice5 },
];

export default function GameScreen() {
  const { logout } = useAuth();
  const { clearGame, session, combatLog, diceResults, messages } = useGame();
  const [rightTab, setRightTab] = useState<RightTab>('stats');
  const [showMap, setShowMap] = useState(false);
  const [mobileLeft, setMobileLeft] = useState(false);
  const [mobileRight, setMobileRight] = useState(false);
  const audio = useAudio();
  const prevMsgCount = useRef(0);
  const prevCombatLen = useRef(0);

  useEffect(() => {
    if (session?.currentLocation) {
      audio.playAmbient(session.currentLocation);
    }
    return () => { audio.stopAll(); };
  }, []);

  useEffect(() => {
    if (session?.currentLocation) {
      const lastCombatStart = combatLog.lastIndexOf('--- COMBATE INICIADO ---');
      const lastCombatEnd = combatLog.lastIndexOf('--- COMBATE ENCERRADO ---');
      const inCombat = lastCombatStart > lastCombatEnd;
      if (inCombat) {
        audio.playCombatMusic();
      } else {
        audio.playAmbient(session.currentLocation);
      }
    }
  }, [session?.currentLocation, combatLog, audio]);

  useEffect(() => {
    if (messages.length > prevMsgCount.current && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant') audio.playSfx('message');
    }
    prevMsgCount.current = messages.length;
  }, [messages, audio]);

  useEffect(() => {
    if (diceResults.length > 0) audio.playSfx('dice');
  }, [diceResults, audio]);

  useEffect(() => {
    if (combatLog.length > prevCombatLen.current) {
      const newEntries = combatLog.slice(prevCombatLen.current);
      for (const entry of newEntries) {
        if (entry.includes('Dano')) audio.playSfx('hit');
        else if (entry.includes('LEVEL UP')) audio.playSfx('levelup');
        else if (entry.includes('Missão completada')) audio.playSfx('mission');
      }
    }
    prevCombatLen.current = combatLog.length;
  }, [combatLog, audio]);

  const handleExit = () => {
    audio.stopAll();
    clearGame();
  };

  const rightTabContent = (
    <>
      {rightTab === 'stats' && <CharSheet />}
      {rightTab === 'inventory' && <Inventory />}
      {rightTab === 'missions' && <MissionBoard />}
      {rightTab === 'combat' && <CombatLog />}
      {rightTab === 'dice' && <DiceRoller />}
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="h-12 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between px-3 sm:px-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={handleExit} className="text-gray-400 hover:text-orange-400 transition" title="Voltar">
            <ArrowLeft size={18} />
          </button>
          <button onClick={() => setMobileLeft(true)} className="lg:hidden text-gray-400 hover:text-orange-400 transition">
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 hidden sm:block">
            忍 NIN LEGENDS
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowMap(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-400 bg-gray-800 hover:bg-gray-700 px-2 sm:px-3 py-1.5 rounded-lg transition"
          >
            <Map size={14} /> <span className="hidden sm:inline">Mapa</span>
          </button>
          <button onClick={() => setMobileRight(true)} className="md:hidden text-gray-400 hover:text-orange-400 bg-gray-800 hover:bg-gray-700 p-1.5 rounded-lg transition">
            <PanelRightOpen size={14} />
          </button>
          <button
            onClick={audio.toggleMute}
            className="text-gray-500 hover:text-orange-400 transition p-1.5 rounded-lg hover:bg-gray-800"
            title={audio.muted ? 'Ativar som' : 'Silenciar'}
          >
            {audio.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={logout} className="text-gray-500 hover:text-red-400 transition" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Character (desktop) */}
        <aside className="w-64 bg-gray-900/50 border-r border-gray-800 p-4 overflow-y-auto scrollbar-thin shrink-0 hidden lg:block">
          <CharacterPanel />
        </aside>

        {/* Center - Narrative */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-950">
          <NarrativeChat />
        </main>

        {/* Right panel - Tabs (desktop) */}
        <aside className="w-72 bg-gray-900/50 border-l border-gray-800 flex flex-col shrink-0 hidden md:flex">
          <div className="flex border-b border-gray-800 shrink-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setRightTab(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition ${
                  rightTab === id
                    ? 'text-orange-400 border-b-2 border-orange-500 bg-gray-800/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                title={label}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">{rightTabContent}</div>
        </aside>
      </div>

      {/* Mobile drawers */}
      <MobileDrawer open={mobileLeft} onClose={() => setMobileLeft(false)} side="left" title="Personagem">
        <div className="p-4"><CharacterPanel /></div>
      </MobileDrawer>

      <MobileDrawer open={mobileRight} onClose={() => setMobileRight(false)} side="right" title="Painel">
        <div className="flex border-b border-gray-800 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setRightTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition ${
                rightTab === id
                  ? 'text-orange-400 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">{rightTabContent}</div>
      </MobileDrawer>

      {/* Map modal */}
      {showMap && <WorldMap onClose={() => setShowMap(false)} />}
    </div>
  );
}
