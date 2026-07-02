import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Lightbulb, Code2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';

export default function SujetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sujet, setSujet] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    api.get(`/sujets/${id}`).then(r => setSujet(r.data));
    api.get(`/sujets/${id}/similaires?topK=5`).then(r => setSimilaires(r.data)).catch(() => {});
    api.get(`/sujets/${id}/suggestions`).then(r => setSuggestions(r.data)).catch(() => {});
  }, [id]);

  const choisir = async () => {
    setChoosing(true);
    try {
      const { data } = await api.post(`/projets/choisir-sujet/${id}`);
      toast.success('Sujet choisi avec succès !');
      navigate(`/projets/${data.id}/kanban`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors du choix');
    } finally {
      setChoosing(false);
    }
  };

  if (!sujet) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-cream-50 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={sujet.disponible ? 'ember' : 'default'} dot>
                {sujet.disponible ? 'Disponible' : 'Attribué'}
              </Badge>
              <Badge variant="outline">{sujet.moduleNom || 'Sans module'}</Badge>
              <span className="text-[10px] uppercase tracking-widest text-ink-400">
                Promotion {sujet.annee}
              </span>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-light leading-[0.95] tracking-tightest text-ink-900 dark:text-cream-50 text-balance">
              {sujet.titre}
            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
            <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-3">Description</p>
            <div className="font-display text-xl lg:text-2xl font-light leading-relaxed tracking-tight text-ink-700 dark:text-ink-200 whitespace-pre-line text-pretty">
              {sujet.description || 'Aucune description disponible.'}
            </div>
          </motion.div>

          {/* Suggestions IA */}
          {suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-4"
            >
              <Card className="p-6 bg-gradient-to-br from-ember-50 to-cream-50 dark:from-ember-950/30 dark:to-ink-900 border-ember-200 dark:border-ember-900">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-ember-500" />
                  <p className="text-[10px] uppercase tracking-widest text-ember-700 dark:text-ember-400">
                    Suggestions IA — Idées
                  </p>
                </div>
                <h3 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50 mb-4">
                  Pour aller plus loin
                </h3>
                <ul className="space-y-2">
                  {suggestions.ideas?.map((idea, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex gap-3 text-sm text-ink-700 dark:text-ink-200"
                    >
                      <span className="text-ember-500 font-mono shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span>{idea}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="w-4 h-4 text-ember-500" />
                  <p className="text-[10px] uppercase tracking-widest text-ember-700 dark:text-ember-400">
                    Stack technique recommandée
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.stack?.map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-cream-200 dark:bg-ink-800 text-ink-700 dark:text-ink-200 border border-cream-300 dark:border-ink-700"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}>
            <Card className="p-5 flex items-center gap-4">
              <Avatar
                prenom={sujet.professeurNom?.split(' ')[0]}
                nom={sujet.professeurNom?.split(' ')[1]}
                size="lg"
              />
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-ink-400">Encadrant</p>
                <p className="font-display text-xl font-light tracking-tight text-ink-900 dark:text-cream-50">
                  {sujet.professeurNom}
                </p>
              </div>
            </Card>
          </motion.div>

          {user?.role === 'ETUDIANT' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}>
              <Button
                variant="ember"
                size="lg"
                loading={choosing}
                onClick={choisir}
                className="w-full"
                disabled={!sujet.disponible}
              >
                {sujet.disponible ? 'Choisir ce sujet / Rejoindre l\'équipe' : 'Sujet attribué'}
                {sujet.disponible && <ArrowRight className="w-4 h-4" />}
              </Button>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-2 text-center">
                {sujet.disponible
                  ? 'Vous pouvez rejoindre une équipe existante (max 4 étudiants)'
                  : 'L\'équipe est complète (4 étudiants maximum)'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Sidebar — Similaires */}
        <motion.aside initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
          <Card className="p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-ember-500" />
              <p className="text-[10px] uppercase tracking-widest text-ember-600 dark:text-ember-400">
                Détection IA
              </p>
            </div>
            <h3 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50 mb-1">
              Sujets similaires
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-400 mb-5">
              TF-IDF + similarité cosinus
            </p>

            {similaires.length === 0 ? (
              <p className="text-sm text-ink-400 italic">Aucune similarité détectée.</p>
            ) : (
              <ul className="space-y-3">
                {similaires.map((s, i) => (
                  <motion.li
                    key={s.sujetId}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    <Link
                      to={`/sujets/${s.sujetId}`}
                      className="block p-3 rounded-xl hover:bg-cream-200/50 dark:hover:bg-ink-800/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-medium tracking-tight text-ink-900 dark:text-cream-50 line-clamp-2 flex-1">
                          {s.titre}
                        </p>
                        <span className="font-mono text-xs font-semibold text-ember-600 dark:text-ember-400 shrink-0">
                          {(s.similarite * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1 bg-cream-200 dark:bg-ink-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, s.similarite * 100)}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full bg-gradient-to-r from-ember-400 to-ember-600"
                        />
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </motion.aside>
      </div>
    </div>
  );
}
