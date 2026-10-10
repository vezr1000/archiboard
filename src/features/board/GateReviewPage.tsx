import { useState } from 'react';
import { useParams } from 'react-router';
import { ArrowRight, CalendarDays, MapPin, RotateCcw, SearchX } from 'lucide-react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { Button, Callout, EmptyState, Modal, PageHeader } from '@/components/ui';
import { getProject, getSession } from '@/data';
import { GATE_LABELS } from '@/domain/labels';
import type { BoardSession, Project } from '@/domain/types';
import { formatDate, formatRelative } from '@/lib/format';
import { useAppStore, useGateReview } from '@/store';
import { MinutesDocument } from './MinutesDocument';
import { minutesFromReview, minutesFromSeed } from './reviewLogic';
import { ReviewStepper } from './ReviewStepper';
import { SessionOutcomeBadge } from './SessionOutcomeBadge';

/**
 * `/odbor/:sessionId` — ★ gate review (CONCEPT §6.13).
 * Scheduled session → 6-step review (progress persisted per session); once closed, or for held sessions → Записник.
 */
export function GateReviewPage() {
  const { sessionId } = useParams();
  const session = getSession(sessionId);
  const project = getProject(session?.projectId);
  if (!session || !project) {
    return (
      <>
        <PageHeader back={{ to: paths.board(), label: 'Одбор' }} eyebrow="Ревизија капије" title="Седница није пронађена" />
        <EmptyState
          icon={SearchX}
          title="Ова седница не постоји"
          description="Можда је линк застарео. Изаберите седницу са листе одбора."
          action={
            <Button to={paths.board()} variant="secondary">
              Све седнице
            </Button>
          }
        />
        <FeedbackWidget moduleId="odbor-revizija" />
      </>
    );
  }
  return <SessionBody key={session.id} session={session} project={project} />;
}

function SessionBody({ session, project }: { session: BoardSession; project: Project }) {
  const review = useGateReview(session.id);
  const clearGateReview = useAppStore((s) => s.clearGateReview);
  const removeUserDecision = useAppStore((s) => s.removeUserDecision);
  const [confirmReset, setConfirmReset] = useState(false);
  const held = session.outcome !== 'scheduled';
  const completed = !held && Boolean(review?.outcome);

  const reset = () => {
    if (review?.decisionId) removeUserDecision(review.decisionId);
    clearGateReview(session.id);
    setConfirmReset(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <PageHeader
        className="print:hidden"
        back={{ to: paths.board(), label: 'Одбор' }}
        eyebrow={`${GATE_LABELS[session.gate].full} · ${held || completed ? 'записник' : 'ревизија капије'}`}
        title={project.name}
        meta={
          <>
            <SessionOutcomeBadge sessionId={session.id} size="md" />
            <span className="inline-flex items-center gap-1 text-sm text-muted">
              <CalendarDays className="size-4" aria-hidden />
              {formatDate(session.date, 'weekday')} · {formatRelative(session.date)}
            </span>
            {session.location && (
              <span className="inline-flex min-w-0 items-center gap-1 text-sm text-muted">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{session.location}</span>
              </span>
            )}
          </>
        }
        actions={
          !held && review ? (
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setConfirmReset(true)}>
              Ресетуј ревизију
            </Button>
          ) : undefined
        }
      />

      {held && <MinutesDocument minutes={minutesFromSeed(session)} />}

      {completed && review && (
        <>
          <Callout tone="good" title="Седница је завршена" className="mb-5 print:hidden">
            <p>
              Одлука „{GATE_LABELS[session.gate].full} — одлука одбора“ уписана је у дневник одлука пројекта, са условима,
              носиоцима и роковима.
            </p>
            {review.decisionId && (
              <Button
                size="sm"
                variant="secondary"
                iconRight={ArrowRight}
                className="mt-2"
                to={`${paths.project(project.id, 'odluke')}?decision=${review.decisionId}`}
              >
                У дневнику одлука
              </Button>
            )}
          </Callout>
          <MinutesDocument minutes={minutesFromReview(session, review)} />
        </>
      )}

      {!held && !completed && <ReviewStepper session={session} project={project} />}

      <div className="print:hidden">
        <FeedbackWidget moduleId="odbor-revizija" question="Да ли бисте водили ревизију капије на овај начин?" />
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Ресетовати ревизију?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Одустани
            </Button>
            <Button variant="danger" icon={RotateCcw} onClick={reset}>
              Ресетуј
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed">
          Бришу се присуство, прегледи докумената, одлуке о налазима, услови и гласови за ову седницу
          {completed ? ', као и одлука уписана у дневник одлука' : ''}. Остали подаци демоа остају.
        </p>
      </Modal>
    </>
  );
}
