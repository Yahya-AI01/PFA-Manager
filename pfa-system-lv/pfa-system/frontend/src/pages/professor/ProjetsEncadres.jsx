import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Users, KanbanSquare, MessageCircle, FileText } from 'lucide-react';
import api from '../../api/client';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

export default function ProjetsEncadres() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projets/encadres')
      .then(r => setProjets(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-48" />)}</div>;
  }

  if (projets.length === 0) {
    return (
      <div className="space-y-8">
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
            Encadrement
          </p>
          <h1 className="font-display text-5xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
            Projets encadrés
          </h1>
        </motion.header>
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Aucun projet en cours"
            description="Vos étudiants n'ont pas encore choisi de sujet parmi les vôtres."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Encadrement
        </p>
        <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
          Projets encadrés<span className="text-ember-500">.</span>
        </h1>
        <p className="text-ink-500 dark:text-ink-400 mt-2 text-sm">
          {projets.length} projet{projets.length > 1 ? 's' : ''} en cours
        </p>
      </motion.header>

      <div className="space-y-4">
        {projets.map((p, i) => (
          <Card key={p.id} className="p-6" delay={i * 0.06}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Badge variant={p.statut === 'EN_COURS' ? 'ember' : 'success'} dot className="mb-2">
                    {p.statut}
                  </Badge>
                  <h2 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50 leading-tight">
                    {p.sujetTitre}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-cream-300 dark:border-ink-800">
                <Users className="w-3.5 h-3.5 text-ink-400" />
                <span className="text-[10px] uppercase tracking-widest text-ink-400">Équipe</span>
                <div className="flex -space-x-2">
                  {p.etudiants.map((e) => (
                    <Avatar key={e.id} prenom={e.prenom} nom={e.nom} email={e.email} size="sm" />
                  ))}
                </div>
                <span className="text-xs text-ink-500 dark:text-ink-400 ml-1">
                  {p.etudiants.length}/4
                </span>
                <div className="flex flex-wrap gap-1 ml-2">
                  {p.etudiants.map((e) => (
                    <span key={e.id} className="text-xs text-ink-600 dark:text-ink-300">
                      {e.prenom} {e.nom}
                    </span>
                  )).reduce((prev, curr, idx) => idx === 0 ? [curr] : [...prev, <span key={`sep-${idx}`} className="text-ink-400">·</span>, curr], [])}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Link to={`/projets/${p.id}/kanban`} className="contents">
                  <Button variant="ember" size="sm" icon={KanbanSquare} className="w-full">
                    Kanban
                  </Button>
                </Link>
                <Link to={`/projets/${p.id}/chat`} className="contents">
                  <Button variant="outline" size="sm" icon={MessageCircle} className="w-full">
                    Discussion
                  </Button>
                </Link>
                <Link to={`/projets/${p.id}/documents`} className="contents">
                  <Button variant="outline" size="sm" icon={FileText} className="w-full">
                    Fichiers
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
