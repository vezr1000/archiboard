import { useMemo, useState } from 'react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Card, FilterChips, PageHeader, Stat } from '@/components/ui';
import { people } from '@/data';
import { DISCIPLINE_LABELS } from '@/domain/labels';
import type { Discipline, Person } from '@/domain/types';
import { formatNumber, formatPct } from '@/lib/format';
import { CompetencyMatrix } from './CompetencyMatrix';
import { PersonSheet } from './PersonSheet';
import { CERT_SCHEMES, CERT_SCHEME_LABELS, hasScheme, isOverallocated, totalPct } from './teamLogic';
import { WorkloadCard } from './WorkloadCard';

/** `/tim` — firm people: stats, workload across projects, competency matrix (CONCEPT §6.12). */
export function TeamPage() {
  const [office, setOffice] = useState<string | null>(null);
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [openPerson, setOpenPerson] = useState<Person | null>(null);

  const offices = useMemo(() => [...new Set(people.map((p) => p.office).filter((o): o is string => Boolean(o)))], []);
  const disciplines = useMemo(() => [...new Set(people.map((p) => p.discipline))], []);
  const filtered = people.filter((p) => (!office || p.office === office) && (!discipline || p.discipline === discipline));

  const avg = people.reduce((s, p) => s + totalPct(p), 0) / people.length;
  const overloaded = people.filter(isOverallocated);
  const certified = people.filter((p) => p.certifications.length > 0);

  return (
    <>
      <PageHeader eyebrow="Студио Градина" title="Тим фирме" subtitle="Људи, компетенције, лиценце и ангажовање по пројектима." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card padding="sm" className="p-3.5!">
          <Stat label="Број људи" value={people.length} hint={`${offices.length} канцеларије`} size="md" />
        </Card>
        <Card padding="sm" className="p-3.5!">
          <Stat label={<span className="whitespace-normal">Просечна оптерећеност</span>} value={formatPct(avg, { decimals: 0 })} hint="збир ангажовања по особи" size="md" />
        </Card>
        <Card padding="sm" className="col-span-2 p-3.5! lg:col-span-1">
          <Stat
            label="Преоптерећени"
            value={overloaded.length}
            hint={overloaded.length > 0 ? overloaded.map((p) => p.name.split(' ')[1] ?? p.name).join(', ') : 'нико'}
            size="md"
            className={overloaded.length > 0 ? '[&_.font-display]:text-bad' : undefined}
          />
        </Card>
        <Card padding="sm" className="col-span-2 p-3.5! lg:col-span-2">
          <div className="text-[0.8rem] text-muted">Сертификовани стручњаци</div>
          <div className="mt-0.5 font-display text-[1.7rem] font-semibold leading-tight text-ink">{formatNumber(certified.length)}</div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Број стручњака по шеми">
            {CERT_SCHEMES.map((s) => (
              <li key={s}>
                {CERT_SCHEME_LABELS[s]} <span className="tabular font-semibold text-ink">{people.filter((p) => hasScheme(p, s)).length}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <FilterChips
          ariaLabel="Канцеларија"
          value={office}
          onChange={setOffice}
          options={offices.map((o) => ({ value: o, label: o, count: people.filter((p) => p.office === o).length }))}
        />
        <FilterChips
          ariaLabel="Дисциплина"
          value={discipline}
          onChange={setDiscipline}
          options={disciplines.map((d) => ({ value: d, label: DISCIPLINE_LABELS[d], count: people.filter((p) => p.discipline === d).length }))}
        />
      </div>

      <div className="flex flex-col gap-6">
        <WorkloadCard people={filtered} onOpen={setOpenPerson} />
        <CompetencyMatrix people={filtered} onOpen={setOpenPerson} />
      </div>

      <FeedbackWidget moduleId="tim" />
      <PersonSheet person={openPerson} onClose={() => setOpenPerson(null)} />
    </>
  );
}
