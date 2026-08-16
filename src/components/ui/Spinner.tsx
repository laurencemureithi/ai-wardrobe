interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-ink-200 border-t-ink-900 ${className}`}
    />
  );
}
