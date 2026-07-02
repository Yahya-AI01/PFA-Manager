import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, User, Mail, Lock, GraduationCap, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', role: 'ETUDIANT',
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Compte créé avec succès');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-ink-950 grain-overlay flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-ember-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            </svg>
          </div>
          <span className="font-display text-xl tracking-tightest text-ink-900 dark:text-cream-50">
            PFA Manager
          </span>
        </Link>

        <div className="text-center mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
            Inscription
          </p>
          <h1 className="font-display text-4xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
            Créer votre compte
          </h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" icon={User} required value={form.prenom} onChange={update('prenom')} />
            <Input label="Nom" required value={form.nom} onChange={update('nom')} />
          </div>
          <Input label="Email" type="email" icon={Mail} required value={form.email} onChange={update('email')} />
          <Input label="Mot de passe" type="password" icon={Lock} required minLength={6} value={form.motDePasse} onChange={update('motDePasse')} />

          <div>
            <label className="block text-xs font-medium tracking-tight text-ink-600 dark:text-ink-300 uppercase mb-2">
              Rôle
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'ETUDIANT', label: 'Étudiant', icon: GraduationCap },
                { value: 'PROFESSEUR', label: 'Professeur', icon: Briefcase },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border transition-all',
                    form.role === r.value
                      ? 'border-ember-500 bg-ember-50 dark:bg-ember-950 text-ember-700 dark:text-ember-300'
                      : 'border-cream-300 dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:border-ink-400'
                  )}
                >
                  <r.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="ember" size="lg" loading={loading} className="w-full mt-2">
            Créer mon compte <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-ink-900 dark:text-cream-50 font-medium link-underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
