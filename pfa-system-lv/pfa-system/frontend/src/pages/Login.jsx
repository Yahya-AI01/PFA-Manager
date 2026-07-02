import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const demoAccounts = [
  { role: 'ADMIN', email: 'admin@pfa.ma', pwd: 'admin123', label: 'Admin' },
  { role: 'PROFESSEUR', email: 'prof1@pfa.ma', pwd: 'prof123', label: 'Professeur' },
  { role: 'ETUDIANT', email: 'etudiant1@pfa.ma', pwd: 'etu123', label: 'Étudiant' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, motDePasse);
      toast.success('Bienvenue !');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setMotDePasse(acc.pwd);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-5 bg-cream-50 dark:bg-ink-950 grain-overlay">
      {/* Côté gauche - Form */}
      <div className="lg:col-span-2 flex flex-col px-6 sm:px-12 py-10 lg:py-16">
        <Link to="/" className="flex items-center gap-2.5 mb-auto">
          <div className="w-9 h-9 rounded-xl bg-ember-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            </svg>
          </div>
          <span className="font-display text-xl tracking-tightest text-ink-900 dark:text-cream-50">
            PFA Manager
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full mx-auto py-12 lg:py-0"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-3">
            Connexion
          </p>
          <h1 className="font-display text-5xl lg:text-6xl font-light leading-[0.95] tracking-tightest text-ink-900 dark:text-cream-50 mb-3">
            Bon retour<span className="text-ember-500">.</span>
          </h1>
          <p className="text-ink-500 dark:text-ink-400 mb-10 text-pretty">
            Accédez à votre espace pour gérer vos projets de fin d'année.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
            <Input
              label="Mot de passe"
              type="password"
              icon={Lock}
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" variant="ember" size="lg" loading={loading} className="w-full mt-2">
              Se connecter <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
            Pas de compte ?{' '}
            <Link to="/register" className="text-ink-900 dark:text-cream-50 font-medium link-underline">
              Créer un compte
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-auto"
        >
          <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-3">Comptes de démo</p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc)}
                className="text-left p-2.5 rounded-xl border border-cream-300 dark:border-ink-800 hover:border-ember-500 dark:hover:border-ember-500 transition-colors group"
              >
                <p className="text-[10px] uppercase tracking-widest text-ink-400 group-hover:text-ember-500 transition-colors">
                  {acc.label}
                </p>
                <p className="text-xs font-mono text-ink-700 dark:text-ink-300 truncate mt-0.5">
                  {acc.email}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Côté droit - Editorial visual */}
      <div className="hidden lg:block lg:col-span-3 relative bg-ink-900 dark:bg-ink-950 overflow-hidden">
        {/* Grandes lettres décoratives */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="font-display text-[32rem] font-light text-ember-500/10 select-none leading-none -translate-y-12">
            P
          </span>
        </motion.div>

        {/* Contenu superposé */}
        <div className="relative h-full flex flex-col justify-between p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="max-w-md"
          >
            <p className="text-[10px] uppercase tracking-widest text-ember-400 mb-4">
              N° 01 — Système de gestion
            </p>
            <h2 className="font-display text-5xl font-light text-cream-50 leading-[1.05] tracking-tightest text-balance">
              Donnez vie à vos projets de fin d'année.
            </h2>
            <p className="text-ink-300 mt-6 text-pretty leading-relaxed">
              Une plateforme pensée pour les étudiants, les professeurs et les administrateurs.
              Suivi en temps réel, collaboration, IA pour la détection de similarité.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 max-w-md"
          >
            {['Sujets', 'Projets', 'Kanban'].map((item, i) => (
              <div key={item} className="border-l border-ink-700 pl-4">
                <p className="font-display text-3xl font-light text-cream-50">0{i + 1}</p>
                <p className="text-[10px] uppercase tracking-widest text-ink-400 mt-1">{item}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
