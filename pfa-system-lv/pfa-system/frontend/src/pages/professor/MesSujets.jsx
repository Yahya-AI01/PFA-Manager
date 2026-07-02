import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, BookOpen, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

export default function MesSujets() {
  const { user } = useAuth();
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/sujets', { params: { professeurId: user.id } })
      .then(r => setSujets(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const remove = async (id) => {
    if (!confirm('Supprimer ce sujet ?')) return;
    try {
      await api.delete(`/sujets/${id}`);
      toast.success('Sujet supprimé');
      load();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
            Mon catalogue
          </p>
          <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
            Mes sujets<span className="text-ember-500">.</span>
          </h1>
        </div>
        <Link to="/mes-sujets/nouveau">
          <Button variant="ember" icon={Plus}>Nouveau sujet</Button>
        </Link>
      </motion.header>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : sujets.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Aucun sujet pour l'instant"
            description="Créez votre premier sujet pour le proposer à vos étudiants."
            action={
              <Link to="/mes-sujets/nouveau">
                <Button variant="ember" icon={Plus}>Créer un sujet</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {sujets.map((s, i) => (
            <Card key={s.id} className="p-5" delay={i * 0.05}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={s.disponible ? 'ember' : 'default'} dot>
                      {s.disponible ? 'Disponible' : 'Attribué'}
                    </Badge>
                    <Badge variant="outline">{s.moduleNom || 'Sans module'}</Badge>
                    <span className="text-[10px] uppercase tracking-widest text-ink-400">
                      {s.annee}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-light tracking-tight text-ink-900 dark:text-cream-50">
                    {s.titre}
                  </h3>
                </div>

                <div className="flex gap-1">
                  <Link to={`/sujets/${s.id}`}>
                    <Button variant="ghost" size="sm" icon={Eye}>Voir</Button>
                  </Link>
                  <Link to={`/mes-sujets/${s.id}/modifier`}>
                    <Button variant="ghost" size="sm" icon={Edit}>Modifier</Button>
                  </Link>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => remove(s.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
