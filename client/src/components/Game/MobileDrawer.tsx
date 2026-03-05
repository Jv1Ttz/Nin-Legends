import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  title: string;
  children: ReactNode;
}

export default function MobileDrawer({ open, onClose, side, title, children }: MobileDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-72 bg-gray-900 border-${side === 'left' ? 'r' : 'l'} border-gray-800 shadow-2xl flex flex-col animate-slideIn`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: `slideIn${side === 'left' ? 'Left' : 'Right'} 0.2s ease-out`,
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-sm font-bold text-gray-300">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
