import type { ReactNode } from 'react';
import { Hammer } from 'lucide-react';

/**
 * Temporary body for modules that are not built yet. Replace with the real module in its build step.
 * @example <ModulePlaceholder step={6} description="Поређење варијанти и what-if калкулатор." />
 */
export function ModulePlaceholder({ step, description, children }: { step: number; description?: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface/60 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">
          <Hammer className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted">Модул у изради — корак {step}</p>
          {description !== undefined && <p className="mt-1 text-[0.95rem] text-ink">{description}</p>}
        </div>
      </div>
      {children !== undefined && <div className="mt-4">{children}</div>}
    </div>
  );
}
