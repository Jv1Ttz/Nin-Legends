import { useGame } from '../../contexts/GameContext';
import { Package, Sword, FlaskConical, Shirt, HelpCircle } from 'lucide-react';

const TYPE_ICON: Record<string, typeof Package> = {
  weapon: Sword,
  consumable: FlaskConical,
  armor: Shirt,
};

const TYPE_COLOR: Record<string, string> = {
  weapon: 'text-red-400 bg-red-900/20',
  consumable: 'text-green-400 bg-green-900/20',
  armor: 'text-blue-400 bg-blue-900/20',
};

export default function Inventory() {
  const { character } = useGame();
  if (!character) return null;

  const items = character.inventory || [];

  return (
    <div className="p-4 overflow-y-auto h-full scrollbar-thin">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Inventário</h3>

      {items.length === 0 ? (
        <p className="text-xs text-gray-600">Inventário vazio</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = TYPE_ICON[item.type] || HelpCircle;
            const colorClass = TYPE_COLOR[item.type] || 'text-gray-400 bg-gray-800/50';
            return (
              <div key={item.id} className="flex items-start gap-3 bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-200">{item.name}</span>
                    <span className="text-xs text-gray-500 font-mono">x{item.quantity}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
