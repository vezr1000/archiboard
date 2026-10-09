import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Accessible label (defaults to placeholder). */
  ariaLabel?: string;
  className?: string;
}

/**
 * Search field with clear button.
 * @example <SearchInput value={q} onChange={setQ} placeholder="Претражи прописе…" />
 */
export function SearchInput({ value, onChange, placeholder = 'Претрага…', ariaLabel, className }: SearchInputProps) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-11 w-full rounded-xl border border-line bg-surface pr-10 pl-9 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Обриши претрагу"
          className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
