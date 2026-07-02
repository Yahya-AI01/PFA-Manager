import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16 px-6"
    >
      {Icon && (
        <div className="inline-flex w-14 h-14 rounded-2xl bg-cream-200 dark:bg-ink-800 items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-ink-500 dark:text-ink-400" />
        </div>
      )}
      <h3 className="font-display text-2xl font-light text-ink-900 dark:text-cream-50 mb-1.5 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink-500 dark:text-ink-400 max-w-sm mx-auto mb-5">
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
}
