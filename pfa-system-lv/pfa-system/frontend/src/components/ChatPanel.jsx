import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/Avatar';
import { cn } from '../lib/utils';

export default function ChatPanel({ projetId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const load = () => {
    if (!projetId) return;
    api.get(`/projets/${projetId}/messages`).then(r => setMessages(r.data));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [projetId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post(`/projets/${projetId}/messages`, { contenu: content });
      setContent('');
      load();
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl bg-cream-50 dark:bg-ink-900 border border-cream-300 dark:border-ink-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-cream-300 dark:border-ink-800 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-ember-500" />
        <h3 className="font-display text-lg font-light tracking-tight text-ink-900 dark:text-cream-50">
          Discussion
        </h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-ink-400 italic">Aucun message pour l'instant.</p>
            <p className="text-xs text-ink-400 mt-1">Démarrez la conversation 👇</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isMe = m.expediteurId === user?.id;
              const [prenom, nom] = (m.expediteurNom || '').split(' ');
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-3', isMe ? 'flex-row-reverse' : '')}
                >
                  <Avatar prenom={prenom} nom={nom} email={m.expediteurNom} size="sm" />
                  <div className={cn('flex-1 max-w-[80%]', isMe ? 'flex flex-col items-end' : '')}>
                    <div className={cn(
                      'flex items-baseline gap-2 mb-1',
                      isMe ? 'flex-row-reverse' : ''
                    )}>
                      <span className="text-xs font-medium text-ink-700 dark:text-ink-200">
                        {isMe ? 'Vous' : m.expediteurNom}
                      </span>
                      <span className="text-[10px] text-ink-400">{formatTime(m.dateEnvoi)}</span>
                    </div>
                    <div className={cn(
                      'inline-block px-3.5 py-2 rounded-2xl text-sm break-words',
                      isMe
                        ? 'bg-ember-500 text-white rounded-tr-sm'
                        : 'bg-cream-200 dark:bg-ink-800 text-ink-900 dark:text-cream-50 rounded-tl-sm'
                    )}>
                      {m.contenu}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <form onSubmit={send} className="border-t border-cream-300 dark:border-ink-800 p-3 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1 bg-cream-100 dark:bg-ink-800 rounded-full px-4 py-2 text-sm text-ink-900 dark:text-cream-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-500/40"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="w-10 h-10 rounded-full bg-ember-500 text-white flex items-center justify-center hover:bg-ember-600 transition-colors disabled:opacity-50"
          aria-label="Envoyer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
