import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Card({ children, className, hover = false, animate = true, delay = 0, ...props }) {
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
      }
    : {};

  return (
    <motion.div
      {...animProps}
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        'rounded-2xl bg-cream-50 dark:bg-ink-900 border border-cream-300 dark:border-ink-800',
        hover && 'transition-shadow hover:shadow-soft-lg cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
