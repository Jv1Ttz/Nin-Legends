import { useGame } from '../../contexts/GameContext';
import { Dice5, Dices, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DiceHistoryEntry } from '../../types';

const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const;

function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export default function DiceRoller() {
  const { diceHistory, addManualDiceRoll } = useGame();
  const [selectedDice, setSelectedDice] = useState<number>(20);
  const [modifier, setModifier] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [lastResult, setLastResult] = useState<DiceHistoryEntry | null>(null);

  useEffect(() => {
    if (diceHistory.length > 0) {
      const latest = diceHistory[diceHistory.length - 1];
      setLastResult(latest);
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 800);
      return () => clearTimeout(t);
    }
  }, [diceHistory]);

  const handleRoll = () => {
    const result = rollDice(selectedDice);
    const total = result + modifier;
    const modStr = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
    const expression = `1d${selectedDice}${modStr}`;

    const entry: DiceHistoryEntry = {
      total,
      rolls: [result],
      expression,
      source: 'manual',
      timestamp: new Date().toISOString(),
    };

    addManualDiceRoll(entry);
  };

  const recentHistory = [...diceHistory].reverse().slice(0, 15);

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
        <Dice5 size={14} className="text-yellow-400" /> Dados
      </h3>

      {/* Dice selector */}
      <div className="space-y-3">
        <div className="grid grid-cols-6 gap-1.5">
          {DICE_TYPES.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDice(d)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDice === d
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              d{d}
            </button>
          ))}
        </div>

        {/* Modifier */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-gray-500">Modificador:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setModifier((m) => m - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-mono text-gray-200">
              {modifier >= 0 ? `+${modifier}` : modifier}
            </span>
            <button
              onClick={() => setModifier((m) => m + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Roll button */}
        <button
          onClick={handleRoll}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-950/30"
        >
          <Dices size={16} />
          Rolar 1d{selectedDice}{modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
        </button>
      </div>

      {/* Last result */}
      {lastResult && (
        <div className="text-center space-y-1">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-orange-900/50 to-red-900/50 border-2 border-orange-600/50 ${animating ? 'animate-bounce' : ''}`}>
            <span className="text-2xl font-black text-orange-300">{lastResult.total}</span>
          </div>
          <div className="text-xs text-gray-400">
            <span className="text-gray-500">{lastResult.expression}</span>
            <span className="text-gray-600 mx-1">=</span>
            [{lastResult.rolls.join(', ')}]
            {lastResult.source === 'ai' && (
              <span className="ml-1.5 text-[10px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded">IA</span>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {recentHistory.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-gray-800">
          <p className="text-xs text-gray-500 font-medium">Histórico de rolagens:</p>
          <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
            {recentHistory.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-gray-800/40">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-300 font-bold w-6 text-right">{d.total}</span>
                  <span className="text-gray-500">{d.expression}</span>
                  <span className="text-gray-600">[{d.rolls.join(',')}]</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  d.source === 'ai' ? 'bg-blue-900/40 text-blue-300' : 'bg-gray-700 text-gray-400'
                }`}>
                  {d.source === 'ai' ? 'IA' : 'Manual'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {diceHistory.length === 0 && !lastResult && (
        <div className="text-center py-4">
          <Dice5 size={32} className="text-gray-700 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Selecione um dado e role!</p>
          <p className="text-xs text-gray-700 mt-1">Rolagens da IA também aparecerão aqui</p>
        </div>
      )}
    </div>
  );
}
