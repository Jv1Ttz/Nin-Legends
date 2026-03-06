import { useState, useRef, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Send, Loader2, AlertTriangle, Sparkles } from 'lucide-react';

export default function NarrativeChat() {
  const { messages, sendAction, isLoading, error, choices } = useGame();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, choices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = input.trim();
    if (!action || isLoading) return;
    setInput('');
    await sendAction(action);
  };

  const handleChoice = async (choice: string) => {
    if (isLoading) return;
    await sendAction(choice);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`animate-fadeInUp ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
            {msg.role === 'assistant' ? (
              <div className="space-y-3">
                {msg.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
                    <img src={msg.imageUrl} alt="Cena" className="w-full h-auto max-h-72 object-cover" loading="lazy" />
                  </div>
                )}
                <div className="max-w-none space-y-2">
                  {msg.content.split('\n').map((line, i) => {
                    if (!line.trim()) return null;
                    const isDialogue = line.trim().startsWith('"') || line.trim().startsWith('—') || line.trim().startsWith('–');
                    const isEmphasis = line.trim().startsWith('*') && line.trim().endsWith('*');
                    return (
                      <p key={i} className={`text-sm leading-relaxed ${
                        isDialogue ? 'text-amber-200/90 pl-3 border-l-2 border-amber-700/40' :
                        isEmphasis ? 'italic text-gray-400' :
                        'text-gray-200'
                      }`}>
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-orange-900/30 border border-orange-800/40 rounded-xl rounded-br-sm px-4 py-2.5 max-w-[80%] shadow-lg shadow-orange-950/20">
                <p className="text-orange-100 text-sm">{msg.content}</p>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>O mestre está narrando...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-start gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 animate-fadeInUp">
            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-red-300 font-medium">Erro</p>
              <p className="text-red-400/80 mt-0.5">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
            </div>
          </div>
        )}

        {/* Choice buttons */}
        {choices.length > 0 && !isLoading && (
          <div className="animate-fadeInUp space-y-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Sparkles size={12} className="text-orange-400" />
              <span>Escolha uma ação:</span>
            </div>
            <div className="grid gap-2">
              {choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(choice)}
                  className="text-left px-4 py-2.5 rounded-xl border border-orange-800/30 bg-orange-950/20 hover:bg-orange-900/40 hover:border-orange-600/50 text-orange-100 text-sm transition-all duration-200 hover:shadow-lg hover:shadow-orange-950/30 active:scale-[0.98]"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ou digite sua própria ação..."
            className="flex-1 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white p-3 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
