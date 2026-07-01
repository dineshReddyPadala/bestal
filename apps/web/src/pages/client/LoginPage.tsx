import { Button, Input } from '@bestal/ui';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate('/client');
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Work email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            defaultValue="client@bestal.com"
            className="pl-10"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            defaultValue="demo"
            className="pl-10"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
      </div>

      <div className="rounded-lg border border-brand/20 bg-brand-light/50 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Demo account:</span>{' '}
        <code className="rounded bg-background px-1.5 py-0.5 text-brand">client@bestal.com</code>
        {' · '}
        any password
      </div>

      <Button type="submit" className="w-full">
        Sign in to Client Portal
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
