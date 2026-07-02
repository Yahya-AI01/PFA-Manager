import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Users, Upload } from 'lucide-react';
import api from '../api/client';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { cn } from '../lib/utils';

export default function EtudiantsView() {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/equipes/etudiants-status')
      .then(r => setEtudiants(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = etudiants.filter(e => {
    if (filter === 'verts') return e.aChoisiSujet;
    if (filter === 'rouges') return !e.aChoisiSujet;
    return true;
  });

  const verts = etudiants.filter(e => e.aChoisiSujet).length;
  const rouges = etudiants.length - verts;

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Suivi
        </p>
        <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
          Étudiants<span className="text-ember-500">.</span>
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <p className="text-ink-500 dark:text-ink-400 text-sm flex-1">
            Vue d'ensemble du statut de chaque étudiant
          </p>
          <Link to="/import-etudiants">
            <Button variant="ember" size="sm" icon={Upload}>
              Importer une classe
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center" delay={0.05}>
          <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-1">Total</p>
          <p className="font-display text-3xl font-light text-ink-900 dark:text-cream-50">{etudiants.length}</p>
        </Card>
        <Card className="p-4 text-center bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900" delay={0.1}>
          <p className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300 mb-1">A choisi</p>
          <p className="font-display text-3xl font-light text-emerald-700 dark:text-emerald-300">{verts}</p>
        </Card>
        <Card className="p-4 text-center bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900" delay={0.15}>
          <p className="text-[10px] uppercase tracking-widest text-red-700 dark:text-red-300 mb-1">En attente</p>
          <p className="font-display text-3xl font-light text-red-700 dark:text-red-300">{rouges}</p>
        </Card>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'verts', label: 'A choisi un sujet' },
          { key: 'rouges', label: 'Sans projet' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              filter === f.key
                ? 'bg-ink-900 text-cream-50 dark:bg-cream-50 dark:text-ink-900'
                : 'border border-cream-300 dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:border-ink-500'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Card animate={false} className={cn(
                'p-4 flex items-center gap-4 border-l-4',
                e.aChoisiSujet
                  ? 'border-l-emerald-500 dark:border-l-emerald-400'
                  : 'border-l-red-500 dark:border-l-red-400'
              )}>
                <Avatar prenom={e.prenom} nom={e.nom} email={e.email} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium tracking-tight text-ink-900 dark:text-cream-50">
                    {e.prenom} {e.nom}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 font-mono">{e.email}</p>
                </div>
                <div className="text-right">
                  {e.aChoisiSujet ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-medium text-ink-900 dark:text-cream-50 truncate max-w-xs">
                          {e.sujetTitre}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          En projet
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <Badge variant="default">Sans projet</Badge>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
