import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { X, MapPin } from 'lucide-react';

interface Village {
  name: string;
  displayName: string;
  x: number;
  y: number;
  color: string;
  emoji: string;
}

const VILLAGES: Village[] = [
  { name: 'Konoha', displayName: 'Vila da Folha', x: 50, y: 50, color: '#22c55e', emoji: '🍃' },
  { name: 'Suna', displayName: 'Vila da Areia', x: 20, y: 65, color: '#eab308', emoji: '🏜️' },
  { name: 'Kiri', displayName: 'Vila da Névoa', x: 80, y: 35, color: '#3b82f6', emoji: '🌊' },
  { name: 'Kumo', displayName: 'Vila da Nuvem', x: 70, y: 15, color: '#a855f7', emoji: '⚡' },
  { name: 'Iwa', displayName: 'Vila da Pedra', x: 30, y: 25, color: '#f59e0b', emoji: '🪨' },
];

const LANDMARKS = [
  { name: 'Floresta da Morte', x: 55, y: 55, emoji: '🌲' },
  { name: 'Vale do Fim', x: 60, y: 70, emoji: '⛰️' },
  { name: 'Ponte Naruto', x: 45, y: 40, emoji: '🌉' },
  { name: 'Monte Myōboku', x: 35, y: 35, emoji: '🐸' },
  { name: 'Caverna Akatsuki', x: 15, y: 20, emoji: '☁️' },
];

export default function WorldMap({ onClose }: { onClose: () => void }) {
  const { session } = useGame();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <MapPin className="text-orange-400" size={20} /> Mapa do Mundo Ninja
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition"><X size={20} /></button>
        </div>

        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-green-950/30 via-gray-900 to-blue-950/30 overflow-hidden">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="white" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="white" strokeWidth="0.5" />
            ))}
          </svg>

          {/* Landmarks */}
          {LANDMARKS.map((lm) => (
            <div
              key={lm.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-lg opacity-40 hover:opacity-100 transition cursor-default group"
              style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
              title={lm.name}
            >
              {lm.emoji}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded whitespace-nowrap">
                {lm.name}
              </div>
            </div>
          ))}

          {/* Villages */}
          {VILLAGES.map((v) => {
            const isCurrent = session?.currentLocation?.includes(v.name) ||
                              session?.currentLocation?.includes(v.displayName);
            return (
              <div
                key={v.name}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${v.x}%`, top: `${v.y}%` }}
                onMouseEnter={() => setHovered(v.name)}
                onMouseLeave={() => setHovered(null)}
              >
                {isCurrent && (
                  <div className="absolute inset-0 -m-4 rounded-full animate-ping opacity-30" style={{ backgroundColor: v.color }} />
                )}
                <div className={`relative flex flex-col items-center transition-transform ${hovered === v.name ? 'scale-125' : ''}`}>
                  <span className="text-3xl">{v.emoji}</span>
                  <span className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full ${isCurrent ? 'bg-orange-600 text-white' : 'bg-gray-800/80 text-gray-300'}`}>
                    {v.name}
                  </span>
                  {isCurrent && <span className="text-[10px] text-orange-400 mt-0.5">📍 Você está aqui</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
