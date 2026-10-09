import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';
import { useDialog } from './useDialog';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Muted line under the title. */
  subtitle?: ReactNode;
  children: ReactNode;
  /** Sticky footer (actions). */
  footer?: ReactNode;
  /** Desktop drawer width. Default 'md' (28rem). */
  width?: 'sm' | 'md' | 'lg';
}

const W = { sm: 'md:w-[22rem]', md: 'md:w-[28rem]', lg: 'md:w-[40rem]' } as const;

/**
 * Bottom sheet on mobile, right-side drawer on ≥768px. Esc / backdrop / × close it.
 * @example
 * <Sheet open={open} onClose={() => setOpen(false)} title="Историја верзија">…</Sheet>
 */
export function Sheet({ open, onClose, title, subtitle, children, footer, width = 'md' }: SheetProps) {
  const panelRef = useDialog(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'absolute flex flex-col bg-surface shadow-pop outline-none',
          // mobile: bottom sheet
          'inset-x-0 bottom-0 max-h-[88dvh] animate-slide-up rounded-t-3xl pb-safe',
          // desktop: right drawer
          'md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:animate-slide-left md:rounded-none md:rounded-l-3xl md:pb-0',
          W[width],
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong md:hidden" aria-hidden />
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 pt-3 pb-3 md:px-6 md:pt-5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-xl text-ink">
              {title}
            </h2>
            {subtitle !== undefined && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <IconButton icon={X} label="Затвори" onClick={onClose} className="-mr-2" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6">{children}</div>
        {footer !== undefined && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line px-4 py-3 md:px-6">{footer}</footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
