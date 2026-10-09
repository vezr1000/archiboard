import { cn } from '@/lib/cn';

export interface AvatarPerson {
  id: string;
  name: string;
  initials: string;
}

const PALETTE = [
  'bg-accent-soft text-accent',
  'bg-clay-soft text-clay',
  'bg-info-soft text-info',
  'bg-warn-soft text-warn',
  'bg-good-soft text-good',
];

/** Stable colour index from an id (djb2 hash). */
function hashIndex(id: string, mod: number): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (h * 33) ^ id.charCodeAt(i);
  return Math.abs(h) % mod;
}

const SIZE = { xs: 'size-6 text-[0.6rem]', sm: 'size-8 text-[0.7rem]', md: 'size-10 text-sm', lg: 'size-14 text-lg' } as const;

export interface AvatarProps {
  person: AvatarPerson;
  size?: keyof typeof SIZE;
  /** Show name tooltip (title). Default true. */
  showTitle?: boolean;
  className?: string;
}

/**
 * Initials avatar, colour derived from the person id.
 * @example <Avatar person={getPerson('p-ana-jovanovic')!} size="md" />
 */
export function Avatar({ person, size = 'sm', showTitle = true, className }: AvatarProps) {
  return (
    <span
      title={showTitle ? person.name : undefined}
      aria-label={person.name}
      role="img"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-wide',
        SIZE[size],
        PALETTE[hashIndex(person.id, PALETTE.length)],
        className,
      )}
    >
      {person.initials}
    </span>
  );
}

export interface AvatarStackProps {
  people: AvatarPerson[];
  /** Max avatars before „+N“. Default 4. */
  max?: number;
  size?: keyof typeof SIZE;
  className?: string;
}

/**
 * Overlapping avatars with overflow counter.
 * @example <AvatarStack people={teamForProject('savski-kej')} max={3} />
 */
export function AvatarStack({ people, max = 4, size = 'sm', className }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className={cn('inline-flex items-center', className)} aria-label={people.map((p) => p.name).join(', ')} role="group">
      {shown.map((p, i) => (
        <Avatar key={p.id} person={p} size={size} className={cn('ring-2 ring-surface', i > 0 && '-ml-2')} />
      ))}
      {rest > 0 && (
        <span className={cn('-ml-2 inline-flex items-center justify-center rounded-full bg-surface-2 font-semibold text-muted ring-2 ring-surface', SIZE[size])}>
          +{rest}
        </span>
      )}
    </span>
  );
}
