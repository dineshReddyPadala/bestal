import { cn } from '@bestal/shared-utils';
import { Link, useLocation } from 'react-router-dom';

const AUDIENCE_OPTIONS = [
  { id: 'talent', label: 'Talent', href: '/talent' },
  { id: 'consulting', label: 'Consulting & Services', href: '/consulting' },
] as const;

export function HomeAudienceToggle() {
  const { pathname } = useLocation();

  return (
    <div className="mkt-home-audience-toggle" role="group" aria-label="Choose Talent or Consulting">
      {AUDIENCE_OPTIONS.map((option) => {
        const isActive =
          option.id === 'talent'
            ? pathname === '/' ||
              pathname === option.href ||
              pathname.startsWith(`${option.href}/`)
            : pathname === option.href || pathname.startsWith(`${option.href}/`);

        return (
          <Link
            key={option.id}
            to={option.href}
            className={cn('mkt-home-audience-toggle-btn', isActive && 'is-active')}
            aria-current={isActive ? 'page' : undefined}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
