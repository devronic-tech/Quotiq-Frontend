import { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, X, Loader2, Bot, CornerDownLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/shared/lib/axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Financial Copilot. How can I help you analyze the company balance sheets, run cash flow forecasts, or inspect liabilities today?'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const copilotMutation = useMutation({
    mutationFn: async (question: string) => {
      const { data } = await api.post('/v1/finance/copilot', { question });
      return data.data;
    },
    onSuccess: (reply) => {
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    },
    onError: (err: any) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I failed to connect to the financial analysis service. ' + (err.response?.data?.error?.message || '')
        }
      ]);
    }
  });

  const handleSend = (text: string) => {
    if (!text.trim() || copilotMutation.isPending) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    copilotMutation.mutate(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    'Show overdue invoices.',
    'Which customer owes the most?',
    'Can we hire another employee?',
    'Show unnecessary expenses.'
  ];

  return (
    <>
      {/* Floating Toggle Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full gradient-emerald text-white shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 z-40 border border-white/20"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-500 rounded-full border-2 border-white animate-ping" />
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] h-[500px] bg-white border border-outline-variant/60 rounded-2xl shadow-xl flex flex-col overflow-hidden z-50 transition-all duration-300">
          {/* Header */}
          <div className="gradient-emerald px-md py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center border border-white/10">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-xs">
                  <span>AI Financial Copilot</span>
                  <span className="text-[8px] bg-white/20 px-1 rounded-full font-bold uppercase">Beta</span>
                </h4>
                <p className="text-[10px] text-emerald-100 font-semibold mt-0.5">Real-time ledger analytics engine</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-md space-y-sm bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-sm items-start max-w-[90%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-white text-xs font-bold' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {msg.role === 'user' ? 'U' : <Bot size={14} />}
                </div>
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white border border-outline-variant/30 text-on-surface rounded-tl-none shadow-soft'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {copilotMutation.isPending && (
              <div className="flex gap-sm items-start max-w-[90%]">
                <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 rounded-xl text-xs bg-white border border-outline-variant/30 text-on-surface rounded-tl-none shadow-soft flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span className="font-semibold text-on-surface-variant animate-pulse">Running ledger audit...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-md py-sm bg-white border-t border-outline-variant/20 flex gap-xs overflow-x-auto whitespace-nowrap scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={copilotMutation.isPending}
                className="text-[10px] font-bold py-1 px-2.5 bg-slate-100 text-secondary hover:bg-primary/5 hover:text-primary rounded-full border border-outline-variant/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-sm bg-white border-t border-outline-variant/30 flex items-center gap-sm"
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={copilotMutation.isPending}
              className="flex-1 h-9 px-3 bg-slate-50 border border-outline-variant/40 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-transparent outline-none text-on-surface"
            />
            <button
              type="submit"
              disabled={!input.trim() || copilotMutation.isPending}
              className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/95 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
