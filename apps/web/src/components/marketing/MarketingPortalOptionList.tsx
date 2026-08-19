import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ForwardArrow } from '../ui/ForwardArrow';

export type MarketingPortalOption = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  colorClass: string;
};

type MarketingPortalOptionListProps = {
  portals: MarketingPortalOption[];
};

export function MarketingPortalOptionList({ portals }: MarketingPortalOptionListProps) {
  return (
    <div className="mkt-portal-select">
      <p className="mkt-portal-select-hint">Select the portal that matches your role</p>
      <ul className="mkt-portal-select-list">
        {portals.map(({ id, name, description, href, icon: Icon, colorClass }) => (
          <li key={id}>
            <Link to={href} className="mkt-portal-select-item">
              <span className={`mkt-portal-select-icon ${colorClass}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mkt-portal-select-body">
                <span className="mkt-portal-select-name">{name}</span>
                <span className="mkt-portal-select-desc">{description}</span>
              </span>
              <ForwardArrow className="mkt-portal-select-arrow h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
