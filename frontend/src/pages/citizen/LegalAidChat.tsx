import React, { useState } from 'react';
import { api } from '../../lib/api';
import {
  MessageSquare,
  Send,
  Phone,
  ArrowLeft,
  Scale,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const LegalAidChat: React.FC<{ language?: string }> = ({ language = 'en' }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{ role: string; text: string; disclaimer?: string }>>([
    {
      role: 'assistant',
      text:
        language === 'hi'
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
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-160px)]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#C5CCD6]">
        <button
          type="button"
          onClick={() => navigate('/citizen')}
          className="flex items-center gap-1.5 text-xs text-[#0B2A5B] font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Citizen Home</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-[#0B2A5B] font-bold bg-[#0B2A5B]/10 px-3 py-1 rounded border border-[#0B2A5B]/20">
          <Phone className="w-3.5 h-3.5 text-[#FF9933]" aria-hidden="true" />
          <span>NALSA Helpline: 15100</span>
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 bg-white border border-[#C5CCD6] rounded p-4 sm:p-6 overflow-y-auto space-y-4 mb-4 shadow-sm" role="log" aria-live="polite">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[#0B2A5B] text-white rounded-br-none'
                  : 'bg-[#F4F6FA] text-[#1A1A1A] border border-[#C5CCD6] rounded-bl-none'
              }`}
            >
              {m.text}
              {m.disclaimer && (
                <div className="mt-2.5 pt-2 border-t border-[#C5CCD6] text-[11px] text-[#4A4F57] italic">
                  {m.disclaimer}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#F4F6FA] border border-[#C5CCD6] rounded p-3 text-xs text-[#4A4F57] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0B2A5B] animate-ping" />
              <span>Consulting statutory guidelines...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2" role="group" aria-label="Suggested legal queries">
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="text-xs bg-white hover:bg-[#F4F6FA] text-[#0B2A5B] border border-[#C5CCD6] hover:border-[#0B2A5B] px-3 py-1.5 rounded whitespace-nowrap transition-colors font-medium shrink-0"
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
        <label htmlFor="citizen-chat-input" className="sr-only">
          Ask a question about legal aid or procedures
        </label>
        <input
          id="citizen-chat-input"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your question in English, हिन्दी, or ଓଡ଼ିଆ..."
          className="flex-1 bg-white border border-[#C5CCD6] rounded px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#757575] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !inputMessage.trim()}
          className="flex items-center gap-2 px-5"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
};
