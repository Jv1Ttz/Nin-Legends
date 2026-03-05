import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Swords, Shield, Wind, Backpack, DoorOpen, Heart, Zap, Skull } from 'lucide-react';

const ENEMY_TYPE_ICONS: Record<string, string> = {
  ninja: '🥷', bandido: '🗡️', criatura: '🐺', boss: '💀', animal: '🐻',
};

export default function CombatModal() {
  const { character, enemies, isLoading, sendAction, combatLog, choices } = useGame();
  const [customAction, setCustomAction] = useState('');

  if (!character) return null;

  const jutsus: string[] = JSON.parse(character.jutsus || '[]');
  const consumables = character.inventory?.filter(i => i.type === 'consumable' && i.quantity > 0) || [];

  const handleAction = (action: string) => {
    if (isLoading) return;
    sendAction(`AÇÃO_COMBATE: ${action}`);
    setCustomAction('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || isLoading) return;
    sendAction(`AÇÃO_COMBATE: ${customAction.trim()}`);
    setCustomAction('');
  };

  const hpPercent = (character.hp / character.maxHp) * 100;
  const chakraPercent = (character.chakra / character.maxChakra) * 100;

  const recentLog = combatLog.slice(-6);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-gray-900 to-gray-950 border border-red-900/50 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-red-900/20">
        {/* Header */}
        <div className="bg-red-950/60 border-b border-red-900/40 px-4 py-2 flex items-center gap-2">
          <Swords size={16} className="text-red-400" />
          <span className="text-sm font-bold text-red-300 tracking-wide uppercase">Combate</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Enemy cards */}
          <div className="space-y-2">
            {enemies.map((enemy, i) => {
              const eHpPercent = enemy.maxHp > 0 ? (enemy.hp / enemy.maxHp) * 100 : 0;
              const isDead = enemy.hp <= 0;
              return (
                <div key={i} className={`flex items-center gap-3 bg-gray-800/60 rounded-lg p-3 border ${isDead ? 'border-gray-700 opacity-50' : 'border-red-900/30'}`}>
                  <span className="text-2xl">{ENEMY_TYPE_ICONS[enemy.type] || '🥷'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isDead ? 'text-gray-500 line-through' : 'text-gray-100'}`}>{enemy.name}</span>
                      <span className="text-[10px] text-gray-500">Nv.{enemy.level}</span>
                      {isDead && <Skull size={12} className="text-gray-500" />}
                    </div>
                    <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${eHpPercent > 50 ? 'bg-red-500' : eHpPercent > 20 ? 'bg-orange-500' : 'bg-red-700'}`}
                        style={{ width: `${eHpPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{enemy.hp}/{enemy.maxHp} HP</span>
                  </div>
                </div>
              );
            })}
            {enemies.length === 0 && (
              <p className="text-xs text-gray-500 text-center italic">Aguardando inimigos...</p>
            )}
          </div>

          {/* Player status */}
          <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-orange-300">{character.name}</span>
              <span className="text-[10px] text-gray-500">Nv.{character.level}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Heart size={12} className="text-red-400 shrink-0" />
                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-300 w-16 text-right">{character.hp}/{character.maxHp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-blue-400 shrink-0" />
                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${chakraPercent}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-300 w-16 text-right">{character.chakra}/{character.maxChakra}</span>
              </div>
            </div>
          </div>

          {/* Combat log */}
          {recentLog.length > 0 && (
            <div className="bg-gray-900/60 rounded-lg p-2 border border-gray-800/50 max-h-24 overflow-y-auto">
              {recentLog.map((entry, i) => (
                <p key={i} className={`text-[11px] py-0.5 ${
                  entry.includes('Dano recebido') ? 'text-red-400' :
                  entry.includes('recebeu') ? 'text-green-400' :
                  entry.includes('COMBATE') ? 'text-yellow-400 font-bold' :
                  'text-gray-400'
                }`}>{entry}</p>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="border-t border-gray-800 p-3 bg-gray-900/80 space-y-2">
          {/* AI-generated choices */}
          {choices.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5">
              {choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleAction(choice)}
                  disabled={isLoading}
                  className="text-xs px-2 py-2 rounded-lg bg-gray-800 hover:bg-orange-900/40 border border-gray-700 hover:border-orange-600/50 text-gray-200 transition disabled:opacity-40 text-left"
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {/* Quick actions */}
          {choices.length === 0 && (
            <div className="grid grid-cols-5 gap-1.5">
              <button onClick={() => handleAction('Atacar corpo a corpo')} disabled={isLoading}
                className="flex flex-col items-center gap-1 text-[10px] p-2 rounded-lg bg-red-900/30 hover:bg-red-900/60 border border-red-800/40 text-red-300 transition disabled:opacity-40">
                <Swords size={16} /> Atacar
              </button>
              <button onClick={() => handleAction('Defender e observar o inimigo')} disabled={isLoading}
                className="flex flex-col items-center gap-1 text-[10px] p-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/60 border border-blue-800/40 text-blue-300 transition disabled:opacity-40">
                <Shield size={16} /> Defender
              </button>
              <button onClick={() => {
                if (jutsus.length > 0) handleAction(`Usar jutsu: ${jutsus[jutsus.length - 1]}`);
              }} disabled={isLoading || jutsus.length === 0}
                className="flex flex-col items-center gap-1 text-[10px] p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 transition disabled:opacity-40">
                <Wind size={16} /> Jutsu
              </button>
              <button onClick={() => {
                if (consumables.length > 0) handleAction(`Usar item: ${consumables[0].name}`);
              }} disabled={isLoading || consumables.length === 0}
                className="flex flex-col items-center gap-1 text-[10px] p-2 rounded-lg bg-green-900/30 hover:bg-green-900/60 border border-green-800/40 text-green-300 transition disabled:opacity-40">
                <Backpack size={16} /> Item
              </button>
              <button onClick={() => handleAction('Tentar fugir do combate')} disabled={isLoading}
                className="flex flex-col items-center gap-1 text-[10px] p-2 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/40 text-gray-400 transition disabled:opacity-40">
                <DoorOpen size={16} /> Fugir
              </button>
            </div>
          )}

          {/* Free text */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="Descreva sua ação de combate..."
              disabled={isLoading}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !customAction.trim()}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition disabled:opacity-40"
            >
              {isLoading ? '...' : 'Agir'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
