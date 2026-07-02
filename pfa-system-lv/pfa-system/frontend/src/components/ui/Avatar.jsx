import { motion } from 'framer-motion';
import { colorFromString, getInitials, cn } from '../../lib/utils';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
};

export default function Avatar({ prenom, nom, email, size = 'md', className, animate = false }) {
  const seed = email || `${prenom}${nom}`;
  const { bg, fg } = colorFromString(seed);
  const initials = getInitials(prenom, nom);

  const Component = animate ? motion.div : 'div';
  const animProps = animate
    ? {
        initial: { scale: 0, rotate: -180 },
        animate: { scale: 1, rotate: 0 },
        transition: { type: 'spring', damping: 12, stiffness: 200 },
      }
    : {};

  return (
    <Component
      {...animProps}
      style={{ backgroundColor: bg, color: fg }}
      className={cn(
        'rounded-full flex items-center justify-center font-medium tracking-tight shrink-0 ring-2 ring-cream-50 dark:ring-ink-900',
        sizes[size],
        className
      )}
      aria-label={`${prenom} ${nom}`}
    >
      {initials}
    </Component>
  );
}
