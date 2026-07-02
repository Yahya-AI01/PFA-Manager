import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KanbanSquare, MessageCircle, FileText } from 'lucide-react';
import api from '../api/client';
import { cn } from '../lib/utils';

const TABS = [
  { to: 'kanban', label: 'Kanban', icon: KanbanSquare },
  { to: 'chat', label: 'Discussion', icon: MessageCircle, badge: 'unread' },
  { to: 'documents', label: 'Fichiers', icon: FileText },
];

export default function ProjectTabs() {
  const { projetId } = useParams();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!projetId) return;
    const fetchUnread = () =>
      api.get(`/projets/${projetId}/messages/non-lus`)
        .then(r => setUnread(r.data.count || 0))
        .catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [projetId]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-1 p-1 rounded-full bg-cream-200/60 dark:bg-ink-900/60 border border-cream-300 dark:border-ink-800 w-fit"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={`/projets/${projetId}/${tab.to}`}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all relative',
              isActive
                ? 'bg-ink-900 text-cream-50 dark:bg-cream-50 dark:text-ink-900 shadow-soft'
                : 'text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-cream-50'
            )
          }
        >
          <tab.icon className="w-3.5 h-3.5" />
          {tab.label}
          {tab.badge === 'unread' && unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-ember-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </NavLink>
      ))}
    </motion.nav>
  );
}
