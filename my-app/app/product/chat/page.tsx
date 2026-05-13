'use client';

import { useState, useRef, useEffect } from 'react';
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader';
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter';
import { useAuth } from '@/lib/shopping/auth-context';

import { useCart } from '@/lib/shopping/cart-context';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function ChatPage() {
  const { user } = useAuth();
  const { items, totalPrice, totalCount } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI assistant. How can I help you find the perfect hardware today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const n8nPostUrl = 'http://localhost:5678/webhook/f7a45580-9926-44e3-bc3d-3bf9b6803497';

      // Chỉ cần một lệnh POST duy nhất để gửi và nhận kết quả
      const response = await fetch(n8nPostUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage.content,
          query: userMessage.content,
          message: userMessage.content,
          context: {
             userName: user?.name || user?.email || 'Khách hàng',
             cartItems: items.map(i => ({ name: i.product.name, price: i.product.price, quantity: i.quantity })),
             totalPrice,
             totalCount
          }
        }),
      });

      const text = await response.text();
      let assistantContent = '';

      try {
        const data = text ? JSON.parse(text) : {};
        assistantContent = data.advice || data.output || data.response || data.chatInput || text;
      } catch (e) {
        // Nếu không phải JSON (ví dụ n8n trả về text thuần), dùng luôn text đó
        assistantContent = text || 'Chatbot không có phản hồi.';
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I am unable to connect to my brain right now. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <StorefrontHeader />
      
      <main className="flex-1 max-w-[1000px] mx-auto w-full px-4 py-8 md:py-12 flex flex-col h-[calc(100vh-160px)]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
            AI Assistant
          </h1>
          <p className="text-text-soft mt-2">Consult with our expert AI for personalized hardware recommendations</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-surface/30 backdrop-blur-xl border border-border-dim rounded-[32px] overflow-hidden shadow-premium">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-[24px] ${
                    message.role === 'user'
                      ? 'bg-accent text-accent-contrast font-medium rounded-tr-none'
                      : 'bg-white/5 border border-border-dim text-foreground rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className={`text-[10px] mt-1 block opacity-50 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-border-dim px-5 py-4 rounded-[24px] rounded-tl-none flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-white/5 border-t border-border-dim">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about anything... (e.g., Best GPU for 4K gaming?)"
                className="flex-1 bg-white/5 border border-border-dim rounded-full px-6 py-3.5 outline-none focus:border-accent/50 transition-all placeholder:text-text-soft"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-accent text-accent-contrast font-bold px-6 py-3.5 rounded-full hover:bg-accent-strong transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>Send</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
