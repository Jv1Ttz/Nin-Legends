export interface User {
  id: string;
  username: string;
}

export interface ClanInfo {
  id: string;
  name: string;
  village: string;
  description: string;
  modifiers: Record<string, number>;
  passive: { name: string; description: string };
  starterJutsu: string;
  lore: string;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  clan: string;
  village: string;
  element: string;
  imageUrl?: string | null;
  rank: string;
  level: number;
  xp: number;
  xpToNext: number;
  attrPoints: number;
  hp: number;
  maxHp: number;
  chakra: number;
  maxChakra: number;
  ninjutsu: number;
  taijutsu: number;
  genjutsu: number;
  velocidade: number;
  resistencia: number;
  inteligencia: number;
  jutsus: string;
  ryou: number;
  inventory: InventoryItem[];
  missions?: Mission[];
  sessions?: GameSession[];
}

export interface InventoryItem {
  id: string;
  characterId: string;
  name: string;
  type: string;
  description: string;
  quantity: number;
  effect: string;
}

export interface GameSession {
  id: string;
  characterId: string;
  currentLocation: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
  timestamp: string;
}

export interface Mission {
  id: string;
  characterId: string;
  rank: string;
  title: string;
  description: string;
  status: string;
  xpReward: number;
  ryouReward: number;
}

export interface CombatEnemy {
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  type: string;
}

export interface DiceResult {
  total: number;
  rolls: number[];
  expression: string;
}

export interface DiceHistoryEntry extends DiceResult {
  source: 'ai' | 'manual';
  timestamp: string;
}

export interface GameActionResponse {
  narrative: string;
  imageUrl?: string | null;
  character: Character;
  choices?: string[];
  diceResults: DiceResult[];
  combatLog: string[];
  stateChanges: Record<string, unknown>;
  newMissions?: { rank: string; title: string; description: string }[];
  completedMissions?: string[];
  enemies?: CombatEnemy[];
  inCombat?: boolean;
}

export interface GameStartResponse {
  session: GameSession;
  narrative?: string;
  imageUrl?: string | null;
  messages?: Message[];
  character: Character;
  choices?: string[];
  diceResults?: DiceResult[];
  combatLog?: string[];
  stateChanges?: Record<string, unknown>;
  enemies?: CombatEnemy[];
  inCombat?: boolean;
}
