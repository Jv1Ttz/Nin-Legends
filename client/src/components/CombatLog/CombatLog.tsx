import { useGame } from '../../contexts/GameContext';
import { useRef, useEffect } from 'react';
import { Swords } from 'lucide-react';

export default function CombatLog() {
  const { combatLog } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [combatLog]);

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Swords size={14} className="text-red-400" /> Log de Combate
      </h3>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
        {combatLog.length === 0 ? (
          <p className="text-xs text-gray-600 italic">Nenhum evento de combate ainda...</p>
        ) : (
          combatLog.map((entry, i) => {
            let color = 'text-gray-400';
            if (entry.includes('Dano')) color = 'text-red-400';
            else if (entry.includes('Cura') || entry.includes('restaurado')) color = 'text-green-400';
            else if (entry.includes('Rolagem')) color = 'text-yellow-400';
            else if (entry.includes('LEVEL UP')) color = 'text-orange-300 font-bold';
            else if (entry.includes('---')) color = 'text-gray-500 font-bold';
            else if (entry.includes('Missão')) color = 'text-blue-400';

            return (
              <div key={i} className={`text-xs font-mono ${color} py-0.5`}>
                {entry}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
