import { useState, useEffect } from 'react';
import { characterApi } from '../../services/api';
import type { ClanInfo } from '../../types';
import { ArrowLeft, Flame, Droplets, Mountain, Wind, Zap, Shield, Swords, ChevronRight, ChevronLeft } from 'lucide-react';

const ELEMENT_CONFIG: Record<string, { icon: typeof Flame; color: string; bg: string }> = {
  Katon: { icon: Flame, color: 'text-red-400', bg: 'bg-red-900/30 border-red-700/50' },
  Suiton: { icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700/50' },
  Doton: { icon: Mountain, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700/50' },
  Fuuton: { icon: Wind, color: 'text-green-400', bg: 'bg-green-900/30 border-green-700/50' },
  Raiton: { icon: Zap, color: 'text-yellow-300', bg: 'bg-yellow-900/30 border-yellow-700/50' },
};

const VILLAGE_INFO: Record<string, { emoji: string; desc: string }> = {
  Konoha: { emoji: '\u{1F343}', desc: 'Vila Oculta da Folha' },
  Suna: { emoji: '\u{1F3DC}\uFE0F', desc: 'Vila Oculta da Areia' },
  Kiri: { emoji: '\u{1F30A}', desc: 'Vila Oculta da N\u00E9voa' },
  Kumo: { emoji: '\u26A1', desc: 'Vila Oculta da Nuvem' },
  Iwa: { emoji: '\u{1FAA8}', desc: 'Vila Oculta da Pedra' },
};

const MODIFIER_LABELS: Record<string, string> = {
  ninjutsu: 'NIN', taijutsu: 'TAI', genjutsu: 'GEN',
  velocidade: 'VEL', resistencia: 'RES', inteligencia: 'INT',
  maxHp: 'HP', maxChakra: 'CHK',
};

function ModifierBadge({ stat, value }: { stat: string; value: number }) {
  const label = MODIFIER_LABELS[stat] || stat;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
      isPositive ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
    }`}>
      {label} {isPositive ? '+' : ''}{value}
    </span>
  );
}

type Step = 'name' | 'village' | 'clan' | 'element';

export default function CharacterCreate({ onBack }: { onBack: () => void }) {
  const [villages, setVillages] = useState<string[]>([]);
  const [elements, setElements] = useState<string[]>([]);
  const [clans, setClans] = useState<ClanInfo[]>([]);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [clan, setClan] = useState('');
  const [element, setElement] = useState('');
  const [appearance, setAppearance] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState<Step>('name');

  useEffect(() => {
    characterApi.options().then((res) => {
      setVillages(res.data.villages);
      setElements(res.data.elements);
      setClans(res.data.clans || []);
    });
  }, []);

  const villageClans = clans.filter((c) => c.village === village);
  const selectedClan = clans.find((c) => c.id === clan);

  const handleNext = () => {
    if (step === 'name' && name.trim()) setStep('village');
    else if (step === 'village' && village) { setClan(''); setStep('clan'); }
    else if (step === 'clan' && clan) setStep('element');
  };

  const handleBack = () => {
    if (step === 'village') setStep('name');
    else if (step === 'clan') setStep('village');
    else if (step === 'element') setStep('clan');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !village || !element || !clan) {
      setError('Preencha todos os campos');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await characterApi.create(name, village, element, clan, appearance);
      onBack();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Erro ao criar personagem');
      }
    } finally {
      setCreating(false);
    }
  };

  const steps: Step[] = ['name', 'village', 'clan', 'element'];
  const stepIndex = steps.indexOf(step);
  const stepLabels = ['Nome', 'Vila', 'Cl\u00E3', 'Elemento'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-orange-400 mb-6 transition">
          <ArrowLeft size={18} /> Voltar
        </button>

        <h2 className="text-2xl font-bold text-gray-100 mb-2">Criar Novo Ninja</h2>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                i === stepIndex ? 'bg-orange-600 text-white' :
                i < stepIndex ? 'bg-orange-900/40 text-orange-300' :
                'bg-gray-800 text-gray-500'
              }`}>
                <span>{i + 1}.</span> {label}
              </div>
              {i < stepLabels.length - 1 && <ChevronRight size={14} className="text-gray-600" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Step 1: Name + Appearance */}
          {step === 'name' && (
            <div className="animate-fadeInUp">
              <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Ninja</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                placeholder="Ex: Takeshi Uzumaki"
                autoFocus
              />
              <label className="block text-sm font-medium text-gray-400 mt-4 mb-1">
                Descrição visual (opcional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Explique rapidamente como seu ninja se parece (cabelos, roupas, traços marcantes). Isso será usado para gerar uma arte de avatar.
              </p>
              <textarea
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition resize-none"
                placeholder="Ex: Cabelo preto espetado, bandana de Konoha na testa, jaqueta laranja e preta, cicatriz no olho direito..."
              />
              <button
                type="button"
                onClick={handleNext}
                disabled={!name.trim()}
                className="mt-4 w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Pr\u00F3ximo <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Village */}
          {step === 'village' && (
            <div className="animate-fadeInUp">
              <label className="block text-sm font-medium text-gray-400 mb-3">Vila</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {villages.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setVillage(v); setClan(''); }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      village === v
                        ? 'bg-orange-900/30 border-orange-500 ring-1 ring-orange-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{VILLAGE_INFO[v]?.emoji || '\u{1F3EF}'}</span>
                    <div className="text-sm font-medium text-gray-200 mt-1">{v}</div>
                    <div className="text-xs text-gray-500">{VILLAGE_INFO[v]?.desc || ''}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={handleBack} className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 transition flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Voltar
                </button>
                <button type="button" onClick={handleNext} disabled={!village} className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Pr\u00F3ximo <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Clan */}
          {step === 'clan' && (
            <div className="animate-fadeInUp">
              <label className="block text-sm font-medium text-gray-400 mb-1">Cl\u00E3 de {village}</label>
              <p className="text-xs text-gray-500 mb-3">Cada cl\u00E3 tem modificadores de atributo e uma habilidade passiva \u00FAnica.</p>
              <div className="space-y-3">
                {villageClans.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setClan(c.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      clan === c.id
                        ? 'bg-orange-900/20 border-orange-500 ring-1 ring-orange-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-base font-bold text-gray-100 flex items-center gap-2">
                          <Swords size={16} className="text-orange-400" />
                          {c.name}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Object.entries(c.modifiers).map(([stat, val]) => (
                        <ModifierBadge key={stat} stat={stat} value={val} />
                      ))}
                    </div>
                    <div className="flex items-start gap-1.5 text-xs">
                      <Shield size={12} className="text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-purple-300">
                        <span className="font-semibold">{c.passive.name}:</span>{' '}
                        <span className="text-gray-400">{c.passive.description}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 italic mt-2">{c.lore}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={handleBack} className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 transition flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Voltar
                </button>
                <button type="button" onClick={handleNext} disabled={!clan} className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Pr\u00F3ximo <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Element + Review + Create */}
          {step === 'element' && (
            <div className="animate-fadeInUp">
              <label className="block text-sm font-medium text-gray-400 mb-3">Elemento</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {elements.map((el) => {
                  const config = ELEMENT_CONFIG[el];
                  const Icon = config?.icon || Flame;
                  return (
                    <button
                      key={el}
                      type="button"
                      onClick={() => setElement(el)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        element === el
                          ? `${config?.bg || ''} ring-1 ring-orange-500 border-orange-500`
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon className={config?.color || 'text-gray-400'} size={24} />
                      <div className="text-sm font-medium text-gray-200 mt-1">{el}</div>
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              {element && selectedClan && (
                <div className="mt-4 p-4 rounded-xl bg-gray-800/60 border border-gray-700 space-y-2">
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Resumo</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-gray-500">Nome:</span>
                    <span className="text-gray-200">{name}</span>
                    <span className="text-gray-500">Vila:</span>
                    <span className="text-gray-200">{VILLAGE_INFO[village]?.emoji} {village}</span>
                    <span className="text-gray-500">Cl\u00E3:</span>
                    <span className="text-gray-200">{selectedClan.name}</span>
                    <span className="text-gray-500">Elemento:</span>
                    <span className="text-gray-200">{element}</span>
                    <span className="text-gray-500">Passiva:</span>
                    <span className="text-purple-300">{selectedClan.passive.name}</span>
                    <span className="text-gray-500">Jutsu do cl\u00E3:</span>
                    <span className="text-orange-300">{selectedClan.starterJutsu}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={handleBack} className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 transition flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Voltar
                </button>
                <button
                  type="submit"
                  disabled={creating || !element}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {creating ? 'Criando...' : 'Criar Ninja'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
