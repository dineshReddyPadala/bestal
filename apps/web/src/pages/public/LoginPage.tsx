import { ArrowUpRight, Briefcase, Building2, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const portals = [
  {
    id: 'admin',
    name: 'Admin Portal',
    href: '/admin/login',
    icon: Building2,
    color: 'bg-violet-100 text-violet-700',
  },
  {
    id: 'sales',
    name: 'Sales Portal',
    href: '/sales/login',
    icon: TrendingUp,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'recruiter',
    name: 'Recruiter Portal',
    href: '/recruiter/login',
    icon: Users,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'client',
    name: 'Client Portal',
    href: '/client/login',
    icon: Briefcase,
    color: 'bg-emerald-100 text-emerald-700',
  },
];

export function PortalLoginPage() {
  return (
    <div className="space-y-4">
      {portals.map(({ id, name, href, icon: Icon, color }) => (
        <Link
          key={id}
          to={href}
          className="group flex items-center gap-4 rounded-xl border border-border p-4 transition-all hover:border-brand/40 hover:bg-muted/50 hover:shadow-card"
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{name}</p>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
        </Link>
      ))}
    </div>
  );
}
