import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store/useAppStore';

/**
 * „Ресетуј демо“ with confirmation. Clears user-created options, decisions, gate reviews, accepted requirements.
 * Feedback is kept.
 */
export function ResetDemoButton({ fullWidth, onDone }: { fullWidth?: boolean; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const resetDemo = useAppStore((s) => s.resetDemo);
  return (
    <>
      <Button variant="secondary" icon={RotateCcw} fullWidth={fullWidth} onClick={() => setOpen(true)}>
        Ресетуј демо
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ресетовати демо?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Откажи
            </Button>
            <Button
              variant="danger"
              icon={RotateCcw}
              onClick={() => {
                resetDemo();
                setOpen(false);
                onDone?.();
              }}
            >
              Ресетуј
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Брисаће се сачуване варијанте, нове одлуке, започете ревизије на одбору и прихваћени услови. Повратне информације
          публике остају сачуване.
        </p>
      </Modal>
    </>
  );
}
