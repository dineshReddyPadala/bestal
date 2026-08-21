import { Link } from 'react-router-dom';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { getStaffTeamPortals } from '../../lib/login-portals';
import type { LucideIcon } from 'lucide-react';

type PortalOption = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
};

const COLOR_CLASS_MAP: Record<string, string> = {
  'is-violet': 'bg-violet-100 text-violet-700',
  'is-amber': 'bg-amber-100 text-amber-700',
  'is-teal': 'bg-teal-100 text-teal-700',
};

function PortalOptionList({ portals }: { portals: PortalOption[] }) {
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-muted-foreground">
        Select the portal that matches your role
      </p>
      {portals.map(({ id, name, description, href, icon: Icon, color }) => (
        <Link
          key={id}
          to={href}
          className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-all hover:border-brand/40 hover:bg-muted/50 hover:shadow-card sm:gap-4 sm:p-4"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${color}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ForwardArrow className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
        </Link>
      ))}
    </div>
  );
}

/** @deprecated Use StaffPortalLoginPage at /login/portal */
export function PortalSelectorPage() {
  const portals: PortalOption[] = getStaffTeamPortals({ adminHref: '/admin/login' }).map(
    (portal) => ({
      id: portal.id,
      name: portal.name,
      description: portal.description,
      href: portal.href,
      icon: portal.icon,
      color: COLOR_CLASS_MAP[portal.colorClass] ?? 'bg-gray-100 text-gray-700',
    }),
  );

  return <PortalOptionList portals={portals} />;
}

/** @deprecated Use PortalSelectorPage */
export function PortalLoginPage() {
  return <PortalSelectorPage />;
}

/** @deprecated Use SplitPortalSelectorPage */
export function AdminPortalSelectorPage() {
  return <PortalSelectorPage />;
}
