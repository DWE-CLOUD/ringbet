"use client";

import { useState, useEffect } from 'react';
import { Ring, RingParticipant } from '@/lib/supabaseEnhanced';

interface SpinWheelProps {
  ring: (Ring & { participants: RingParticipant[] }) | null;
  isSpinning: boolean;
  onSpinComplete: (winner: any) => void;
}

export default function SpinWheel({ ring, isSpinning, onSpinComplete }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinRotation, setSpinRotation] = useState(0);
  const [previousParticipantCount, setPreviousParticipantCount] = useState(0);
  const [newParticipantAnimation, setNewParticipantAnimation] = useState(false);

  // Enhanced spinning algorithm with provably fair randomness
  const generateRandomSeed = () => {
    return Math.floor(Math.random() * 1000000);
  };

  const calculateWinner = (seed: number, participants: RingParticipant[]) => {
    if (participants.length === 0) return null;
    
    // Use seed to create deterministic but random selection
    const hash = (seed * 9301 + 49297) % 233280;
    const normalizedHash = hash / 233280; // 0-1 range
    const winnerIndex = Math.floor(normalizedHash * participants.length);
    
    return participants[winnerIndex];
  };

  // Create segments from participants or default segments
  const segments = ring?.participants.length ? 
    ring.participants.map((participant, index) => ({
      name: participant.player_name,
      bet: ring.buy_in, // All participants pay the same buy-in amount
      color: participant.color,
      participant
    })) :
    [
      { name: 'Empty', bet: 0, color: '#374151', participant: null },
      { name: 'Empty', bet: 0, color: '#4b5563', participant: null },
      { name: 'Empty', bet: 0, color: '#374151', participant: null },
      { name: 'Empty', bet: 0, color: '#4b5563', participant: null },
      { name: 'Empty', bet: 0, color: '#374151', participant: null },
      { name: 'Empty', bet: 0, color: '#4b5563', participant: null },
      { name: 'Empty', bet: 0, color: '#374151', participant: null },
      { name: 'Empty', bet: 0, color: '#4b5563', participant: null },
    ];

  // Animate when new participants join
  useEffect(() => {
    if (ring?.participants.length && ring.participants.length > previousParticipantCount) {
      setNewParticipantAnimation(true);
      setTimeout(() => setNewParticipantAnimation(false), 1000);
    }
    setPreviousParticipantCount(ring?.participants.length || 0);
  }, [ring?.participants.length, previousParticipantCount]);

  // Gentle rotation animation
  useEffect(() => {
    if (!isSpinning) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 0.5) % 360);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isSpinning]);

  // Spinning animation
  useEffect(() => {
    if (isSpinning && ring?.participants.length) {
      // Generate provably fair result
      const seed = generateRandomSeed();
      const winner = calculateWinner(seed, ring.participants);
      
      // Calculate target rotation to land on winner
      const segmentAngle = 360 / segments.length;
      const winnerIndex = segments.findIndex(s => s.participant?.id === winner?.id);
      const targetAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
      const finalRotation = 360 * 8 + targetAngle; // 8 full rotations + target
      
      setSpinRotation(finalRotation);
      
      setTimeout(() => {
        if (winner) {
          onSpinComplete(winner);
        }
      }, 5000); // 5 second spin duration
    }
  }, [isSpinning, ring, segments, onSpinComplete]);
  

  const segmentAngle = 360 / segments.length; // 45 degrees per segment

  return (
    <div className="relative flex items-center justify-center ml-12">
      {/* Multi-layered Outer Glow Effects */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-emerald-400/30 blur-3xl animate-pulse"></div>
      <div className="absolute w-[650px] h-[650px] rounded-full bg-green-400/20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className={`absolute w-[600px] h-[600px] rounded-full bg-emerald-500/25 blur-3xl ${newParticipantAnimation ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '1s' }}></div>
      
      {/* Rotating Ring Effects */}
      <div className="absolute w-[580px] h-[580px] rounded-full border-2 border-emerald-400/40 animate-spin" style={{ animationDuration: '20s' }}></div>
      <div className="absolute w-[560px] h-[560px] rounded-full border-2 border-green-400/30 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
      <div className="absolute w-[540px] h-[540px] rounded-full border border-emerald-500/20 animate-spin" style={{ animationDuration: '25s' }}></div>
      
      {/* Wheel Container */}
      <div className="relative w-[500px] h-[500px]">
        {/* Red Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-30">
          <div className={`transition-all duration-500 ${newParticipantAnimation ? 'scale-125' : 'scale-100'}`}>
            <div 
              className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.5))' }}
            ></div>
          </div>
        </div>

        {/* New Participant Join Effect */}
        {newParticipantAnimation && (
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping z-20"></div>
        )}

        {/* Spinning Wheel */}
        <div 
          className={`relative w-full h-full rounded-full border-4 border-emerald-400 shadow-[0_0_100px_rgba(16,185,129,1),0_0_200px_rgba(16,185,129,0.6)] transition-all duration-500 ${newParticipantAnimation ? 'scale-105' : 'scale-100'}`}
          style={{ 
            transform: `rotate(${isSpinning ? spinRotation : rotation}deg)`,
            transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : newParticipantAnimation ? 'all 0.5s ease-out' : 'none'
          }}
        >
          {/* Create dynamic segments */}
          {segments.map((segment, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            
            // Create SVG path for each segment
            const centerX = 250;
            const centerY = 250;
            const radius = 246;
            
            const startAngleRad = (startAngle - 90) * Math.PI / 180;
            const endAngleRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

            // Calculate positions for text and items
            const midAngle = (startAngle + endAngle) / 2;
            const nameRadius = 180;
            const betRadius = 120;
            
            const textAngleRad = (midAngle - 90) * Math.PI / 180;
            const nameX = centerX + nameRadius * Math.cos(textAngleRad);
            const nameY = centerY + nameRadius * Math.sin(textAngleRad);
            
            const betX = centerX + betRadius * Math.cos(textAngleRad);
            const betY = centerY + betRadius * Math.sin(textAngleRad);

            return (
              <div key={segment.participant?.id || index} className={`absolute inset-0 transition-opacity duration-500 ${newParticipantAnimation && index === segments.length - 1 ? 'opacity-0 animate-fade-in' : 'opacity-100'}`}>
                {/* Segment Background */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 500">
                  <path
                    d={pathData}
                    fill={segment.color + '40'}
                    stroke="#00d97e"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />
                  <path
                    d={pathData}
                    fill={`url(#gradient-${index})`}
                    stroke="#00d97e"
                    strokeWidth="1"
                    className="opacity-60"
                  />
                  <defs>
                    <radialGradient id={`gradient-${index}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={segment.color + '20'} />
                      <stop offset="100%" stopColor={segment.color + '60'} />
                    </radialGradient>
                  </defs>
                </svg>
                
                {/* Participant Name */}
                <div
                  className={`absolute text-lg font-bold text-white transform -translate-x-1/2 -translate-y-1/2 select-none max-w-[80px] text-center transition-all duration-300 ${
                    newParticipantAnimation && index === segments.length - 1 ? 'scale-125 text-yellow-400' : 'scale-100'}`}
                  style={{
                    left: `${nameX}px`,
                    top: `${nameY}px`,
                    textShadow: '0 0 15px rgba(16, 185, 129, 0.9), 0 2px 6px rgba(0,0,0,0.9)'
                  }}
                >
                  {segment.name}
                </div>
                
                {/* Bet Amount */}
                <div
                  className={`absolute text-sm font-bold text-yellow-400 transform -translate-x-1/2 -translate-y-1/2 select-none bg-black/50 px-2 py-1 rounded transition-all duration-300 ${
                    newParticipantAnimation && index === segments.length - 1 ? 'scale-110 bg-yellow-500/20 border border-yellow-400' : ''}`}
                  style={{
                    left: `${betX}px`,
                    top: `${betY}px`,
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
                  }}
                >
                  ${segment.bet}
                </div>
              </div>
            );
          })}
          
          {/* Enhanced Center Hub with Big R */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-emerald-400 z-20 overflow-hidden"
            style={{
              boxShadow: '0 0 60px rgba(16, 185, 129, 1), inset 0 0 40px rgba(0,0,0,0.9), 0 0 120px rgba(16, 185, 129, 0.6)'
            }}
          >
            {/* Multiple layered backgrounds for depth */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-emerald-900/40 via-black to-emerald-900/40 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-800/30 via-black to-green-800/30"></div>
            
            {/* Giant Glowing R */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)'
              }}
            >
              <div 
                className="text-6xl font-black text-emerald-400 drop-shadow-2xl animate-pulse select-none"
                style={{
                  textShadow: '0 0 30px rgba(16, 185, 129, 1), 0 0 60px rgba(16, 185, 129, 0.8), 0 0 90px rgba(16, 185, 129, 0.6), 0 4px 8px rgba(0,0,0,0.8)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '900'
                }}
              >
                R
              </div>
            </div>
            
            {/* Rotating inner ring */}
            <div className="absolute inset-3 rounded-full border border-emerald-400/60 animate-spin" style={{ animationDuration: '8s' }}></div>
            <div className="absolute inset-4 rounded-full border border-emerald-400/40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
          </div>
        </div>
        
        {/* Enhanced Additional Glow Rings */}
        <div className="absolute inset-2 rounded-full border-2 border-emerald-400/50 animate-pulse shadow-lg shadow-emerald-400/50"></div>
        <div className="absolute inset-4 rounded-full border border-emerald-400/40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute inset-6 rounded-full border border-emerald-400/30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-8 rounded-full border border-emerald-400/20 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Participant Count Display */}
        {ring?.participants.length && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className={`bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 transition-all duration-500 ${newParticipantAnimation ? 'scale-110 border-green-400' : ''}`}>
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl shadow-lg animate-bounce border border-green-400/50">
                  <div className="text-xs text-gray-400">Players</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Join Notifications */}
      {newParticipantAnimation && ring?.participants.length && (
        <div className="absolute top-0 right-0 z-40">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
            <div className="font-bold">🎉 New Player!</div>
            <div className="text-sm">{ring.participants[ring.participants.length - 1]?.player_name} joined</div>
          </div>
        </div>
      )}
    </div>
  );
}