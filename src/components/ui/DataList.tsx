import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { EmptyState } from './EmptyState';

export interface DataColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  /** CSS width for the table column, e.g. '30%' or '8rem'. */
  width?: string;
  /** Hide this column in the mobile card. */
  hideOnMobile?: boolean;
  /** Label in the mobile card (defaults to `header`). Use `null` to show the value without a label. */
  mobileLabel?: ReactNode | null;
}

export interface DataListProps<T> {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string;
  /** Column id rendered as the mobile card title (default: first column). */
  primaryColumn?: string;
  /** Optional element shown at the top-right of each mobile card (e.g. a status badge). */
  mobileAside?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  /** Highlighted row key. */
  selectedKey?: string;
  emptyText?: ReactNode;
  /** Group rows (must already be sorted so that groups are contiguous). A header is rendered before each group. */
  groupBy?: (row: T) => string;
  /** Header content of a group (default: the group key). */
  groupHeader?: (key: string, rows: T[]) => ReactNode;
  /** Accessible table caption (visually hidden). */
  caption?: string;
  className?: string;
}

/**
 * Responsive list: a table on ≥768px, stacked cards on mobile — same column definitions.
 * @example
 * <DataList rows={docs} rowKey={(d) => d.id} caption="Документа"
 *   columns={[
 *     { id: 'title', header: 'Назив', cell: (d) => d.title },
 *     { id: 'status', header: 'Статус', cell: (d) => <Badge>{DOCUMENT_STATUS_LABELS[d.status]}</Badge> },
 *     { id: 'updated', header: 'Измењено', cell: (d) => formatDate(d.updated, 'short'), align: 'right' },
 *   ]} />
 */
export function DataList<T>({
  rows,
  columns,
  rowKey,
  primaryColumn,
  mobileAside,
  onRowClick,
  selectedKey,
  emptyText = 'Нема ставки.',
  groupBy,
  groupHeader,
  caption,
  className,
}: DataListProps<T>) {
  if (rows.length === 0) return <EmptyState compact title={emptyText} className={className} />;
  const primary = columns.find((c) => c.id === primaryColumn) ?? columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);
  const groups: Array<{ key: string; rows: T[] }> = [];
  for (const row of rows) {
    const key = groupBy ? groupBy(row) : '';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.rows.push(row);
    else groups.push({ key, rows: [row] });
  }
  const headerOf = (g: { key: string; rows: T[] }) => (groupHeader ? groupHeader(g.key, g.rows) : g.key);
  const alignCls = (a?: 'left' | 'right' | 'center') => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

  return (
    <div className={cn('min-w-0', className)}>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block">
        <table className="w-full border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line bg-surface-2/60">
              {columns.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  style={c.width ? { width: c.width } : undefined}
                  className={cn('px-4 py-2.5 text-xs font-semibold text-muted', alignCls(c.align))}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => [
              groupBy && (
                <tr key={`g-${g.key}`} className="border-b border-line bg-surface-2/50">
                  <th colSpan={columns.length} scope="colgroup" className="px-4 py-2 text-left text-xs font-semibold text-ink">
                    {headerOf(g)}
                  </th>
                </tr>
              ),
              ...g.rows.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-line last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-surface-2/60',
                    selectedKey === key && 'bg-accent-soft/50',
                  )}
                >
                  {columns.map((c, i) => (
                    <td key={c.id} className={cn('px-4 py-3 align-middle text-ink', alignCls(c.align))}>
                      {i === 0 && onRowClick ? (
                        <button
                          type="button"
                          className="text-left font-medium hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick(row);
                          }}
                        >
                          {c.cell(row)}
                        </button>
                      ) : (
                        c.cell(row)
                      )}
                    </td>
                  ))}
                </tr>
              );
              }),
            ])}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-2 md:hidden" aria-label={caption}>
        {groups.map((g) => [
          groupBy && (
            <li key={`g-${g.key}`} className="mt-2 px-1 text-xs font-semibold text-ink first:mt-0">
              {headerOf(g)}
            </li>
          ),
          ...g.rows.map((row) => {
          const key = rowKey(row);
          const body = (
            <>
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 font-medium text-ink">{primary.cell(row)}</div>
                {mobileAside && <div className="shrink-0">{mobileAside(row)}</div>}
                {onRowClick && !mobileAside && <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />}
              </div>
              {rest.length > 0 && (
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {rest.map((c) => (
                    <div key={c.id} className={cn('min-w-0', c.mobileLabel === null && 'col-span-2')}>
                      {c.mobileLabel !== null && <dt className="text-[0.7rem] text-muted">{c.mobileLabel ?? c.header}</dt>}
                      <dd className="min-w-0 break-words text-sm text-ink">{c.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </>
          );
          return (
            <li key={key}>
              {onRowClick ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onRowClick(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  className={cn(
                    'block w-full cursor-pointer rounded-2xl border bg-surface p-3.5 text-left transition-colors hover:border-line-strong',
                    selectedKey === key ? 'border-accent' : 'border-line',
                  )}
                >
                  {body}
                </div>
              ) : (
                <div className="rounded-2xl border border-line bg-surface p-3.5">{body}</div>
              )}
            </li>
          );
          }),
        ])}
      </ul>
    </div>
  );
}
