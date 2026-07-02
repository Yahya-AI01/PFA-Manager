import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Briefcase, Users, KanbanSquare, GraduationCap, Layers, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const navByRole = {
  ETUDIANT: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { to: '/sujets', icon: BookOpen, label: 'Sujets' },
    { to: '/mon-projet', icon: Briefcase, label: 'Projet' },
  ],
  PROFESSEUR: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { to: '/mes-sujets', icon: KanbanSquare, label: 'Sujets' },
    { to: '/projets-encadres', icon: GraduationCap, label: 'Projets' },
    { to: '/etudiants', icon: UserCheck, label: 'Étudiants' },
  ],
  ADMIN: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { to: '/admin/utilisateurs', icon: Users, label: 'Users' },
    { to: '/admin/modules', icon: Layers, label: 'Modules' },
  ],
};

export default function MobileNav() {
  const { user } = useAuth();
  const items = navByRole[user?.role] || [];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-cream-100/95 dark:bg-ink-950/95 backdrop-blur-xl border-t border-cream-300 dark:border-ink-800 px-2 py-1.5">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest font-medium transition-colors',
                isActive ? 'text-ember-600 dark:text-ember-400' : 'text-ink-500 dark:text-ink-400'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
