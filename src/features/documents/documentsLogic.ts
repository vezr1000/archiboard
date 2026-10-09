import { DOCUMENT_STATUS_LABELS } from '@/domain/labels';
import type { DocumentStatus, DocumentType, ProjectDocument } from '@/domain/types';

export type DocSort = 'updated' | 'title' | 'status';

export const DOC_SORT_OPTIONS: Array<{ value: DocSort; label: string }> = [
  { value: 'updated', label: 'Најновије измене' },
  { value: 'title', label: 'Назив А–Ш' },
  { value: 'status', label: 'Статус' },
];

/** Lower = needs more attention. */
const STATUS_ORDER: Record<DocumentStatus, number> = { draft: 0, review: 1, approved: 2, superseded: 3 };

export function sortDocuments(docs: ProjectDocument[], sort: DocSort): ProjectDocument[] {
  const list = [...docs];
  const byTitle = (a: ProjectDocument, b: ProjectDocument) => a.title.localeCompare(b.title, 'sr-Cyrl');
  if (sort === 'title') return list.sort(byTitle);
  if (sort === 'status') {
    return list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.updated.localeCompare(a.updated) || byTitle(a, b));
  }
  return list.sort((a, b) => b.updated.localeCompare(a.updated) || byTitle(a, b));
}

export const statusLabel = (s: DocumentStatus): string => DOCUMENT_STATUS_LABELS[s];

/** Which fake preview a document type gets. */
export type PreviewKind = 'drawing' | 'chart' | 'text';

export function previewKind(type: DocumentType): PreviewKind {
  switch (type) {
    case 'crtez':
    case 'bim':
      return 'drawing';
    case 'lca':
    case 'energetski-model':
    case 'proracun':
    case 'elaborat-ee':
      return 'chart';
    default:
      return 'text';
  }
}

/** „недостаје 1“ / „недостају 2“ / „недостаје 5“ (Serbian agreement with numerals). */
export const missingVerb = (n: number): string => (n >= 2 && n <= 4 ? 'недостају' : 'недостаје');

/** Case-insensitive match over title, version and owner name. */
export function matchesQuery(doc: ProjectDocument, ownerName: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${doc.title} ${doc.version} ${ownerName}`.toLowerCase().includes(q);
}
