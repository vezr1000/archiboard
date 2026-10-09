import { cn } from '@/lib/cn';

export interface SkeletonProps {
  /** Size/shape via classes, e.g. 'h-4 w-32' or 'size-10 rounded-full'. */
  className?: string;
  /** Render N text lines (last one shorter) instead of a single block. */
  lines?: number;
}

/**
 * Shimmering placeholder.
 * @example <Skeleton className="h-24 w-full" />  <Skeleton lines={3} />
 */
export function Skeleton({ className, lines }: SkeletonProps) {
  const base =
    'animate-shimmer rounded-lg bg-[linear-gradient(90deg,var(--surface-2)_25%,var(--line)_50%,var(--surface-2)_75%)] bg-[length:200%_100%]';
  if (lines) {
    return (
      <div className={cn('flex flex-col gap-2', className)} aria-hidden>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={cn(base, 'h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    );
  }
  return <div className={cn(base, 'h-4 w-full', className)} aria-hidden />;
}
