import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        {icon}
      </div>
      <h3 className="font-serif text-lg text-ink-800">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
