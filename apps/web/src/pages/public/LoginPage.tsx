import { Briefcase, Building2, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { useAuth } from '../../contexts/AuthContext';

type PortalOption = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: typeof Building2;
  color: string;
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

/** Top level: Admin vs Engineers */
export function PortalSelectorPage() {
  const portals: PortalOption[] = [
    {
      id: 'admin',
      name: 'Dashboard Overview',
      description: 'Daily platform operations: candidates, evaluations, BGV, clients, and trials.',
      href: '/login/portals/admin',
      icon: Building2,
      color: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'engineers',
      name: 'Login',
      description: 'Browse vetted engineers, review test results, and request trials.',
      href: '/login/engineers',
      icon: Briefcase,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return <PortalOptionList portals={portals} />;
}

/** Admin team: Admin, Sales, Recruiter, Client */
export function AdminPortalSelectorPage() {
  const { user } = useAuth();

  const adminHref =
    user && (user.portal === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin' : '/admin/login';

  const clientHref = user && user.portal === 'CLIENT' ? '/client' : '/client/login';
  // const portals = [
  //   {
  //     id: 'admin',
  //     name: 'Admin Portal',
  //     description: 'Daily platform operations: candidates, evaluations, BGV, clients, and trials.',
  //     href: '/admin/login',
  //     icon: Building2,
  //     color: 'bg-violet-100 text-violet-700',
  //   },
  //   {
  //     id: 'sales',
  //     name: 'Sales Portal',
  //     description: 'Client accounts, trial requests, deployments, and margin tracking.',
  //     href: '/sales/login',
  //     icon: TrendingUp,
  //     color: 'bg-amber-100 text-amber-700',
  //   },
  //   {
  //     id: 'recruiter',
  //     name: 'Recruiter Portal',
  //     description: 'Candidate pipeline, evaluations, and BGV.',
  //     href: '/recruiter/login',
  //     icon: Users,
  //     color: 'bg-brand-light text-brand',
  //   },
  //   {
  //     id: 'client',
  //     name: 'Client Portal',
  //     description: 'Browse candidates, request trials, and manage deployments.',
  //     href: '/client/login',
  //     icon: Briefcase,
  //     color: 'bg-emerald-100 text-emerald-700',
  //   },
  // ];
  const portals: PortalOption[] = [
    {
      id: 'admin',
      name: 'Admin Portal',
      description: 'Daily platform operations: candidates, evaluations, BGV, clients, and trials.',
      href: adminHref,
      icon: Building2,
      color: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'sales',
      name: 'Sales Portal',
      description: 'Client accounts, trial requests, deployments, and margin tracking.',
      href: '/sales/login',
      icon: TrendingUp,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'recruiter',
      name: 'Recruiter Portal',
      description: 'Candidate pipeline, evaluations, and BGV.',
      href: '/recruiter/login',
      icon: Users,
      color: 'bg-brand-light text-brand',
    },
    {
      id: 'client',
      name: 'Client Portal',
      description: 'Browse vetted engineers, review test results, and request trials.',
      href: clientHref,
      icon: Briefcase,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return <PortalOptionList portals={portals} />;
}

/** @deprecated Use PortalSelectorPage — kept for router import compatibility */
export function PortalLoginPage() {
  // return (
  //   <div className="space-y-3">
  //     <p className="text-center text-sm text-muted-foreground">
  //       Select the portal that matches your role
  //     </p>
  //     {portals.map(({ id, name, description, href, icon: Icon, color }) => (
  //       <Link
  //         key={id}
  //         to={href}
  //         className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-all hover:border-brand/40 hover:bg-muted/50 hover:shadow-card sm:gap-4 sm:p-4"
  //       >
  //         <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${color}`}>
  //           <Icon className="h-5 w-5" />
  //         </div>
  //         <div className="min-w-0 flex-1">
  //           <p className="font-semibold text-foreground">{name}</p>
  //           <p className="text-sm text-muted-foreground">{description}</p>
  //         </div>
  //         <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
  //       </Link>
  //     ))}
  //   </div>
  // );
  return <PortalSelectorPage />;
}
