"use client";

import { useState, useEffect } from 'react';
import { Send, Smile, ArrowRight } from 'lucide-react';

export default function ChatSection() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: '1',
      username: 'Gary', 
      time: '3m ago', 
      text: 'wow, this is such a cool thing.. I need to tell everyone about this!', 
      avatar: 'G',
      avatarColor: 'from-gray-600 to-gray-800',
      isSystem: false
    },
    { 
      id: '2',
      username: 'Agent420', 
      time: '4m ago', 
      text: 'what about all the other games, they\'re like this one. I\'m hooked instantly man', 
      avatar: 'A',
      avatarColor: 'from-green-500 to-green-700',
      isSystem: false
    },
    { 
      id: '3',
      username: 'retroz', 
      time: '12m ago', 
      text: 'come on it\'s just a game xd', 
      avatar: 'R',
      avatarColor: 'from-blue-500 to-blue-700',
      isSystem: false
    },
    { 
      id: '4',
      username: 'Ballin', 
      time: '8m ago', 
      text: 'I know, but still makes sense playing it. I should\'ve cashed out yesterday', 
      avatar: 'B',
      avatarColor: 'from-purple-500 to-purple-700',
      isSystem: false
    },
    { 
      id: '5',
      username: 'lobbyig', 
      time: '7m ago', 
      text: 'well it all depends on the situation xd', 
      avatar: 'L',
      avatarColor: 'from-indigo-500 to-indigo-700',
      isSystem: false
    },
    { 
      id: '6',
      username: 'johnwick', 
      time: '8m ago', 
      text: '👀 sir', 
      avatar: 'J',
      avatarColor: 'from-yellow-500 to-yellow-700',
      isSystem: false
    },
    { 
      id: '7',
      username: 'monke', 
      time: '6m ago', 
      text: 'if I bet more does the probability increase as you go', 
      avatar: 'M',
      avatarColor: 'from-gray-600 to-gray-800',
      isSystem: false
    },
    { 
      id: '8',
      username: 'johnwick', 
      time: '5m ago', 
      text: 'Let\'s gooooooo everyone', 
      avatar: 'J',
      avatarColor: 'from-yellow-500 to-yellow-700',
      isSystem: false
    },
    { 
      id: '9',
      username: 'monke', 
      time: '5m ago', 
      text: 'enjoy pal, enjoy losing everything', 
      avatar: 'M',
      avatarColor: 'from-gray-600 to-gray-800',
      isSystem: false
    },
    { 
      id: '10',
      username: 'retroz', 
      time: '2m ago', 
      text: 'who else is close to rank up? I think I need a few more days and it\'s on', 
      avatar: 'R',
      avatarColor: 'from-blue-500 to-blue-700',
      isSystem: false
    },
    { 
      id: '11',
      username: 'lobbyig', 
      time: '1m ago', 
      text: 'trying to find out how to win', 
      avatar: 'L',
      avatarColor: 'from-indigo-500 to-indigo-700',
      isSystem: false
    },
  ]);
  
  // Add ring activity messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const ringMessages = [
          'just joined a ring! 🎯',
          'big bet incoming! 💰',
          'this wheel is getting crazy 🎪',
          'who\'s gonna win this one? 🤔',
          'placing my bet now! 💸',
          'let\'s see who gets lucky! 🍀',
        ];
        
        const botNames = ['CryptoKing', 'LuckyPlayer', 'SpinMaster', 'WheelWinner', 'BetBeast'];
        const colors = ['from-purple-500 to-purple-700', 'from-cyan-500 to-cyan-700', 'from-pink-500 to-pink-700'];
        
        const newMessage = {
          id: Date.now().toString() + Math.random(),
          username: botNames[Math.floor(Math.random() * botNames.length)],
          time: 'now',
          text: ringMessages[Math.floor(Math.random() * ringMessages.length)],
          avatar: botNames[Math.floor(Math.random() * botNames.length)][0],
          avatarColor: colors[Math.floor(Math.random() * colors.length)],
          isSystem: false
        };
        
        setMessages(prev => [newMessage, ...prev.slice(0, 10)]);
      }
    }, 12000);
    
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      username: 'You',
      time: 'now',
      text: message,
      avatar: 'Y',
      avatarColor: 'from-green-500 to-green-600',
      isSystem: false
    };
    
    setMessages(prev => [newMessage, ...prev.slice(0, 10)]);
    setMessage('');
  };
  return (
    <div className="h-full bg-gradient-to-b from-gray-900/40 to-gray-800/20 border-l border-gray-700/30 backdrop-blur-xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-700/30 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text">Live Chat</h3>
        <div className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-300 cursor-pointer group">
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4 h-[calc(100vh-200px)]">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex items-start space-x-3 p-4 rounded-3xl transition-all duration-300 group animate-in slide-in-from-right-2 ${
            msg.username === 'You' ? 'bg-green-900/20 border border-green-500/30' : 'hover:bg-gray-800/30'
          }`}>
            <div className={`w-10 h-10 bg-gradient-to-br ${msg.avatarColor} rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg group-hover:scale-110 transition-all duration-300`}>
              {msg.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-semibold text-white text-sm group-hover:text-green-400 transition-colors duration-300">{msg.username}</span>
                <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-lg">{msg.time}</span>
              </div>
              <div className={`backdrop-blur-sm rounded-3xl px-4 py-3 transition-all duration-300 ${
                msg.username === 'You' ? 'bg-green-800/40' : 'bg-gray-800/40 group-hover:bg-gray-700/40'
              }`}>
                <p className="text-sm text-gray-300 break-words leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message here..."
            className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-3xl px-6 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all duration-300"
          />
          <button className="text-gray-400 hover:text-white transition-all duration-300 p-4 hover:bg-gray-800/50 rounded-3xl group">
            <Smile className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <button 
            onClick={sendMessage}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-110 group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}