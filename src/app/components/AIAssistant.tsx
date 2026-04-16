import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Mic, Search, Store, ArrowRight, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  embed?: {
    type: 'product';
    data: {
      id: string;
      name: string;
      price: string;
      image: string;
      vendor: string;
    };
  };
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      text: 'Jambo! I am your personal Nataka Hii shopper. What are you looking for today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Mock AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(),
          role: 'assistant', 
          text: "I found this highly-rated option from a verified vendor in Nairobi that matches your criteria:",
          embed: {
            type: 'product',
            data: {
              id: 'p1',
              name: 'Samsung Galaxy S23 Ultra - 256GB',
              price: 'KES 145,000',
              image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400',
              vendor: 'Tech Haven Nairobi'
            }
          }
        }
      ]);
    }, 2000);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="group flex flex-row-reverse items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#F05A28] to-[#C44718] rounded-full shadow-[var(--shadow-level-3)] text-white overflow-hidden"
            >
              {/* Pulse glow animation */}
              <div className="absolute inset-0 bg-[#F05A28]/40 animate-ping rounded-full" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-colors" />
              
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Sparkles className="w-6 h-6 relative z-10" fill="currentColor" />
              </motion.div>
            </motion.button>
            
            {/* Hover Expand Label */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[var(--color-primary-darker)] px-4 py-2 rounded-full shadow-lg font-bold text-sm translate-x-4 group-hover:translate-x-0 duration-300">
              Chat with AI
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, x: 20, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed lg:absolute top-0 left-0 lg:top-auto lg:left-auto lg:bottom-0 lg:right-0 w-full h-full lg:w-[400px] lg:h-[600px] bg-white lg:rounded-2xl shadow-[var(--shadow-level-4)] overflow-hidden flex flex-col z-50 border-0 lg:border border-[var(--color-border)]"
            >
              {/* Header */}
              <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center relative">
                    <Sparkles className="w-5 h-5 text-[var(--color-primary)]" fill="currentColor" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#F05A28] border-2 border-white rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[16px] text-[var(--color-primary-darker)] leading-tight">Nataka AI</h3>
                    <p className="text-[12px] text-[var(--color-text-muted)] font-medium">Smart Shopping Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="hidden lg:flex w-8 h-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] transition-colors">
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-body)] hover:bg-[var(--color-bg-card)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F8F9FC] scroll-smooth hide-scrollbar relative">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.text && (
                      <div
                        className={`max-w-[85%] rounded-[18px] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-[#142490] text-white rounded-br-[4px]'
                            : 'bg-white text-[var(--color-text-body)] border border-[var(--color-border)] rounded-bl-[4px]'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                    
                    {msg.embed && msg.embed.type === 'product' && (
                      <div className="mt-2 max-w-[85%] bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
                        <div className="h-32 bg-[var(--color-bg-card)] relative">
                          <ImageWithFallback 
                            src={msg.embed.data.image} 
                            alt={msg.embed.data.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-[14px] text-[var(--color-text-heading)] mb-1 line-clamp-1">{msg.embed.data.name}</h4>
                          <p className="font-extrabold text-[16px] text-[#142490] mb-2">{msg.embed.data.price}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mb-3">
                            <Store className="w-3 h-3" />
                            <span>{msg.embed.data.vendor}</span>
                          </div>
                          <Button className="w-full h-8 text-[12px] bg-[#F05A28] hover:bg-[#C44718] text-white">
                            View Product
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[var(--color-border)] rounded-[18px] rounded-bl-[4px] px-4 py-4 shadow-sm flex items-center gap-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-[#F05A28] rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-[#F05A28] rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-[#F05A28] rounded-full" />
                    </div>
                  </div>
                )}
                
                {/* Suggestions Chips - Only show on empty/start or after response */}
                {!isTyping && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 pt-2"
                  >
                    {["Show me cheaper options", "Find similar products", "Compare these items"].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => { setInput(chip); setTimeout(handleSend, 100); }}
                        className="text-[12px] font-semibold bg-white border border-[#E2E6F0] text-[#4A5468] px-3 py-1.5 rounded-full shadow-sm hover:border-[#F05A28] hover:text-[#F05A28] transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-[var(--color-border)] shrink-0">
                <div className="flex items-center gap-2 bg-[#F8F9FC] border border-[var(--color-border)] rounded-full px-2 py-1 focus-within:ring-2 focus-within:ring-[#F05A28]/20 focus-within:border-[#F05A28] transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message Nataka AI..."
                    className="flex-1 bg-transparent border-none text-[14px] px-3 py-2 focus:outline-none placeholder:text-[#9BA5BC] text-[#1A2035]"
                  />
                  <button className="w-8 h-8 flex items-center justify-center text-[#9BA5BC] hover:text-[#F05A28] transition-colors shrink-0">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-8 h-8 bg-[#F05A28] text-white flex items-center justify-center rounded-full hover:bg-[#C44718] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
