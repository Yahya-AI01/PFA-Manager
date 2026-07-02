import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium tracking-tight text-ink-600 dark:text-ink-300 uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-cream-100 dark:bg-ink-800 border border-cream-300 dark:border-ink-700 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 dark:text-cream-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition-all',
            Icon && 'pl-9',
            error && 'border-red-400 focus:ring-red-500/40 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
