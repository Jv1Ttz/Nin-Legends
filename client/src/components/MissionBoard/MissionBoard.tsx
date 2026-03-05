import { useGame } from '../../contexts/GameContext';
import { useEffect, useState } from 'react';
import { missionApi } from '../../services/api';
import type { Mission } from '../../types';
import { Scroll, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const RANK_COLORS: Record<string, string> = {
  D: 'bg-green-900/40 text-green-400 border-green-700/50',
  C: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
  B: 'bg-purple-900/40 text-purple-400 border-purple-700/50',
  A: 'bg-red-900/40 text-red-400 border-red-700/50',
  S: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
};

const STATUS_ICON: Record<string, typeof Clock> = {
  active: Clock,
  completed: CheckCircle,
  available: AlertTriangle,
};

export default function MissionBoard() {
  const { character } = useGame();
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    if (character) {
      missionApi.list(character.id).then(res => setMissions(res.data.missions)).catch(() => {});
    }
  }, [character]);

  const allMissions = [...missions, ...(character?.missions || [])];
  const unique = allMissions.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);

  return (
    <div className="p-4 overflow-y-auto h-full scrollbar-thin">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Scroll size={14} className="text-orange-400" /> Missões
      </h3>

      {unique.length === 0 ? (
        <div className="text-center py-6">
          <Scroll size={32} className="text-gray-700 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Nenhuma missão ainda.<br />Continue jogando para receber missões!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unique.map((m) => {
            const Icon = STATUS_ICON[m.status] || Clock;
            const rankColor = RANK_COLORS[m.rank] || RANK_COLORS.D;
            return (
              <div key={m.id} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${rankColor}`}>
                        {m.rank}
                      </span>
                      <span className="text-sm font-medium text-gray-200 truncate">{m.title}</span>
                    </div>
                    <p className="text-xs text-gray-500">{m.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                      <span>+{m.xpReward} XP</span>
                      <span>+{m.ryouReward} Ryou</span>
                    </div>
                  </div>
                  <Icon size={16} className={m.status === 'completed' ? 'text-green-500' : 'text-gray-500'} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
