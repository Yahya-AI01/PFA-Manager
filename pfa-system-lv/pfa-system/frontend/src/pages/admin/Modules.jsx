import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({ nom: '', description: '' });

  const load = () => api.get('/admin/modules').then(r => setModules(r.data));

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/modules', form);
      toast.success('Module créé');
      setForm({ nom: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce module ?')) return;
    try {
      await api.delete(`/admin/modules/${id}`);
      toast.success('Module supprimé');
      load();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Administration
        </p>
        <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
          Modules<span className="text-ember-500">.</span>
        </h1>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:sticky lg:top-6 self-start">
          <h3 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50 mb-1">
            Nouveau module
          </h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 mb-5">
            Ajoutez un module au catalogue
          </p>
          <form onSubmit={create} className="space-y-4">
            <Input
              label="Nom"
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex: Intelligence Artificielle"
            />
            <div>
              <label className="block text-xs font-medium tracking-tight text-ink-600 dark:text-ink-300 uppercase mb-1.5">
                Description
              </label>
              <textarea
                className="w-full bg-cream-100 dark:bg-ink-800 border border-cream-300 dark:border-ink-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 min-h-[80px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description courte"
              />
            </div>
            <Button type="submit" variant="ember" icon={Plus} className="w-full">
              Ajouter
            </Button>
          </form>
        </Card>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {modules.length === 0 ? (
            <Card>
              <EmptyState
                icon={Layers}
                title="Aucun module"
                description="Créez le premier module en utilisant le formulaire."
              />
            </Card>
          ) : (
            modules.map((m, i) => (
              <Card key={m.id} className="p-5" delay={i * 0.05}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-light tracking-tight text-ink-900 dark:text-cream-50 mb-1">
                      {m.nom}
                    </h3>
                    {m.description && (
                      <p className="text-sm text-ink-500 dark:text-ink-400">{m.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(m.id)}
                    className="p-2 rounded-lg text-ink-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
