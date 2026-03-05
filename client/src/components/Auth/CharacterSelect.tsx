import { useState, useEffect } from 'react';
import { characterApi } from '../../services/api';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Character } from '../../types';
import CharacterCreate from './CharacterCreate';
import { LogOut, Plus, Play, Scroll, Trash2 } from 'lucide-react';

const VILLAGE_ICONS: Record<string, string> = {
  Konoha: '🍃', Suna: '🏜️', Kiri: '🌊', Kumo: '⚡', Iwa: '🪨',
};

const ELEMENT_COLORS: Record<string, string> = {
  Katon: 'text-red-400', Suiton: 'text-blue-400', Doton: 'text-amber-400',
  Fuuton: 'text-green-400', Raiton: 'text-yellow-300',
};

export default function CharacterSelect() {
  const { logout } = useAuth();
  const { startGame } = useGame();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadCharacters = async () => {
    try {
      const res = await characterApi.list();
      setCharacters(res.data.characters);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCharacters(); }, []);

  const handleStart = async (charId: string) => {
    setStarting(charId);
    await startGame(charId);
  };

  const handleDelete = async (charId: string, name: string) => {
    const confirmDelete = window.confirm(
      `Excluir o ninja "${name}" e todo o histórico dele? Essa ação não pode ser desfeita.`
    );
    if (!confirmDelete) return;

    setDeleting(charId);
    try {
      await characterApi.delete(charId);
      await loadCharacters();
    } finally {
      setDeleting(null);
    }
  };

  if (showCreate) {
    return <CharacterCreate onBack={() => { setShowCreate(false); loadCharacters(); }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              忍 NIN LEGENDS
            </h1>
            <p className="text-gray-500 text-sm">Selecione seu ninja</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition text-sm">
            <LogOut size={16} /> Sair
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {characters.map((c) => (
                <div
                  key={c.id}
                  className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 hover:border-orange-600/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-100">{c.name}</h3>
                      <p className="text-sm text-gray-400">
                        {VILLAGE_ICONS[c.village] || '🏯'} {c.village} · <span className={ELEMENT_COLORS[c.element] || ''}>{c.element}</span>
                      </p>
                    </div>
                    <span className="bg-orange-900/40 text-orange-300 text-xs px-2 py-1 rounded-full font-medium">
                      {c.rank}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-4">
                    <div>Nv. <span className="text-gray-200 font-medium">{c.level}</span></div>
                    <div>HP <span className="text-red-400 font-medium">{c.hp}/{c.maxHp}</span></div>
                    <div>Chakra <span className="text-blue-400 font-medium">{c.chakra}/{c.maxChakra}</span></div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStart(c.id)}
                      disabled={starting === c.id || deleting === c.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                      {starting === c.id ? (
                        <Scroll className="animate-spin" size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      {starting === c.id ? 'Entrando no mundo...' : 'Jogar'}
                    </button>

                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={deleting === c.id || starting === c.id}
                      className="px-3 py-2 rounded-lg border border-red-800/60 text-red-300 text-xs flex items-center gap-1 hover:bg-red-900/40 transition disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="w-full border-2 border-dashed border-gray-700 hover:border-orange-600/50 rounded-xl p-6 text-gray-400 hover:text-orange-400 transition flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Criar Novo Ninja
            </button>
          </>
        )}
      </div>
    </div>
  );
}
