import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

/** 404 for unknown routes. */
export function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Страница не постоји"
      description="Адреса је можда погрешна или је страница премештена."
      action={<Button to="/">Назад на портфолио</Button>}
    />
  );
}
