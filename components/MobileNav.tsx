'use client';

import { Home, Trophy, MessageCircle, User } from 'lucide-react';
import { useState } from 'react';

interface MobileNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const navItems = [
    { id: 'rings', label: 'Play', icon: Home },
    { id: 'leaderboard', label: 'Leaders', icon: Trophy },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/98 backdrop-blur-xl border-t border-gray-800 md:hidden">
      {/* Active indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
      
      <div className="flex justify-around items-center py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isPressed = pressedItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              onTouchStart={() => setPressedItem(item.id)}
              onTouchEnd={() => setPressedItem(null)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all transform ${
                isPressed ? 'scale-90' : isActive ? 'scale-105' : 'scale-100'
              } ${
                isActive 
                  ? 'text-green-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {/* Active background */}
              {isActive && (
                <div className="absolute inset-0 bg-green-500/10 rounded-xl" />
              )}
              
              {/* Icon container with better visual feedback */}
              <div className={`relative ${isActive ? 'mb-1.5' : 'mb-1'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />
                )}
              </div>
              
              <span className={`text-[10px] font-semibold tracking-wide ${
                isActive ? 'text-green-400' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
