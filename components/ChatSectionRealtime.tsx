"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { chatService, ChatMessage } from '@/lib/supabaseEnhanced';
import { useAccount } from 'wagmi';

interface ChatSectionRealtimeProps {
  ringId?: string; // Optional: for ring-specific chat
}

export default function ChatSectionRealtime({ ringId }: ChatSectionRealtimeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getMessages(ringId);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ringId, scrollToBottom]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe to new messages
  useEffect(() => {
    const subscription = chatService.subscribeToMessages(
      (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      },
      ringId
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [ringId, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected || !address) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await chatService.sendMessage({
        ring_id: ringId,
        user_address: address,
        user_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        message: messageText
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700/50">
        <h3 className="text-lg font-bold text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          {ringId ? 'Ring Chat' : 'Global Chat'}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {messages.length} messages
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_address.toLowerCase() === address?.toLowerCase();
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? 'bg-gradient-to-br from-green-600/80 to-green-700/60'
                      : 'bg-gradient-to-br from-gray-700/80 to-gray-800/60'
                  } rounded-2xl px-4 py-2 shadow-lg`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-300">
                      {msg.user_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-white break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {isConnected ? (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-2xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50 transition-colors"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-2 rounded-2xl transition-all duration-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {newMessage.length}/200
          </p>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-700/50">
          <p className="text-center text-gray-400 text-sm">
            Connect wallet to chat
          </p>
        </div>
      )}
    </div>
  );
}
