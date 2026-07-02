import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

function AnimatedNumber({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (n) => Math.round(n));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value]);

  return <span>{display}</span>;
}

export default function StatCard({ label, value, icon: Icon, accent = false, delay = 0, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 border',
        accent
          ? 'bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 border-ink-900 dark:border-cream-50'
          : 'bg-cream-50 dark:bg-ink-900 border-cream-300 dark:border-ink-800'
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <p className={cn(
            'text-xs font-medium uppercase tracking-widest',
            accent ? 'text-cream-300 dark:text-ink-600' : 'text-ink-500 dark:text-ink-400'
          )}>
            {label}
          </p>
          {Icon && (
            <Icon className={cn(
              'w-4 h-4',
              accent ? 'text-cream-300 dark:text-ink-500' : 'text-ink-400'
            )} />
          )}
        </div>
        <div className="flex items-end justify-between">
          <p className="font-display text-5xl font-light tracking-tightest leading-none">
            <AnimatedNumber value={value} />
          </p>
          {trend && (
            <span className={cn(
              'text-xs font-medium pb-1',
              trend > 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>

      {/* Decorative accent line */}
      {accent && (
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-ember-500/20 blur-2xl" />
      )}
    </motion.div>
  );
}
