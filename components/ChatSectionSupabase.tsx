"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users } from 'lucide-react';
import { chatService, ChatMessage } from '@/lib/supabase';
import { useAccount } from 'wagmi';

interface ChatSectionProps {
  ringId?: string;
  ringName?: string;
}

export default function ChatSectionSupabase({ ringId, ringName }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { address, isConnected } = useAccount();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when ring changes
  useEffect(() => {
    if (!ringId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await chatService.getMessages(ringId);
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [ringId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!ringId) return;

    const subscription = chatService.subscribeToMessages(ringId, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [ringId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !address || !isConnected || !ringId) return;

    setIsSending(true);
    try {
      await chatService.sendMessage(
        ringId,
        address,
        `${address.slice(0, 6)}...${address.slice(-4)}`,
        newMessage
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!ringId) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-600/50 rounded-3xl p-6 flex flex-col items-center justify-center">
        <MessageCircle className="w-12 h-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No Ring Selected</h3>
        <p className="text-sm text-gray-500 text-center">
          Select a ring to join the conversation
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-600/50 rounded-3xl flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-600/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {ringName || `Ring #${ringId.slice(-6)}`}
            </h3>
            <p className="text-xs text-gray-400">Live Chat</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageCircle className="w-8 h-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-500">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_address.toLowerCase() === address?.toLowerCase();
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gray-700/50 text-gray-100'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="text-xs text-gray-300 mb-1 font-medium">
                      {message.sender_name}
                    </div>
                  )}
                  <div className="text-sm break-words">{message.message}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-green-100' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-600/50">
        {!isConnected ? (
          <div className="text-center text-sm text-gray-400 py-3">
            Connect wallet to chat
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50 text-sm"
              disabled={isSending}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-2 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[40px]"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
