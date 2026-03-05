import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Swords, Eye, Shield, Gauge, Brain, Zap, Plus, Info } from 'lucide-react';
import { characterApi } from '../../services/api';

const STATS = [
  { key: 'ninjutsu', label: 'Ninjutsu', icon: Zap, color: 'text-blue-400' },
  { key: 'taijutsu', label: 'Taijutsu', icon: Swords, color: 'text-red-400' },
  { key: 'genjutsu', label: 'Genjutsu', icon: Eye, color: 'text-purple-400' },
  { key: 'velocidade', label: 'Velocidade', icon: Gauge, color: 'text-green-400' },
  { key: 'resistencia', label: 'Resistência', icon: Shield, color: 'text-amber-400' },
  { key: 'inteligencia', label: 'Inteligência', icon: Brain, color: 'text-cyan-400' },
] as const;

type JutsuDamage = 'Leve' | 'Moderado' | 'Massivo' | 'Suporte';

const JUTSU_INFO: Record<
  string,
  { rank: string; damage: JutsuDamage; description: string }
> = {
  // Básicos da academia
  'Bunshin no Jutsu': {
    rank: 'Rank E',
    damage: 'Suporte',
    description: 'Cria clones ilusórios para confundir inimigos e dividir atenção.',
  },
  'Henge no Jutsu': {
    rank: 'Rank E',
    damage: 'Suporte',
    description: 'Altera a aparência do usuário para enganar, infiltrar ou se esconder.',
  },
  'Kawarimi no Jutsu': {
    rank: 'Rank E',
    damage: 'Suporte',
    description: 'Troca rápida de lugar com um objeto próximo para escapar de ataques.',
  },

  // Elementais básicos
  'Katon: Goukakyuu no Jutsu': {
    rank: 'Rank C',
    damage: 'Moderado',
    description: 'Grande bola de fogo à frente, ideal para ataques frontais focados.',
  },
  'Katon: Hosenka no Jutsu': {
    rank: 'Rank C',
    damage: 'Leve',
    description: 'Série de pequenas bolas de fogo, boa para pressionar e cobrir área.',
  },
  'Suiton: Mizurappa': {
    rank: 'Rank C',
    damage: 'Moderado',
    description: 'Jato de água de alta pressão que empurra e causa dano consistente.',
  },
  'Suiton: Teppoudama': {
    rank: 'Rank C',
    damage: 'Moderado',
    description: 'Projétil de água comprimida que explode ao impacto.',
  },
  'Doton: Doryuuheki': {
    rank: 'Rank B',
    damage: 'Suporte',
    description: 'Ergue uma parede de terra para defesa e controle de terreno.',
  },
  'Fuuton: Daitoppa': {
    rank: 'Rank C',
    damage: 'Moderado',
    description: 'Rajada de vento poderosa que empurra inimigos e reforça chamas.',
  },
  'Raiton: Jibashi': {
    rank: 'Rank C',
    damage: 'Moderado',
    description: 'Descarga elétrica concentrada que pode paralisar brevemente o alvo.',
  },

  // Alguns jutsus de clãs / especiais
  'Kagemane no Jutsu': {
    rank: 'Rank C',
    damage: 'Suporte',
    description: 'Estende a sombra do usuário para imobilizar e controlar o inimigo.',
  },
  'Kugutsu no Jutsu': {
    rank: 'Rank C',
    damage: 'Moderado',
    description: 'Permite manipular marionetes com fios de chakra à distância.',
  },
  'Dokugiri': {
    rank: 'Rank B',
    damage: 'Moderado',
    description: 'Névoa venenosa que causa dano contínuo e enfraquece o alvo.',
  },
  'Suna Shuriken': {
    rank: 'Rank C',
    damage: 'Leve',
    description: 'Shurikens formadas de areia cortante arremessadas em alta velocidade.',
  },
  'Hyoton: Sensatsu Suishou': {
    rank: 'Rank B',
    damage: 'Massivo',
    description: 'Centenas de agulhas de gelo disparam de todas as direções.',
  },
  'Teshi Sendan': {
    rank: 'Rank B',
    damage: 'Massivo',
    description: 'Projéteis ósseos disparados das pontas dos dedos, perfurando defesas.',
  },
  'Futton: Koumu no Jutsu': {
    rank: 'Rank A',
    damage: 'Massivo',
    description: 'Névoa ácida extremamente corrosiva que derrete quase qualquer coisa.',
  },
  'Sabaku Kyuu': {
    rank: 'Rank B',
    damage: 'Massivo',
    description: 'Prende o inimigo em um caixão de areia, preparando para finalizações brutais.',
  },
};

export default function CharSheet() {
  const { character, setCharacter } = useGame();
  const [spendingFor, setSpendingFor] = useState<string | null>(null);
  if (!character) return <div className="p-4 text-gray-500 text-sm">Nenhum personagem</div>;

  const jutsus: string[] = (() => {
    try { return JSON.parse(character.jutsus); } catch { return []; }
  })();

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full scrollbar-thin">
      <div className="border border-gray-800/80 rounded-2xl bg-gray-950/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-100">
            Atributos
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900 border border-gray-700 text-gray-300">
              <Info size={11} className="text-amber-400" />
              Pontos: <span className="font-mono text-amber-300">{character.attrPoints}</span>
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          {STATS.map(({ key, label, icon: Icon, color }) => {
            const val = character[key] as number;
            const canSpend = character.attrPoints > 0;
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-900/70 border border-gray-800/80"
              >
                <span className="flex items-center gap-2 text-sm text-gray-200">
                  <Icon size={14} className={color} />
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${color}`}>
                    Nível {val}
                  </span>
                  <button
                    type="button"
                    disabled={!canSpend || spendingFor === key}
                    onClick={async () => {
                      try {
                        setSpendingFor(key);
                        const res = await characterApi.spendAttrPoint(character.id, key as any);
                        setCharacter(res.data.character);
                      } catch (err) {
                        console.error('Erro ao gastar ponto de atributo', err);
                      } finally {
                        setSpendingFor(null);
                      }
                    }}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-emerald-500/70 text-emerald-300 hover:bg-emerald-600/20 disabled:opacity-40 text-[11px]"
                    title={canSpend ? 'Aumentar este atributo em 1 (gasta pontos)' : 'Sem pontos de atributo disponíveis'}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-gray-800/80 rounded-2xl bg-gray-950/80 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.16em] mb-1">
          Jutsus
        </h3>
        <p className="text-[11px] text-gray-500 mb-3">
          Técnicas conhecidas pelo seu personagem, com rank e impacto aproximado.
        </p>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {jutsus.map((j, i) => (
            <div
              key={i}
              className="text-xs text-gray-200 bg-gray-900/60 rounded-lg px-3 py-2 border border-gray-800/80 hover:border-amber-500/40 hover:bg-gray-900 transition-colors duration-150"
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-semibold text-amber-200">{j}</span>
                {JUTSU_INFO[j] && (
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-800 text-[10px] text-gray-300 border border-gray-700">
                      {JUTSU_INFO[j].rank}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] border ${
                        JUTSU_INFO[j].damage === 'Leve'
                          ? 'bg-emerald-900/40 text-emerald-300 border-emerald-600/50'
                          : JUTSU_INFO[j].damage === 'Moderado'
                          ? 'bg-yellow-900/40 text-yellow-300 border-yellow-600/50'
                          : JUTSU_INFO[j].damage === 'Massivo'
                          ? 'bg-red-900/40 text-red-300 border-red-600/50'
                          : 'bg-blue-900/40 text-blue-300 border-blue-600/50'
                      }`}
                    >
                      {JUTSU_INFO[j].damage}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                {JUTSU_INFO[j]?.description || 'Jutsu narrativo — os detalhes variam conforme a cena.'}
              </p>
            </div>
          ))}
          {jutsus.length === 0 && (
            <p className="text-xs text-gray-600 italic">
              Nenhum jutsu aprendido ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
