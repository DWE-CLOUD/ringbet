'use client';

import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface CreateRingButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function CreateRingButton({ onClick, disabled = false }: CreateRingButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled}
      className={`
        relative overflow-hidden
        bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500
        hover:from-green-600 hover:via-emerald-600 hover:to-teal-600
        disabled:from-gray-600 disabled:to-gray-700
        text-white font-bold
        px-6 py-4 rounded-2xl
        transition-all duration-200
        transform ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
        shadow-xl hover:shadow-green-500/30
        group
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      `}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Button content */}
      <div className="relative flex items-center justify-center gap-3">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 group-hover:rotate-90 transition-transform duration-300">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-base tracking-wide">Create Ring</span>
        <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Pulse effect */}
      {!disabled && (
        <div className="absolute inset-0 rounded-2xl bg-green-400/20 animate-pulse pointer-events-none" />
      )}
    </button>
  );
}
