import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Users, KanbanSquare, MessageCircle, FileText } from 'lucide-react';
import api from '../../api/client';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

export default function MonProjet() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projets/mes-projets')
      .then(r => setProjets(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (projets.length === 0) {
    return (
      <div className="space-y-8">
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
            Mon espace
          </p>
          <h1 className="font-display text-5xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
            Mes projets
          </h1>
        </motion.header>
        <Card>
          <EmptyState
            icon={Briefcase}
            title="Aucun projet pour l'instant"
            description="Choisissez un sujet parmi le catalogue pour démarrer votre projet de fin d'année."
            action={
              <Link to="/sujets">
                <Button variant="ember" icon={ArrowRight}>Parcourir les sujets</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Mon espace
        </p>
        <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
          Mes projets<span className="text-ember-500">.</span>
        </h1>
      </motion.header>

      <div className="space-y-4">
        {projets.map((p, i) => (
          <Card key={p.id} className="p-6" delay={i * 0.08}>
            <div className="space-y-5">
              <div>
                <Badge variant={p.statut === 'EN_COURS' ? 'ember' : 'success'} dot className="mb-3">
                  {p.statut}
                </Badge>
                <h2 className="font-display text-3xl font-light tracking-tight text-ink-900 dark:text-cream-50 mb-2 text-balance">
                  {p.sujetTitre}
                </h2>
                <p className="text-sm text-ink-500 dark:text-ink-400">
                  Encadré par <span className="text-ink-700 dark:text-ink-200 font-medium">{p.professeurNom}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-cream-300 dark:border-ink-800">
                <Users className="w-3.5 h-3.5 text-ink-400" />
                <span className="text-[10px] uppercase tracking-widest text-ink-400">Équipe</span>
                <div className="flex -space-x-2">
                  {p.etudiants.map((e) => (
                    <Avatar key={e.id} prenom={e.prenom} nom={e.nom} email={e.email} size="sm" />
                  ))}
                </div>
                <span className="text-xs text-ink-500 dark:text-ink-400 ml-2">
                  {p.etudiants.length}/4
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link to={`/projets/${p.id}/kanban`} className="contents">
                  <Button variant="ember" icon={KanbanSquare} className="w-full">
                    Kanban
                  </Button>
                </Link>
                <Link to={`/projets/${p.id}/chat`} className="contents">
                  <Button variant="outline" icon={MessageCircle} className="w-full">
                    Discussion
                  </Button>
                </Link>
                <Link to={`/projets/${p.id}/documents`} className="contents">
                  <Button variant="outline" icon={FileText} className="w-full">
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
