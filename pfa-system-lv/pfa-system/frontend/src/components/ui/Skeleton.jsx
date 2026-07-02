import { cn } from '../../lib/utils';

export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-cream-200 via-cream-300 to-cream-200 dark:from-ink-800 dark:via-ink-700 dark:to-ink-800 bg-[length:200%_100%] animate-shimmer rounded-lg',
        className
      )}
    />
  );
}
