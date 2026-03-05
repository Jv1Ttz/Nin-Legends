import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import StatusBars from './StatusBars';
import { MapPin, Shield, Flame, Droplets, Mountain, Wind, Zap, Sparkles, Loader2 } from 'lucide-react';
import { characterApi } from '../../services/api';

const ELEMENT_ICON: Record<string, typeof Flame> = {
  Katon: Flame, Suiton: Droplets, Doton: Mountain, Fuuton: Wind, Raiton: Zap,
};
const ELEMENT_COLOR: Record<string, string> = {
  Katon: 'text-red-400', Suiton: 'text-blue-400', Doton: 'text-amber-400',
  Fuuton: 'text-green-400', Raiton: 'text-yellow-300',
};

const RANK_COLORS: Record<string, string> = {
  Estudante: 'bg-gray-700 text-gray-300',
  Genin: 'bg-green-900/60 text-green-300',
  Chunin: 'bg-blue-900/60 text-blue-300',
  Jounin: 'bg-purple-900/60 text-purple-300',
  ANBU: 'bg-red-900/60 text-red-300',
  Kage: 'bg-orange-900/60 text-orange-300',
};

export default function CharacterPanel() {
  const { character, session, setCharacter } = useGame();
  const [isReimagining, setIsReimagining] = useState(false);
  const [showReimagineBox, setShowReimagineBox] = useState(false);
  const [reimagineContext, setReimagineContext] = useState('');
  if (!character) return null;

  const ElIcon = ELEMENT_ICON[character.element] || Flame;
  const elColor = ELEMENT_COLOR[character.element] || 'text-gray-400';

  return (
    <div className="space-y-4">
      {/* Avatar + Reimagine */}
      <div className="relative">
        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden">
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl select-none">忍</div>
          )}
        </div>
        <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs px-3 py-0.5 rounded-full font-medium ${RANK_COLORS[character.rank] || 'bg-gray-700 text-gray-300'}`}>
          {character.rank}
        </span>
        <button
          type="button"
          disabled={isReimagining}
          onClick={() => setShowReimagineBox((v) => !v)}
          className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 border border-amber-500/60 text-[10px] text-amber-100 hover:bg-black/80 hover:border-amber-400 transition disabled:opacity-60"
        >
          <Sparkles size={10} />
          Reimaginar
        </button>
      </div>

      {/* Info */}
      <div className="text-center pt-2">
        <h2 className="text-lg font-bold text-gray-100">{character.name}</h2>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-1">
          <ElIcon size={14} className={elColor} />
          <span className={elColor}>{character.element}</span>
          <span className="text-gray-600">·</span>
          <Shield size={14} className="text-gray-500" />
          <span>Nv. {character.level}</span>
        </div>
      </div>

      {/* Caixa de contexto para reimaginar avatar */}
      {showReimagineBox && (
        <div className="space-y-2 bg-gray-900/70 border border-gray-800 rounded-xl p-3 text-xs">
          <p className="text-gray-300 font-semibold flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            Novo contexto visual
          </p>
          <p className="text-gray-500">
            Descreva como você quer que o avatar pareça (roupa, idade, expressão, pose, cenário, etc.).
          </p>
          <textarea
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500"
            rows={3}
            placeholder="Ex.: kunoichi adolescente de Konoha, cabelo preto preso em rabo de cavalo, bandana na testa, roupa de treino vermelha, pose confiante..."
            value={reimagineContext}
            onChange={(e) => setReimagineContext(e.target.value)}
            disabled={isReimagining}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-2 py-1 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-[11px]"
              onClick={() => {
                setShowReimagineBox(false);
                setReimagineContext('');
              }}
              disabled={isReimagining}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-[11px] text-black font-semibold disabled:opacity-60"
              disabled={isReimagining || !reimagineContext.trim()}
              onClick={async () => {
                try {
                  setIsReimagining(true);
                  const res = await characterApi.reimagineAvatar(character.id, reimagineContext.trim());
                  setCharacter(res.data.character);
                } catch (err) {
                  console.error('Erro ao reimaginar avatar', err);
                } finally {
                  setIsReimagining(false);
                }
              }}
            >
              {isReimagining ? (
                <>
                  <Loader2 size={10} className="animate-spin" />
                  Reimaginando...
                </>
              ) : (
                'Gerar'
              )}
            </button>
          </div>
        </div>
      )}

      <StatusBars />

      {/* Location */}
      <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded-lg p-2">
        <MapPin size={14} className="text-orange-400 shrink-0" />
        <span>{session?.currentLocation || character.village}</span>
      </div>
    </div>
  );
}
