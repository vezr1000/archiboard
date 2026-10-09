import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { Avatar, Badge, Card, DataList, FilterChips, type DataColumn } from '@/components/ui';
import { getDocument, getPerson } from '@/data';
import { CRITERION_STATUS_LABELS, CRITERION_STATUS_TONE } from '@/domain/labels';
import type { CertificationCriterion, CriterionStatus } from '@/domain/types';
import { categoryBreakdown, categoryUnit } from '@/lib/cert';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { categoryCode, sortedCriteria, splitCriterionCode, type CertModel } from './certLogic';

const STATUS_ORDER: CriterionStatus[] = ['achieved', 'on-track', 'at-risk', 'not-started'];

const num = (v: number) => formatNumber(v, Number.isInteger(v) ? 0 : 1);

/** Points / measured value of a criterion in the unit of the scheme. */
function valueCell(model: CertModel, c: CertificationCriterion) {
  if (c.points === undefined && c.maxPoints === undefined) return <span className="text-muted">—</span>;
  if (model.scheme === 'Passivhaus') {
    if (c.points === undefined) return <span className="text-muted tabular">граница ≤ {num(c.maxPoints as number)}</span>;
    const over = c.maxPoints !== undefined && c.points > c.maxPoints;
    return (
      <span className="tabular whitespace-nowrap">
        <span className={cn('font-medium', over ? 'text-bad' : 'text-ink')}>{num(c.points)}</span>
        {c.maxPoints !== undefined && <span className="text-muted"> / ≤ {num(c.maxPoints)}</span>}
      </span>
    );
  }
  return (
    <span className="tabular">
      <span className="font-medium text-ink">{c.points === undefined ? '—' : num(c.points)}</span>
      {c.maxPoints !== undefined && <span className="text-muted"> / {num(c.maxPoints)}</span>}
    </span>
  );
}

export function CriteriaCard({ model, criteria }: { model: CertModel; criteria: CertificationCriterion[] }) {
  const [status, setStatus] = useState<CriterionStatus | null>(null);
  const { tracker, scheme, project } = model;
  const codes = tracker.categories.map((c) => c.id);
  const sorted = sortedCriteria(tracker, criteria);
  const rows = status ? sorted.filter((c) => c.status === status) : sorted;
  const hasValues = criteria.some((c) => c.points !== undefined || c.maxPoints !== undefined);
  const unit = categoryUnit(scheme);

  const columns: DataColumn<CertificationCriterion>[] = [
    {
      id: 'label',
      header: 'Критеријум',
      width: hasValues ? '36%' : '44%',
      cell: (c) => {
        const { code, title } = splitCriterionCode(c.label, codes);
        return (
          <span className="block min-w-0">
            {code && <span className="tabular mr-1.5 font-semibold text-muted">{code}</span>}
            <span className="font-medium">{title}</span>
          </span>
        );
      },
    },
    ...(hasValues
      ? [
          {
            id: 'points',
            header: scheme === 'Passivhaus' ? 'Вредност / граница' : scheme === 'LEED' ? 'Поени' : 'Бодови',
            width: '16%',
            cell: (c: CertificationCriterion) => valueCell(model, c),
          },
        ]
      : []),
    {
      id: 'owner',
      header: 'Одговоран',
      mobileLabel: 'Одговоран',
      cell: (c) => {
        const p = getPerson(c.ownerId);
        return p ? (
          <span className="flex min-w-0 items-center gap-2">
            <Avatar person={p} size="xs" showTitle={false} />
            <span className="min-w-0 truncate">{p.name}</span>
          </span>
        ) : (
          <span className="text-muted">—</span>
        );
      },
    },
    {
      id: 'status',
      header: 'Статус',
      hideOnMobile: true,
      cell: (c) => (
        <Badge tone={CRITERION_STATUS_TONE[c.status]} dot size="sm">
          {CRITERION_STATUS_LABELS[c.status]}
        </Badge>
      ),
    },
    {
      id: 'evidence',
      header: 'Доказ',
      mobileLabel: 'Доказ',
      cell: (c) => {
        const doc = getDocument(c.evidenceDocumentId);
        if (!doc) return <span className="text-muted">—</span>;
        return (
          <Link
            to={`${paths.project(project.id, 'dokumenta')}?doc=${doc.id}`}
            className="flex w-full max-w-56 items-center gap-1.5 text-accent hover:underline md:max-w-48 lg:max-w-64"
            title={doc.title}
          >
            <FileText className="size-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">{doc.title}</span>
          </Link>
        );
      },
    },
  ];

  return (
    <Card title="Критеријуми" subtitle={`${criteria.length} ${criteria.length === 1 ? 'критеријум' : 'критеријума'} · груписани по категорији`}>
      <FilterChips
        ariaLabel="Филтер по статусу"
        className="mb-4"
        value={status}
        onChange={setStatus}
        options={STATUS_ORDER.map((s) => ({ value: s, label: CRITERION_STATUS_LABELS[s], count: criteria.filter((c) => c.status === s).length }))}
      />
      <DataList
        rows={rows}
        rowKey={(c) => c.id}
        caption="Критеријуми сертификације"
        columns={columns}
        mobileAside={(c) => (
          <Badge tone={CRITERION_STATUS_TONE[c.status]} dot size="sm">
            {CRITERION_STATUS_LABELS[c.status]}
          </Badge>
        )}
        emptyText="Нема критеријума са овим статусом."
        groupBy={(c) => c.categoryId}
        groupHeader={(key) => {
          const cat = tracker.categories.find((c) => c.id === key);
          if (!cat) return key;
          const b = categoryBreakdown(cat);
          return (
            <span className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span>
                {categoryCode(cat.id) ? (
                  <>
                    <span className="tabular">{categoryCode(cat.id)}</span> <span className="font-normal text-muted">· {cat.label}</span>
                  </>
                ) : (
                  cat.label
                )}
              </span>
              <span className="tabular font-normal text-muted">
                {num(b.achieved)} / {num(b.max)} {unit}
              </span>
            </span>
          );
        }}
      />
    </Card>
  );
}
