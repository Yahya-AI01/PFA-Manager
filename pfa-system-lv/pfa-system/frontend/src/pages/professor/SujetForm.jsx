import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SujetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    titre: '',
    description: '',
    annee: new Date().getFullYear(),
    moduleId: '',
    disponible: true,
  });
  const [modules, setModules] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/modules').then(r => setModules(r.data));
    if (isEdit) {
      api.get(`/sujets/${id}`).then(r => {
        const s = r.data;
        setForm({
          titre: s.titre,
          description: s.description || '',
          annee: s.annee,
          moduleId: s.moduleId || '',
          disponible: s.disponible,
        });
      });
    }
  }, [id, isEdit]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        moduleId: form.moduleId ? Number(form.moduleId) : null,
        annee: Number(form.annee),
      };
      if (isEdit) {
        await api.put(`/sujets/${id}`, payload);
        toast.success('Sujet modifié');
      } else {
        await api.post('/sujets', payload);
        toast.success('Sujet créé');
      }
      navigate('/mes-sujets');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const update = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="max-w-2xl space-y-8">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          {isEdit ? 'Modification' : 'Création'}
        </p>
        <h1 className="font-display text-5xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
          {isEdit ? 'Modifier' : 'Nouveau'} sujet
        </h1>
      </motion.header>

      <Card className="p-6 lg:p-8">
        <form onSubmit={save} className="space-y-5">
          <Input label="Titre" required value={form.titre} onChange={update('titre')} placeholder="Ex: Plateforme de gestion de PFA" />

          <div>
            <label className="block text-xs font-medium tracking-tight text-ink-600 dark:text-ink-300 uppercase mb-1.5">
              Description
            </label>
            <textarea
              className="w-full bg-cream-100 dark:bg-ink-800 border border-cream-300 dark:border-ink-700 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 dark:text-cream-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 min-h-[140px] resize-y"
              value={form.description}
              onChange={update('description')}
              placeholder="Décrivez les objectifs, technologies, livrables…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Année" type="number" required value={form.annee} onChange={update('annee')} />
            <div>
              <label className="block text-xs font-medium tracking-tight text-ink-600 dark:text-ink-300 uppercase mb-1.5">
                Module
              </label>
              <select
                className="w-full bg-cream-100 dark:bg-ink-800 border border-cream-300 dark:border-ink-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500"
                value={form.moduleId}
                onChange={update('moduleId')}
              >
                <option value="">— Aucun —</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-cream-100 dark:bg-ink-800 cursor-pointer">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={update('disponible')}
              className="w-4 h-4 rounded accent-ember-500"
            />
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-cream-50">Disponible</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Les étudiants peuvent choisir ce sujet
              </p>
            </div>
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="ember" icon={Save} loading={saving}>
              {isEdit ? 'Enregistrer' : 'Créer le sujet'}
            </Button>
            <Button type="button" variant="ghost" icon={X} onClick={() => navigate('/mes-sujets')}>
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
