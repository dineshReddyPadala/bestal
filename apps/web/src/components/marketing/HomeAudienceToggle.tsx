import { cn } from '@bestal/shared-utils';
import { Link, useLocation } from 'react-router-dom';

const AUDIENCE_OPTIONS = [
  { id: 'talent', label: 'Hire Talent', href: '/' },
  { id: 'consulting', label: 'Consulting Services', href: '/consulting' },
] as const;

function isActiveOption(pathname: string, optionId: (typeof AUDIENCE_OPTIONS)[number]['id']) {
  if (optionId === 'talent') {
    return pathname === '/';
  }

  return pathname === '/consulting' || pathname.startsWith('/consulting/');
}

export function HomeAudienceToggle() {
  const { pathname } = useLocation();

  return (
    <div className="mkt-home-audience-toggle-wrap">
      <span className="mkt-home-audience-toggle-label"></span>
      <div
        className="mkt-home-audience-toggle"
        role="group"
        aria-label="Choose Talent or Consulting"
      >
        {AUDIENCE_OPTIONS.map((option) => {
          const isActive = isActiveOption(pathname, option.id);

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
    </div>
  );
}
