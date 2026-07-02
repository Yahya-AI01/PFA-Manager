import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import ProjectTabs from '../components/ProjectTabs';
import { cn } from '../lib/utils';

export default function Chat() {
  const { projetId } = useParams();
  const { user } = useAuth();
  const [projet, setProjet] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get(`/projets/${projetId}/messages`);
      setMessages(data);
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    api.get(`/projets/${projetId}`).then(r => setProjet(r.data));
    load();
    const interval = setInterval(load, 3000); // polling toutes les 3s
    return () => clearInterval(interval);
  }, [projetId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/projets/${projetId}/messages`, { contenu: draft.trim() });
      setDraft('');
      load();
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Projet
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-light tracking-tightest text-ink-900 dark:text-cream-50 leading-tight mb-4">
          {projet?.sujetTitre || 'Discussion'}
        </h1>
        <ProjectTabs />
      </motion.header>

      <Card className="overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px]" animate={false}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="Aucun message"
              description="Démarrez la conversation avec votre équipe ou votre encadrant."
            />
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const isMe = m.expediteurId === user?.id;
                const isProf = m.expediteurRole === 'PROFESSEUR';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn('flex gap-2.5', isMe ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <Avatar
                      prenom={m.expediteurPrenom}
                      nom={m.expediteurNom}
                      email={`${m.expediteurId}`}
                      size="sm"
                    />
                    <div className={cn('max-w-[70%]', isMe ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-ink-400">
                        <span className="font-medium text-ink-600 dark:text-ink-300">
                          {m.expediteurPrenom} {m.expediteurNom}
                        </span>
                        {isProf && (
                          <span className="bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-1.5 rounded">
                            Prof
                          </span>
                        )}
                        <span>{formatTime(m.dateEnvoi)}</span>
                      </div>
                      <div
                        className={cn(
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isMe
                            ? 'bg-ember-500 text-white rounded-tr-sm'
                            : 'bg-cream-200 dark:bg-ink-800 text-ink-900 dark:text-cream-50 rounded-tl-sm'
                        )}
                      >
                        {m.contenu}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Input */}
        <form onSubmit={send} className="border-t border-cream-300 dark:border-ink-800 p-3 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tapez votre message…"
            className="flex-1 bg-cream-100 dark:bg-ink-800 border border-cream-300 dark:border-ink-700 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="w-11 h-11 rounded-full bg-ember-500 text-white flex items-center justify-center hover:bg-ember-600 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </Card>
    </div>
  );
}
