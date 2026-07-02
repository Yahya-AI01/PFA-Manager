import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
  ember: 'bg-ember-50 text-ember-700 dark:bg-ember-950 dark:text-ember-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  outline: 'border border-ink-200 text-ink-700 dark:border-ink-700 dark:text-ink-200',
};

export default function Badge({ children, variant = 'default', className, dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight',
        variants[variant],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
