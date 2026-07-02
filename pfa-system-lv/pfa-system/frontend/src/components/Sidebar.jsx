import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Briefcase, Users, Layers,
  GraduationCap, KanbanSquare, LogOut, ChevronRight, UserCheck, Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/Avatar';
import ThemeToggle from './ui/ThemeToggle';
import { cn } from '../lib/utils';

const navByRole = {
  ETUDIANT: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/sujets', label: 'Sujets', icon: BookOpen },
    { to: '/mon-projet', label: 'Mon projet', icon: Briefcase },
  ],
  PROFESSEUR: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/sujets', label: 'Tous les sujets', icon: BookOpen },
    { to: '/mes-sujets', label: 'Mes sujets', icon: KanbanSquare },
    { to: '/projets-encadres', label: 'Projets encadrés', icon: GraduationCap },
    { to: '/etudiants', label: 'Étudiants', icon: UserCheck },
    { to: '/import-etudiants', label: 'Importer classe', icon: Upload },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/sujets', label: 'Sujets', icon: BookOpen },
    { to: '/etudiants', label: 'Étudiants', icon: UserCheck },
    { to: '/import-etudiants', label: 'Importer classe', icon: Upload },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/admin/modules', label: 'Modules', icon: Layers },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    cn(
      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-tight transition-all',
      isActive
        ? 'bg-ink-900 text-cream-50 dark:bg-cream-50 dark:text-ink-900'
        : 'text-ink-600 dark:text-ink-300 hover:bg-ink-900/5 dark:hover:bg-cream-50/10'
    );

  return (
    <aside className="hidden lg:flex w-64 flex-col h-screen sticky top-0 border-r border-cream-300 dark:border-ink-800 bg-cream-100/80 dark:bg-ink-950/80 backdrop-blur-xl px-4 py-6">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-3 mb-10">
        <div className="relative w-9 h-9 rounded-xl bg-ember-500 flex items-center justify-center shadow-glow-ember">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <motion.div
            className="absolute inset-0 rounded-xl bg-ember-400/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg tracking-tightest text-ink-900 dark:text-cream-50">PFA</span>
          <span className="text-[10px] uppercase tracking-widest text-ink-400">Manager</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-3">Navigation</p>
        {items.map((item, idx) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <NavLink to={item.to} className={navLinkClass} end={item.to === '/dashboard'}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="border-t border-cream-300 dark:border-ink-800 pt-4 mt-4 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] uppercase tracking-widest text-ink-400">Préférences</span>
          <ThemeToggle />
        </div>
        <div className="rounded-xl bg-cream-200/50 dark:bg-ink-900/50 p-3 flex items-center gap-3">
          <Avatar prenom={user?.prenom} nom={user?.nom} email={user?.email} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium tracking-tight text-ink-900 dark:text-cream-50 truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-ink-400 hover:text-red-600 transition-colors"
            aria-label="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
