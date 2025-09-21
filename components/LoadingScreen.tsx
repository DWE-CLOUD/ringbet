"use client";

import { useState, useEffect } from 'react';
import { Wifi, Database, Gamepad2 } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    { icon: Database, text: 'Loading game tables...', color: 'text-blue-400' },
    { icon: Wifi, text: 'Syncing with servers...', color: 'text-green-400' },
    { icon: Gamepad2, text: 'Preparing your experience...', color: 'text-purple-400' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        
        const newProgress = prev + Math.random() * 15 + 5;
        const stepIndex = Math.floor((newProgress / 100) * loadingSteps.length);
        setCurrentStep(Math.min(stepIndex, loadingSteps.length - 1));
        
        return Math.min(newProgress, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete, loadingSteps.length]);

  const CurrentIcon = loadingSteps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating casino chips */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-green-500 rounded-full animate-bounce opacity-70" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-yellow-500 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s', animationDuration: '2.8s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-4 h-4 bg-purple-500 rounded-full animate-bounce opacity-55" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}></div>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md mx-auto px-8">
        {/* Casino Roulette Wheel Logo */}
        <div className="relative mx-auto w-32 h-32">
          {/* Multi-layered Outer Glow */}
          <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute inset-2 bg-green-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Rotating Ring Effects */}
          <div className="absolute inset-0 border-4 border-emerald-400 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
          <div className="absolute inset-2 border-2 border-green-400/60 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-4 border border-emerald-400/40 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
          
          {/* Enhanced Center Hub with Big R */}
          <div className="absolute inset-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-full border-4 border-emerald-400 flex items-center justify-center shadow-2xl"
               style={{ boxShadow: '0 0 60px rgba(16, 185, 129, 1), inset 0 0 40px rgba(0,0,0,0.9)' }}>
            <div className="text-5xl font-black text-emerald-400 animate-pulse"
                 style={{ textShadow: '0 0 30px rgba(16, 185, 129, 1), 0 0 60px rgba(16, 185, 129, 0.8), 0 0 90px rgba(16, 185, 129, 0.6)' }}>
              R
            </div>
          </div>
          
          {/* Spinning numbers around the wheel */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-xs text-red-400 font-bold animate-bounce">32</div>
          <div className="absolute top-1/2 right-0 transform translate-x-1 -translate-y-1/2 text-xs text-green-400 font-bold animate-bounce" style={{ animationDelay: '0.5s' }}>15</div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 text-xs text-red-400 font-bold animate-bounce" style={{ animationDelay: '1s' }}>8</div>
          <div className="absolute top-1/2 left-0 transform -translate-x-1 -translate-y-1/2 text-xs text-green-400 font-bold animate-bounce" style={{ animationDelay: '1.5s' }}>21</div>
        </div>

        {/* Brand Name */}
        <div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            RingBet
          </h1>
          <p className="text-gray-400 text-lg">Where Every Spin Counts</p>
        </div>

        {/* Loading Progress */}
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="absolute -top-8 right-0 text-sm font-bold text-green-400">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Current Step */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`p-3 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 ${loadingSteps[currentStep].color}`}>
              <CurrentIcon className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-gray-300 font-medium">{loadingSteps[currentStep].text}</div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-gray-500 text-xs">
          <p>Preparing the tables • Shuffling the deck • Ready to play</p>
        </div>
      </div>
    </div>
  );
}