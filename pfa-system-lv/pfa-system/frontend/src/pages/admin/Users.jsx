import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', role: 'ETUDIANT',
  });

  const load = () => {
    setLoading(true);
    api.get('/admin/utilisateurs').then(r => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/utilisateurs', form);
      toast.success('Utilisateur créé');
      setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'ETUDIANT' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/utilisateurs/${id}`);
      toast.success('Utilisateur supprimé');
      load();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const roleVariant = { ADMIN: 'ember', PROFESSEUR: 'violet', ETUDIANT: 'info' };
  const roleStats = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
            Administration
          </p>
          <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
            Utilisateurs<span className="text-ember-500">.</span>
          </h1>
        </div>
        <Button variant={showForm ? 'ghost' : 'ember'} icon={showForm ? X : Plus} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : 'Nouvel utilisateur'}
        </Button>
      </motion.header>

      {/* Stats par rôle */}
      <div className="grid grid-cols-3 gap-3">
        {['ADMIN', 'PROFESSEUR', 'ETUDIANT'].map((r, i) => (
          <Card key={r} className="p-4 text-center" delay={i * 0.05}>
            <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-1">{r}</p>
            <p className="font-display text-3xl font-light text-ink-900 dark:text-cream-50">
              {roleStats[r] || 0}
            </p>
          </Card>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <form onSubmit={create} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Prénom" required value={form.prenom} onChange={update('prenom')} />
                  <Input label="Nom" required value={form.nom} onChange={update('nom')} />
                </div>
                <Input label="Email" type="email" required value={form.email} onChange={update('email')} />
                <Input label="Mot de passe" type="password" required minLength={6} value={form.motDePasse} onChange={update('motDePasse')} />
                <div>
                  <label className="block text-xs font-medium tracking-tight text-ink-600 dark:text-ink-300 uppercase mb-1.5">
                    Rôle
                  </label>
                  <select
                    className="w-full bg-cream-100 dark:bg-ink-800 border border-cream-300 dark:border-ink-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500"
                    value={form.role}
                    onChange={update('role')}
                  >
                    <option value="ETUDIANT">Étudiant</option>
                    <option value="PROFESSEUR">Professeur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <Button type="submit" variant="ember" icon={Plus}>Créer</Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-300 dark:border-ink-800">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400">Utilisateur</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400">Email</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400">Rôle</th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="border-b border-cream-200 dark:border-ink-800 last:border-0 hover:bg-cream-100 dark:hover:bg-ink-900/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar prenom={u.prenom} nom={u.nom} email={u.email} size="sm" />
                        <span className="font-medium tracking-tight text-ink-900 dark:text-cream-50">
                          {u.prenom} {u.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-ink-600 dark:text-ink-300 font-mono">
                      {u.email}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={roleVariant[u.role]}>{u.role}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => remove(u.id)}
                        className="p-2 rounded-lg text-ink-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
