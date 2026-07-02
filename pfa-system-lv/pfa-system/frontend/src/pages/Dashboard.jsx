import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Briefcase, Sparkles, Plus, ArrowUpRight,
  TrendingUp, Users, Clock,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis,
  YAxis, Tooltip, AreaChart, Area, CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { formatDate } from '../lib/utils';

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 px-3 py-2 rounded-xl text-xs font-medium shadow-soft-lg">
      {payload.map((p, i) => (
        <div key={i}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ sujets: 0, projets: 0, mesProjets: 0 });
  const [sujets, setSujets] = useState([]);
  const [projets, setProjets] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get('/sujets'),
          api.get('/projets'),
        ]);
        setSujets(sRes.data);
        setProjets(pRes.data);

        let mes = 0;
        if (user?.role === 'ETUDIANT') {
          const r = await api.get('/projets/mes-projets');
          mes = r.data.length;
        } else if (user?.role === 'PROFESSEUR') {
          const r = await api.get('/projets/encadres');
          mes = r.data.length;
        }
        setStats({ sujets: sRes.data.length, projets: pRes.data.length, mesProjets: mes });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  // Données pour les charts
  const sujetsByModule = sujets.reduce((acc, s) => {
    const k = s.moduleNom || 'Sans module';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const moduleData = Object.entries(sujetsByModule).map(([name, value]) => ({ name, value }));
  const moduleColors = ['#fc4a17', '#0f766e', '#7c3aed', '#1e40af', '#be185d', '#854d0e'];

  const sujetsByYear = sujets.reduce((acc, s) => {
    acc[s.annee] = (acc[s.annee] || 0) + 1;
    return acc;
  }, {});
  const yearData = Object.entries(sujetsByYear)
    .sort()
    .map(([year, count]) => ({ year, count }));

  const dispoCount = sujets.filter(s => s.disponible).length;
  const attribueCount = sujets.length - dispoCount;
  const dispoData = [
    { name: 'Disponibles', value: dispoCount },
    { name: 'Attribués', value: attribueCount },
  ];

  return (
    <div className="space-y-10">
      {/* Header éditorial */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display text-5xl lg:text-6xl font-light leading-[0.95] tracking-tightest text-ink-900 dark:text-cream-50">
            Bonjour, {user?.prenom}<span className="text-ember-500">.</span>
          </h1>
          <p className="text-ink-500 dark:text-ink-400 mt-3 max-w-md text-pretty">
            Voici un aperçu de votre activité et des derniers projets en cours.
          </p>
        </div>

        <div className="flex gap-2">
          {user?.role === 'PROFESSEUR' && (
            <Link to="/mes-sujets/nouveau">
              <Button variant="ember" icon={Plus}>Nouveau sujet</Button>
            </Link>
          )}
          <Link to="/sujets">
            <Button variant="outline" icon={ArrowUpRight}>Parcourir</Button>
          </Link>
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Sujets disponibles" value={dispoCount} icon={BookOpen} delay={0.1} accent />
        <StatCard label="Projets total" value={stats.projets} icon={Briefcase} delay={0.2} />
        <StatCard
          label={user?.role === 'PROFESSEUR' ? 'Projets encadrés' : 'Mes projets'}
          value={stats.mesProjets}
          icon={Sparkles}
          delay={0.3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Disponibilité */}
        <Card className="p-6" delay={0.4}>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-1">Répartition</p>
            <h3 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50">
              Disponibilité
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dispoData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill="#fc4a17" />
                <Cell fill="#cecdca" />
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ember-500" />
              <div>
                <p className="text-lg font-display font-light text-ink-900 dark:text-cream-50">{dispoCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-ink-400">Disponibles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ink-300" />
              <div>
                <p className="text-lg font-display font-light text-ink-900 dark:text-cream-50">{attribueCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-ink-400">Attribués</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Modules */}
        <Card className="p-6 lg:col-span-2" delay={0.5}>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-1">Statistiques</p>
            <h3 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50">
              Sujets par module
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={moduleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe8dc" className="dark:stroke-ink-800" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7e7c76' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7e7c76' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(252, 74, 23, 0.05)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {moduleData.map((_, i) => (
                  <Cell key={i} fill={moduleColors[i % moduleColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Sujets récents */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-1">Récents</p>
            <h2 className="font-display text-3xl font-light tracking-tight text-ink-900 dark:text-cream-50">
              Derniers sujets
            </h2>
          </div>
          <Link to="/sujets" className="text-sm text-ink-600 dark:text-ink-300 link-underline">
            Tout voir →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sujets.slice(0, 4).map((s, i) => (
            <Link key={s.id} to={`/sujets/${s.id}`}>
              <Card hover className="p-5 group" delay={0.05 * i}>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={s.disponible ? 'ember' : 'default'} dot>
                    {s.disponible ? 'Disponible' : 'Attribué'}
                  </Badge>
                  <span className="text-xs text-ink-400">{s.annee}</span>
                </div>
                <h3 className="font-display text-xl font-light tracking-tight text-ink-900 dark:text-cream-50 mb-2 leading-tight">
                  {s.titre}
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 line-clamp-2 mb-4">
                  {s.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-cream-300 dark:border-ink-800">
                  <span className="text-xs text-ink-500 dark:text-ink-400">
                    {s.professeurNom}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-ember-600 dark:text-ember-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
