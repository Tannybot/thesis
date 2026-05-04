import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import api from '@/lib/api';

type Message = {
  role: 'assistant' | 'user';
  text: string;
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Ask about animals, health records, treatments, vaccinations, or traceability data in this system.',
    },
  ]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;

    setQuestion('');
    setLoading(true);
    setMessages((current) => [...current, { role: 'user', text: cleanQuestion }]);

    try {
      const res = await api.post('/ai/assistant/chat', { question: cleanQuestion });
      setMessages((current) => [...current, { role: 'assistant', text: res.data.answer }]);
    } catch (err: any) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: err.response?.data?.detail || 'I could not answer right now. Check that Ollama is running locally.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openAssistant() {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  return (
    <div className="ai-assistant">
      {open && (
        <section className="ai-panel" aria-label="LiveTrack AI Assistant">
          <header className="ai-panel-header">
            <div className="flex items-center gap-3 min-w-0">
              <span className="ai-avatar"><Bot size={19} /></span>
              <div className="min-w-0">
                <h2>LiveTrack Assistant</h2>
                <p>Local model answers from system records</p>
              </div>
            </div>
            <button type="button" className="header-action ai-close" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={18} />
            </button>
          </header>

          <div className="ai-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`ai-message ${message.role}`}>
                <p>{message.text}</p>
              </div>
            ))}
            {loading && (
              <div className="ai-message assistant">
                <p>Checking the system records...</p>
              </div>
            )}
          </div>

          <form className="ai-input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="input-field"
              placeholder="Ask a question..."
              maxLength={800}
            />
            <button type="submit" className="btn btn-primary ai-send" disabled={loading || !question.trim()} aria-label="Send question">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      {!open && (
        <button type="button" className="ai-fab" onClick={openAssistant} aria-label="Open AI assistant">
          <Sparkles size={20} />
          <span>AI</span>
        </button>
      )}
    </div>
  );
}
