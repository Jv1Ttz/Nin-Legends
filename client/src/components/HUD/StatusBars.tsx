import { useGame } from '../../contexts/GameContext';
import { Heart, Zap, Star, Coins } from 'lucide-react';

function Bar({ value, max, color, bgColor, icon: Icon, label }: {
  value: number; max: number; color: string; bgColor: string;
  icon: typeof Heart; label: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-gray-400">
          <Icon size={12} className={color} /> {label}
        </span>
        <span className={`font-mono font-medium ${color}`}>{value}/{max}</span>
      </div>
      <div className={`h-3 rounded-full ${bgColor} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function StatusBars() {
  const { character } = useGame();
  if (!character) return null;

  const xpPct = character.xpToNext > 0 ? (character.xp / character.xpToNext) * 100 : 0;

  return (
    <div className="space-y-3">
      <Bar value={character.hp} max={character.maxHp} color="text-red-500" bgColor="bg-red-950/50" icon={Heart} label="HP" />
      <Bar value={character.chakra} max={character.maxChakra} color="text-blue-500" bgColor="bg-blue-950/50" icon={Zap} label="Chakra" />

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-gray-400">
            <Star size={12} className="text-yellow-500" /> XP
          </span>
          <span className="font-mono font-medium text-yellow-500">{character.xp}/{character.xpToNext}</span>
        </div>
        <div className="h-2 rounded-full bg-yellow-950/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-yellow-500 transition-all duration-700"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
        <Coins size={12} className="text-amber-400" />
        <span className="text-amber-400 font-medium">{character.ryou}</span> Ryou
      </div>
    </div>
  );
}
