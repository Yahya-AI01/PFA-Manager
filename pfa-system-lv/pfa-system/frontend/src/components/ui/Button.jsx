import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const variants = {
  primary:
    'bg-ink-900 text-cream-50 hover:bg-ink-800 dark:bg-cream-50 dark:text-ink-900 dark:hover:bg-cream-200',
  ember:
    'bg-ember-500 text-white hover:bg-ember-600 shadow-glow-ember',
  ghost:
    'bg-transparent text-ink-900 hover:bg-ink-900/5 dark:text-cream-50 dark:hover:bg-cream-50/10',
  outline:
    'border border-ink-200 text-ink-900 hover:border-ink-900 hover:bg-ink-50 dark:border-ink-700 dark:text-cream-50 dark:hover:border-cream-50 dark:hover:bg-ink-800',
  danger:
    'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled,
  icon: Icon,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      disabled={loading || disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full font-medium tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Chargement…</span>
        </span>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </motion.button>
  );
}
