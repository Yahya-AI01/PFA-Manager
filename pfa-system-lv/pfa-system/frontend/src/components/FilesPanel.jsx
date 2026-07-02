import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Download, Trash2, File } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { cn } from '../lib/utils';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getCategoryColor = (cat) => {
  const map = {
    RAPPORT: 'text-ember-700 bg-ember-50 dark:bg-ember-950 dark:text-ember-300',
    LIVRABLE: 'text-violet-700 bg-violet-50 dark:bg-violet-950 dark:text-violet-300',
    ANNEXE: 'text-ink-700 bg-ink-100 dark:bg-ink-800 dark:text-ink-200',
  };
  return map[cat] || map.ANNEXE;
};

export default function FilesPanel({ projetId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categorie, setCategorie] = useState('RAPPORT');
  const inputRef = useRef(null);

  const load = () => api.get(`/projets/${projetId}/fichiers`).then(r => setFiles(r.data));

  useEffect(() => { if (projetId) load(); }, [projetId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categorie', categorie);
    try {
      await api.post(`/projets/${projetId}/fichiers`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Fichier uploadé');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur d\'upload');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const download = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/fichiers/${file.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.nomOriginal;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erreur de téléchargement');
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce fichier ?')) return;
    await api.delete(`/fichiers/${id}`);
    toast.success('Fichier supprimé');
    load();
  };

  return (
    <div className="rounded-2xl bg-cream-50 dark:bg-ink-900 border border-cream-300 dark:border-ink-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-cream-300 dark:border-ink-800 flex items-center gap-2">
        <FileText className="w-4 h-4 text-ember-500" />
        <h3 className="font-display text-lg font-light tracking-tight text-ink-900 dark:text-cream-50 flex-1">
          Fichiers
        </h3>
        <span className="text-xs text-ink-400 font-mono">{files.length}</span>
      </div>

      {/* Upload zone */}
      <div className="p-4 border-b border-cream-300 dark:border-ink-800">
        <div className="flex gap-2 mb-3">
          {['RAPPORT', 'LIVRABLE', 'ANNEXE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategorie(cat)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full font-medium transition-all',
                categorie === cat
                  ? 'bg-ink-900 text-cream-50 dark:bg-cream-50 dark:text-ink-900'
                  : 'border border-cream-300 dark:border-ink-700 text-ink-600 dark:text-ink-300'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="block">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className={cn(
            'flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
            uploading
              ? 'border-ember-500 bg-ember-50 dark:bg-ember-950'
              : 'border-cream-300 dark:border-ink-700 hover:border-ember-500'
          )}>
            <Upload className={cn('w-4 h-4', uploading ? 'animate-bounce text-ember-500' : 'text-ink-400')} />
            <span className="text-sm text-ink-600 dark:text-ink-300">
              {uploading ? 'Upload en cours…' : 'Cliquer pour uploader (PDF, Word, image · 20 MB max)'}
            </span>
          </div>
        </label>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto p-3">
        {files.length === 0 ? (
          <p className="text-sm text-ink-400 italic text-center py-6">Aucun fichier.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <motion.li
                key={f.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-200/50 dark:hover:bg-ink-800/50 transition-colors group"
              >
                <File className="w-4 h-4 text-ink-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 dark:text-cream-50 truncate">
                    {f.nomOriginal}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded', getCategoryColor(f.categorie))}>
                      {f.categorie}
                    </span>
                    <span className="text-[10px] text-ink-400">{formatSize(f.tailleOctets)}</span>
                    <span className="text-[10px] text-ink-400">· {f.uploaderNom}</span>
                  </div>
                </div>
                <button
                  onClick={() => download(f)}
                  className="p-1.5 text-ink-500 hover:text-ember-600 hover:bg-cream-200 dark:hover:bg-ink-800 rounded-lg transition-colors"
                  aria-label="Télécharger"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(f.id)}
                  className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
