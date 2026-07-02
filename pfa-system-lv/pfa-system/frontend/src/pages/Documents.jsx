import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Download, Trash2, FileImage, File } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import ProjectTabs from '../components/ProjectTabs';
import { cn, formatDate } from '../lib/utils';

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
};

const iconForType = (mime) => {
  if (mime?.includes('pdf')) return { Icon: FileText, color: 'text-red-500 bg-red-50 dark:bg-red-950' };
  if (mime?.includes('word') || mime?.includes('document')) return { Icon: FileText, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' };
  if (mime?.includes('image')) return { Icon: FileImage, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950' };
  return { Icon: File, color: 'text-ink-500 bg-cream-200 dark:bg-ink-800' };
};

export default function Documents() {
  const { projetId } = useParams();
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [projet, setProjet] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => api.get(`/projets/${projetId}/documents`).then(r => setDocs(r.data));

  useEffect(() => {
    api.get(`/projets/${projetId}`).then(r => setProjet(r.data));
    load();
  }, [projetId]);

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10 Mo)');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/projets/${projetId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Fichier téléversé');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors du téléversement');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e) => handleUpload(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files?.[0]);
  };

  const download = (doc) => {
    const token = localStorage.getItem('token');
    fetch(`/api${doc.downloadUrl}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nomOriginal;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce fichier ?')) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Fichier supprimé');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Projet
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-light tracking-tightest text-ink-900 dark:text-cream-50 mb-2">
          {projet?.sujetTitre || 'Fichiers'}
        </h1>
        <p className="text-ink-500 dark:text-ink-400 mb-4 text-sm">
          PDF, Word, images · Maximum 10 Mo par fichier
        </p>
        <ProjectTabs />
      </motion.header>

      {/* Upload zone */}
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
          Glissez vos fichiers ici
        </p>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">
          ou cliquez pour parcourir
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={onFileChange}
          className="hidden"
        />
        <Button
          variant="ember"
          size="sm"
          icon={Upload}
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          Choisir un fichier
        </Button>
      </motion.div>

      {/* Liste */}
      <div>
        <h2 className="font-display text-2xl font-light tracking-tight text-ink-900 dark:text-cream-50 mb-4">
          {docs.length} {docs.length > 1 ? 'fichiers' : 'fichier'}
        </h2>
        {docs.length === 0 ? (
          <Card>
            <EmptyState
              icon={FileText}
              title="Aucun fichier"
              description="Téléversez votre premier rapport, livrable ou document."
            />
          </Card>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {docs.map((d, i) => {
                const { Icon, color } = iconForType(d.typeMime);
                const isMine = d.uploadeParId === user?.id;
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card animate={false} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink-900 dark:text-cream-50 truncate">
                            {d.nomOriginal}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-ink-500 dark:text-ink-400">
                            <span>{formatBytes(d.tailleOctets)}</span>
                            <span>·</span>
                            <span>{d.uploadeParNom}</span>
                            <span>·</span>
                            <span>{formatDate(d.dateUpload)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => download(d)}
                          className="p-2 rounded-lg text-ink-500 hover:bg-cream-200 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-cream-50 transition-colors"
                          aria-label="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {isMine && (
                          <button
                            onClick={() => remove(d.id)}
                            className="p-2 rounded-lg text-ink-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
