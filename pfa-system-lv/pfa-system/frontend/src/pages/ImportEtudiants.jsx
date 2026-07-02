import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, FileSpreadsheet, Eye, EyeOff, CheckCircle2,
  AlertCircle, Copy, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function ImportEtudiants() {
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [csvDownloaded, setCsvDownloaded] = useState(false);
  const fileInputRef = useRef(null);

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/import/etudiants/template', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modele-etudiants.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Modèle téléchargé');
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleFile = async (f) => {
    if (!f) return;
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      toast.error('Veuillez sélectionner un fichier Excel (.xlsx)');
      return;
    }
    setFile(f);
    setResults(null);
    setCsvDownloaded(false);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', f);
    try {
      const { data } = await api.post('/import/etudiants/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(data);
      toast.success(`${data.length} étudiant(s) détecté(s)`);
    } catch {
      toast.error('Erreur de lecture du fichier');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const confirmImport = async () => {
    if (!file) return;

    if (results && !csvDownloaded) {
      if (!confirm('Vous perdrez les mots de passe générés, télécharger d\'abord ?')) return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post(`/import/etudiants?envoyerEmail=${sendEmail}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(data);
      const crees = data.filter(r => r.statut === 'CREE').length;
      const doublons = data.filter(r => r.statut === 'DOUBLON').length;
      toast.success(`${crees} créé(s), ${doublons} doublon(s)`);
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const downloadCsv = () => {
    if (!results) return;
    const crees = results.filter(r => r.statut === 'CREE');
    if (crees.length === 0) {
      toast.error('Aucun compte créé à exporter');
      return;
    }

    const BOM = '\uFEFF';
    const header = '"Email","Mot de passe","Nom","Prenom"';
    const rows = crees.map(r =>
      `"${r.email}","${r.motDePasseGenere}","${r.nom}","${r.prenom}"`
    );
    const csv = BOM + [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comptes-etudiants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    setCsvDownloaded(true);
    toast.success('CSV téléchargé');
  };

  const togglePassword = (idx) => {
    setShowPasswords(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const statutBadge = (statut) => {
    if (statut === 'CREE') return <Badge variant="success" dot>Créé</Badge>;
    if (statut === 'DOUBLON') return <Badge variant="ember" dot>Doublon</Badge>;
    return <Badge variant="default" dot>Erreur</Badge>;
  };

  const statutBorderColor = (statut) => {
    if (statut === 'CREE') return 'border-l-emerald-500 dark:border-l-emerald-400';
    if (statut === 'DOUBLON') return 'border-l-amber-500 dark:border-l-amber-400';
    return 'border-l-red-500 dark:border-l-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Gestion
        </p>
        <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 dark:text-cream-50">
          Importer une classe<span className="text-ember-500">.</span>
        </h1>
        <p className="text-ink-500 dark:text-ink-400 mt-2 text-sm">
          Importez vos étudiants depuis un fichier Excel en un clic
        </p>
      </motion.header>

      {/* Section 1: Template */}
      <Card className="p-6" delay={0.05}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-ink-900 dark:text-cream-50">Modèle Excel</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Téléchargez le fichier modèle avec les colonnes requises
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={Download} onClick={downloadTemplate}>
            Télécharger le modèle
          </Button>
        </div>
      </Card>

      {/* Section 2: Upload */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-2xl border-2 border-dashed p-10 text-center transition-all',
          dragOver
            ? 'border-ember-500 bg-ember-50 dark:bg-ember-950'
            : 'border-cream-300 dark:border-ink-800 bg-cream-50 dark:bg-ink-900'
        )}
      >
        <Upload className={cn('w-10 h-10 mx-auto mb-3', dragOver ? 'text-ember-600' : 'text-ink-400')} />
        <p className="font-display text-xl font-light text-ink-900 dark:text-cream-50 mb-1">
          {file ? file.name : 'Glissez votre fichier Excel ici'}
        </p>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">
          {file ? `${preview?.length || 0} étudiant(s) détecté(s)` : 'Format .xlsx · Colonnes : nom, prenom, email (optionnel)'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
        <Button
          variant="ember"
          size="sm"
          icon={Upload}
          loading={loading}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? 'Changer de fichier' : 'Choisir un fichier'}
        </Button>
      </motion.div>

      {/* Section 3: Preview Table */}
      <AnimatePresence>
        {preview && preview.length > 0 && !results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50 mb-4">
              Aperçu · {preview.length} étudiant{preview.length > 1 ? 's' : ''}
            </h2>
            <Card className="overflow-hidden" animate={false}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream-300 dark:border-ink-800">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-ink-400 font-semibold">#</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-ink-400 font-semibold">Prénom</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-ink-400 font-semibold">Nom</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-ink-400 font-semibold">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((e, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-cream-200 dark:border-ink-800/50 last:border-b-0"
                      >
                        <td className="px-4 py-3 text-sm text-ink-400">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-ink-900 dark:text-cream-50">{e.prenom}</td>
                        <td className="px-4 py-3 text-sm font-medium text-ink-900 dark:text-cream-50">{e.nom}</td>
                        <td className="px-4 py-3 text-sm font-mono text-ink-600 dark:text-ink-300">{e.email}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Section 4: Email checkbox + confirm */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-cream-300 dark:border-ink-700 text-ember-500 focus:ring-ember-500"
                />
                <div>
                  <span className="text-sm font-medium text-ink-900 dark:text-cream-50">
                    Envoyer les identifiants par email
                  </span>
                  <p className="text-xs text-ink-400">Nécessite la configuration SMTP du serveur</p>
                </div>
              </label>

              <Button
                variant="ember"
                icon={Users}
                loading={importing}
                onClick={confirmImport}
              >
                Confirmer l'import
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 5: Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="p-4 text-center bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900" animate={false}>
                <p className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300 mb-1">Créés</p>
                <p className="font-display text-3xl font-light text-emerald-700 dark:text-emerald-300">
                  {results.filter(r => r.statut === 'CREE').length}
                </p>
              </Card>
              <Card className="p-4 text-center bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900" animate={false}>
                <p className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-1">Doublons</p>
                <p className="font-display text-3xl font-light text-amber-700 dark:text-amber-300">
                  {results.filter(r => r.statut === 'DOUBLON').length}
                </p>
              </Card>
              <Card className="p-4 text-center bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900" animate={false}>
                <p className="text-[10px] uppercase tracking-widest text-red-700 dark:text-red-300 mb-1">Erreurs</p>
                <p className="font-display text-3xl font-light text-red-700 dark:text-red-300">
                  {results.filter(r => r.statut === 'ERREUR').length}
                </p>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50">
                Résultats de l'import
              </h2>
              <Button variant="ember" size="sm" icon={Download} onClick={downloadCsv}>
                Télécharger CSV
              </Button>
            </div>

            <div className="space-y-2">
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <Card animate={false} className={cn(
                    'p-4 flex items-center gap-4 border-l-4',
                    statutBorderColor(r.statut)
                  )}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-ink-900 dark:text-cream-50">
                          {r.prenom} {r.nom}
                        </p>
                        {statutBadge(r.statut)}
                      </div>
                      <p className="text-xs font-mono text-ink-500 dark:text-ink-400">{r.email}</p>
                      {r.message && r.statut !== 'CREE' && (
                        <p className="text-xs text-ink-400 mt-1">{r.message}</p>
                      )}
                    </div>

                    {r.motDePasseGenere && (
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-cream-200 dark:bg-ink-800 px-3 py-1.5 rounded-lg text-ink-900 dark:text-cream-50 select-all">
                          {showPasswords[i] ? r.motDePasseGenere : '••••••••'}
                        </code>
                        <button
                          onClick={() => togglePassword(i)}
                          className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-ink-800 text-ink-400 transition-colors"
                          aria-label={showPasswords[i] ? 'Masquer' : 'Afficher'}
                        >
                          {showPasswords[i] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(r.motDePasseGenere);
                            toast.success('Copié !');
                          }}
                          className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-ink-800 text-ink-400 transition-colors"
                          aria-label="Copier"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
