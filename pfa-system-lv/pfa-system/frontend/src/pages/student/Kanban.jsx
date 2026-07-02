import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCorners, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import ProjectTabs from '../../components/ProjectTabs';
import { cn } from '../../lib/utils';

const COLUMNS = [
  { key: 'TODO', label: 'À faire', accent: 'border-ink-300 dark:border-ink-700', dot: 'bg-ink-400' },
  { key: 'DOING', label: 'En cours', accent: 'border-ember-400', dot: 'bg-ember-500' },
  { key: 'DONE', label: 'Terminé', accent: 'border-emerald-400', dot: 'bg-emerald-500' },
];

function TaskCard({ task, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-cream-50 dark:bg-ink-900 border border-cream-300 dark:border-ink-800 rounded-xl p-3.5 shadow-soft hover:shadow-soft-lg transition-shadow"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-ink-300 dark:text-ink-600 hover:text-ink-500 dark:hover:text-ink-400 cursor-grab active:cursor-grabbing mt-0.5"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink-900 dark:text-cream-50 leading-snug">{task.titre}</p>
          {task.description && <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">{task.description}</p>}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-red-500 transition-all p-0.5"
          aria-label="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function Column({ column, tasks, onAddTask, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(column.key, newTitle.trim());
    setNewTitle('');
    setAdding(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', column.dot)} />
          <h3 className="text-sm font-semibold tracking-tight text-ink-900 dark:text-cream-50">
            {column.label}
          </h3>
          <span className="text-xs text-ink-400 font-mono">{tasks.length}</span>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="w-6 h-6 rounded-md hover:bg-cream-200 dark:hover:bg-ink-800 text-ink-500 transition-colors flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className={cn(
        'flex-1 min-h-[400px] rounded-2xl border-2 border-dashed bg-cream-100/30 dark:bg-ink-900/30 p-3 space-y-2 transition-colors',
        column.accent
      )}>
        <AnimatePresence>
          {adding && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleAdd}
              className="bg-cream-50 dark:bg-ink-900 border border-ember-500 rounded-xl p-2"
            >
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => !newTitle && setAdding(false)}
                placeholder="Nouvelle tâche…"
                className="w-full text-sm bg-transparent focus:outline-none placeholder:text-ink-400"
              />
              <div className="flex gap-1 mt-2">
                <button type="submit" className="text-xs px-2.5 py-1 rounded-md bg-ember-500 text-white font-medium">
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setNewTitle(''); }}
                  className="text-xs px-2.5 py-1 rounded-md text-ink-500 hover:bg-cream-200 dark:hover:bg-ink-800"
                >
                  Annuler
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <TaskCard task={t} onDelete={onDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && !adding && (
          <p className="text-xs text-ink-400 text-center py-12 italic">
            Glissez une tâche ici ou cliquez sur +
          </p>
        )}
      </div>
    </div>
  );
}

export default function Kanban() {
  const { projetId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [projet, setProjet] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = () => api.get(`/projets/${projetId}/tasks`).then(r => setTasks(r.data));

  useEffect(() => {
    api.get(`/projets/${projetId}`).then(r => setProjet(r.data));
    load();
  }, [projetId]);

  const findTask = (taskId) => tasks.find(t => t.id === taskId);
  const findColumn = (taskId) => findTask(taskId)?.statut;

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumn(active.id);
    let overColumn = findColumn(over.id);
    if (!overColumn && COLUMNS.find(c => c.key === over.id)) {
      overColumn = over.id;
    }

    if (activeColumn !== overColumn && overColumn) {
      setTasks(prev => prev.map(t => t.id === active.id ? { ...t, statut: overColumn } : t));
      try {
        await api.put(`/tasks/${active.id}`, { statut: overColumn });
      } catch (e) {
        toast.error('Erreur de mise à jour');
        load();
      }
    }
  };

  const addTask = async (statut, titre) => {
    try {
      await api.post(`/projets/${projetId}/tasks`, { titre, statut });
      load();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Supprimer cette tâche ?')) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Tâche supprimée');
    } catch (e) {
      load();
    }
  };

  const activeTask = activeId ? findTask(activeId) : null;

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-600 dark:text-ember-400 mb-2">
          Projet
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-light leading-tight tracking-tightest text-ink-900 dark:text-cream-50 mb-4">
          {projet?.sujetTitre || 'Tableau de bord'}
        </h1>
        <ProjectTabs />
      </motion.header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map((col) => (
            <Column
              key={col.key}
              column={col}
              tasks={tasks.filter(t => t.statut === col.key)}
              onAddTask={addTask}
              onDelete={deleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-cream-50 dark:bg-ink-900 border border-ember-500 rounded-xl p-3.5 shadow-glow-ember rotate-2">
              <p className="text-sm font-medium text-ink-900 dark:text-cream-50">{activeTask.titre}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
