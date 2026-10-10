import { Suspense, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui';

/** Calm placeholder shown while a lazily loaded route chunk arrives. */
export function PageFallback() {
  return (
    <div className="flex flex-col gap-4 py-2" role="status" aria-label="Учитавање…">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton lines={3} />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

/** Suspense boundary for route outlets. */
export function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}
