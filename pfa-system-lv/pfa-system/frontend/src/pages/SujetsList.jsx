import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, Filter, X } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { cn, truncate } from '../lib/utils';

export default function SujetsList() {
  const { user } = useAuth();
  const [sujets, setSujets] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [annee, setAnnee] = useState('');
  const [disponibleOnly, setDisponibleOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (annee) params.annee = annee;
      const { data } = await api.get('/sujets', { params });
      setSujets(disponibleOnly ? data.filter(s => s.disponible) : data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [disponibleOnly]);

  const onSearch = (e) => {
    e?.preventDefault();
    load();
  };

  const reset = () => {
    setKeyword('');
    setAnnee('');
    setDisponibleOnly(false);
  };

  const hasFilters = keyword || annee || disponibleOnly;

  return (
    <div className="space-y-8">
      {/* Header éditorial */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Catalogue
        </p>
        <h1 className="font-display text-5xl lg:text-6xl font-light leading-[0.95] tracking-tightest text-ink-900 dark:text-cream-50">
          Sujets de PFA<span className="text-ember-500">.</span>
        </h1>
        <p className="text-ink-500 dark:text-ink-400 mt-3 text-pretty">
          Découvrez les sujets proposés par les professeurs et choisissez celui qui vous inspire.
        </p>
      </motion.header>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="space-y-3"
      >
        <form onSubmit={onSearch} className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé, titre, description…"
              className="w-full bg-cream-50 dark:bg-ink-900 border border-cream-300 dark:border-ink-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-ink-900 dark:text-cream-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition-all"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <input
            type="number"
            placeholder="Année"
            className="w-28 bg-cream-50 dark:bg-ink-900 border border-cream-300 dark:border-ink-800 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500"
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
          />
          <Button type="submit" variant="primary" icon={Search}>Rechercher</Button>
          {hasFilters && (
            <Button type="button" variant="ghost" icon={X} onClick={reset}>
              Réinitialiser
            </Button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDisponibleOnly(!disponibleOnly)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all',
              disponibleOnly
                ? 'bg-ember-500 text-white'
                : 'border border-cream-300 dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:border-ember-500'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', disponibleOnly ? 'bg-white' : 'bg-emerald-500')} />
            Disponibles uniquement
          </button>
        </div>
      </motion.div>

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            <span className="font-display font-light text-2xl text-ink-900 dark:text-cream-50">{sujets.length}</span>
            {' '}
            {sujets.length > 1 ? 'résultats' : 'résultat'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : sujets.length === 0 ? (
          <Card className="p-0">
            <EmptyState
              icon={BookOpen}
              title="Aucun sujet trouvé"
              description="Essayez de modifier vos critères de recherche ou réinitialisez les filtres."
              action={<Button variant="outline" onClick={reset}>Réinitialiser</Button>}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sujets.map((s, i) => (
              <Link key={s.id} to={`/sujets/${s.id}`}>
                <Card hover className="p-5 h-full flex flex-col group" delay={Math.min(i * 0.04, 0.4)}>
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant={s.disponible ? 'ember' : 'default'} dot>
                      {s.disponible ? 'Disponible' : 'Attribué'}
                    </Badge>
                    <span className="text-[10px] uppercase tracking-widest text-ink-400">
                      {s.annee}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-light leading-[1.15] tracking-tight text-ink-900 dark:text-cream-50 mb-3 text-balance">
                    {s.titre}
                  </h3>

                  <p className="text-sm text-ink-500 dark:text-ink-400 line-clamp-3 mb-5 flex-1">
                    {truncate(s.description, 140)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-cream-300 dark:border-ink-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        prenom={s.professeurNom?.split(' ')[0]}
                        nom={s.professeurNom?.split(' ')[1]}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">
                          {s.professeurNom}
                        </p>
                        <p className="text-[10px] text-ink-400 truncate">{s.moduleNom || '—'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-ember-600 dark:text-ember-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
