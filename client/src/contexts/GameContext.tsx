import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { gameApi } from '../services/api';
import type { Character, GameSession, Message, DiceResult, DiceHistoryEntry, CombatEnemy } from '../types';

interface GameContextType {
  character: Character | null;
  session: GameSession | null;
  messages: Message[];
  combatLog: string[];
  diceResults: DiceResult[];
  diceHistory: DiceHistoryEntry[];
  choices: string[];
  inCombat: boolean;
  enemies: CombatEnemy[];
  isLoading: boolean;
  error: string | null;
  startGame: (characterId: string) => Promise<void>;
  sendAction: (action: string) => Promise<void>;
  setCharacter: (c: Character | null) => void;
  addManualDiceRoll: (entry: DiceHistoryEntry) => void;
  clearGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [diceResults, setDiceResults] = useState<DiceResult[]>([]);
  const [diceHistory, setDiceHistory] = useState<DiceHistoryEntry[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [inCombat, setInCombat] = useState(false);
  const [enemies, setEnemies] = useState<CombatEnemy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const msgIdCounter = useRef(0);

  const startGame = useCallback(async (characterId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await gameApi.start(characterId);
      setSession(res.data.session);
      setCharacter(res.data.character);

      if (res.data.messages) {
        setMessages(res.data.messages);
      } else if (res.data.narrative) {
        const msg: Message = {
          id: `local-${msgIdCounter.current++}`,
          sessionId: res.data.session.id,
          role: 'assistant',
          content: res.data.narrative,
          imageUrl: res.data.imageUrl,
          timestamp: new Date().toISOString(),
        };
        setMessages([msg]);
      }

      if (res.data.combatLog?.length) setCombatLog(res.data.combatLog);
      if (res.data.diceResults?.length) {
        setDiceResults(res.data.diceResults);
        const aiEntries: DiceHistoryEntry[] = res.data.diceResults.map((d: DiceResult) => ({
          ...d, source: 'ai' as const, timestamp: new Date().toISOString(),
        }));
        setDiceHistory((prev) => [...prev, ...aiEntries]);
      }
      if (res.data.choices?.length) setChoices(res.data.choices);
      if (res.data.inCombat) setInCombat(true);
      if (res.data.enemies?.length) setEnemies(res.data.enemies);
    } catch (err: unknown) {
      let message = 'Erro ao iniciar jogo';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string; detail?: string } } };
        message = axiosErr.response?.data?.detail || axiosErr.response?.data?.error || message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendAction = useCallback(async (action: string) => {
    if (!session) return;
    setIsLoading(true);
    setError(null);
    setChoices([]);

    const userMsg: Message = {
      id: `local-${msgIdCounter.current++}`,
      sessionId: session.id,
      role: 'user',
      content: action,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await gameApi.action(session.id, action, inCombat);
      const assistantMsg: Message = {
        id: `local-${msgIdCounter.current++}`,
        sessionId: session.id,
        role: 'assistant',
        content: res.data.narrative,
        imageUrl: res.data.imageUrl,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setCharacter(res.data.character);

      if (res.data.combatLog?.length) {
        setCombatLog((prev) => [...prev, ...res.data.combatLog]);
      }
      if (res.data.diceResults?.length) {
        setDiceResults(res.data.diceResults);
        const aiEntries: DiceHistoryEntry[] = res.data.diceResults.map((d: DiceResult) => ({
          ...d, source: 'ai' as const, timestamp: new Date().toISOString(),
        }));
        setDiceHistory((prev) => [...prev, ...aiEntries]);
      }
      if (res.data.stateChanges?.location) {
        setSession((prev) => prev ? { ...prev, currentLocation: res.data.stateChanges.location as string } : prev);
      }
      if (res.data.choices?.length) setChoices(res.data.choices);

      if (res.data.inCombat !== undefined) {
        setInCombat(res.data.inCombat);
      }
      if (res.data.enemies?.length) {
        setEnemies(res.data.enemies);
      } else if (res.data.inCombat === false) {
        setEnemies([]);
      }
    } catch (err: unknown) {
      let message = 'Erro ao processar ação';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string; detail?: string } } };
        message = axiosErr.response?.data?.detail || axiosErr.response?.data?.error || message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const addManualDiceRoll = useCallback((entry: DiceHistoryEntry) => {
    setDiceHistory((prev) => [...prev, entry]);
  }, []);

  const clearGame = useCallback(() => {
    setCharacter(null);
    setSession(null);
    setMessages([]);
    setCombatLog([]);
    setDiceResults([]);
    setDiceHistory([]);
    setChoices([]);
    setInCombat(false);
    setEnemies([]);
  }, []);

  return (
    <GameContext.Provider value={{
      character, session, messages, combatLog, diceResults, diceHistory, choices,
      inCombat, enemies,
      isLoading, error, startGame, sendAction, setCharacter, addManualDiceRoll, clearGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
