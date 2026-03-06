import { useGame } from '../../contexts/GameContext';
import { useRef, useEffect } from 'react';
import { Swords, Heart, Skull } from 'lucide-react';

export default function CombatLog() {
  const { combatLog, enemies, character } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [combatLog]);

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Swords size={14} className="text-red-400" /> Log de Combate
      </h3>

      {/* Resumo rápido do combate */}
      {character && (
        <div className="mb-3 grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center justify-between bg-gray-900/70 border border-gray-800 rounded-lg px-3 py-2">
            <span className="flex items-center gap-2 text-gray-300">
              <Heart size={12} className="text-red-400" />
              {character.name}
            </span>
            <span className="font-mono text-gray-200">
              HP {character.hp}/{character.maxHp} · Chakra {character.chakra}/{character.maxChakra}
            </span>
          </div>

          {enemies.length > 0 && (
            <div className="space-y-1">
              {enemies.map((e, i) => {
                const pct = e.maxHp > 0 ? (e.hp / e.maxHp) * 100 : 0;
                const isDead = e.hp <= 0;
                return (
                  <div
                    key={`${e.name}-${i}`}
                    className={`bg-gray-900/70 border rounded-lg px-3 py-1.5 text-[11px] ${
                      isDead ? 'border-gray-700 opacity-60' : 'border-red-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold ${isDead ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                        {e.name} <span className="text-gray-500 text-[10px]">Nv.{e.level}</span>
                      </span>
                      {isDead && <Skull size={11} className="text-gray-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct > 50 ? 'bg-red-500' : pct > 20 ? 'bg-orange-500' : 'bg-red-800'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-gray-300">
                        {e.hp}/{e.maxHp} HP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
        {combatLog.length === 0 ? (
          <p className="text-xs text-gray-600 italic">Nenhum evento de combate ainda...</p>
        ) : (
          combatLog.map((entry, i) => {
            let color = 'text-gray-400';
            if (entry.includes('Dano recebido')) color = 'text-red-400';
            else if (entry.includes('recebeu -')) color = 'text-green-400';
            else if (entry.includes('Cura') || entry.includes('restaurado')) color = 'text-green-400';
            else if (entry.includes('Rolagem')) color = 'text-yellow-400';
            else if (entry.includes('LEVEL UP')) color = 'text-orange-300 font-bold';
            else if (entry.includes('---')) color = 'text-gray-500 font-bold';
            else if (entry.includes('Missão')) color = 'text-blue-400';
            else if (entry.includes('Novo jutsu aprendido')) color = 'text-purple-300';

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
