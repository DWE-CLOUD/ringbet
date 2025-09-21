"use client";

export default function RecentWinners() {
  const winners = [
    {
      username: 'jackthehopper',
      multiplier: 'x1',
      weapon: 'AK-47 Redline',
      bgGradient: 'from-red-900 via-red-800 to-red-900',
      weaponColor: '#ff4444',
      multiplierBg: 'bg-yellow-500',
      multiplierText: 'text-black',
    },
    {
      username: 'the griezer',
      multiplier: 'x3',
      weapon: 'M4A4 Howl',
      bgGradient: 'from-cyan-900 via-cyan-800 to-cyan-900',
      weaponColor: '#00ffff',
      multiplierBg: 'bg-cyan-400',
      multiplierText: 'text-black',
    },
    {
      username: 'expationzzz',
      multiplier: 'x1',
      weapon: 'AWP Dragon Lore',
      bgGradient: 'from-yellow-900 via-yellow-800 to-yellow-900',
      weaponColor: '#ffdd00',
      multiplierBg: 'bg-yellow-500',
      multiplierText: 'text-black',
    },
  ];

  return (
    <div className="space-y-8 mt-16">
      <h2 className="text-4xl font-bold text-white">Recent winners</h2>
      
      <div className="grid grid-cols-3 gap-8">
        {winners.map((winner, index) => (
          <div 
            key={index} 
            className="group relative bg-gray-900/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:transform hover:scale-105"
          >
            {/* Header with username and multiplier */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50">
              <span className="text-white font-semibold text-lg truncate">{winner.username}</span>
              <div className={`${winner.multiplierBg} ${winner.multiplierText} px-3 py-1 rounded-lg text-sm font-bold shadow-lg`}>
                {winner.multiplier}
              </div>
            </div>
            
            {/* Weapon showcase area */}
            <div className={`relative h-32 bg-gradient-to-br ${winner.bgGradient} flex items-center justify-center overflow-hidden`}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
              
              {/* Weapon representation */}
              <div className="relative group-hover:scale-110 transition-transform duration-300">
                {/* Main weapon body */}
                <div 
                  className="relative w-20 h-6 rounded-sm transform -rotate-12 shadow-2xl"
                  style={{
                    background: `linear-gradient(45deg, ${winner.weaponColor}, ${winner.weaponColor}dd, ${winner.weaponColor}aa)`,
                    boxShadow: `0 8px 25px ${winner.weaponColor}40`
                  }}
                >
                  {/* Weapon details */}
                  <div className="absolute top-1 left-2 w-3 h-1 bg-black/40 rounded-sm"></div>
                  <div className="absolute top-3 left-2 w-4 h-1 bg-black/30 rounded-sm"></div>
                  <div className="absolute -right-1 top-1 w-2 h-4 bg-black/50 rounded-r-sm"></div>
                </div>
                
                {/* Muzzle flash effect */}
                <div 
                  className="absolute -right-2 top-1 w-4 h-4 rounded-full opacity-70"
                  style={{
                    background: `radial-gradient(circle, ${winner.weaponColor}80, transparent)`,
                  }}
                ></div>
                
                {/* Weapon scope/attachments */}
                <div className="absolute -top-1 left-3 w-2 h-2 bg-black/60 rounded-sm transform rotate-12"></div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute top-4 right-6 w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-8 right-4 w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-6 left-8 w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            </div>
            
            {/* Weapon name */}
            <div className="p-4 bg-gray-900/80">
              <p className="text-gray-300 text-sm font-medium truncate">{winner.weapon}</p>
              <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: '100%',
                    background: `linear-gradient(90deg, ${winner.weaponColor}80, ${winner.weaponColor})`
                  }}
                ></div>
              </div>
            </div>
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-full group-hover:translate-x-[-150%] transition-all duration-1000 ease-in-out"></div>
          </div>
        ))}
      </div>
    </div>
  );
}