import React, { useState } from 'react';
import { api } from '../../lib/api';
import { MessageSquare, Send, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LegalAidChat: React.FC<{ language?: string }> = ({ language = 'en' }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{ role: string; text: string; disclaimer?: string }>>([
    {
      role: 'assistant',
      text: language === 'hi'
        ? 'नमस्ते! मैं न्यायफ्लो का विधिक सहायता सहायक हूँ। क्या आप मुफ़्त वकील, जमानत के नियमों या अपने मामले की प्रक्रिया के बारे में जानना चाहते हैं?'
        : language === 'or'
        ? 'ନମସ୍କାର! ମୁଁ ନ୍ୟାୟଫ୍ଲୋ ର ମାଗଣା ଆଇନ ସହାୟକ। ଆପଣଙ୍କୁ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?'
        : 'Namaste! I am NyayaFlow’s Legal Aid Assistant. You can ask about your statutory rights under Indian law, check eligibility for free court-appointed counsel, or get procedural guidance.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (text?: string) => {
    const toSend = text || inputMessage;
    if (!toSend.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: toSend }]);
    if (!text) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.sendCitizenChat(toSend, language);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          disclaimer: res.disclaimer
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Apologies, I encountered an issue connecting to the NALSA legal aid repository. Please dial the 24x7 helpline at 15100.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Am I eligible for a free lawyer under Section 12?',
    'What are the rights of an undertrial prisoner in custody?',
    'How do I contact the District Legal Services Authority (DLSA)?',
    'क्या महिलाओं को हर स्थिति में मुफ़्त वकील मिलता है?'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <button
          onClick={() => navigate('/citizen')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Citizen Home</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <Phone className="w-3.5 h-3.5" />
          <span>NALSA Helpline: 15100</span>
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 mb-4 shadow-inner">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow-md'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-md'
              }`}
            >
              {m.text}
              {m.disclaimer && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 italic">
                  {m.disclaimer}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Consulting statutory guidelines...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your legal aid or procedural question in English, हिन्दी, or ଓଡ଼ିଆ..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-3 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

