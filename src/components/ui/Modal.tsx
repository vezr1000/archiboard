import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';
import { useDialog } from './useDialog';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const W = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' } as const;

/**
 * Centred dialog (confirmation, short forms). For long content prefer Sheet.
 * @example
 * <Modal open={open} onClose={close} title="Ресетовати демо?" footer={<Button variant="danger" onClick={reset}>Ресетуј</Button>}>…</Modal>
 */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const panelRef = useDialog(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[85dvh] w-full animate-slide-up flex-col rounded-3xl bg-surface shadow-pop outline-none',
          W[size],
        )}
      >
        <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-2">
          <h2 id={titleId} className="min-w-0 font-display text-xl text-ink">
            {title}
          </h2>
          <IconButton icon={X} label="Затвори" onClick={onClose} className="-mt-1 -mr-2" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 text-[0.95rem] text-ink">{children}</div>
        {footer !== undefined && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
