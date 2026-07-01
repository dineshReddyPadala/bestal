import { Button, Input } from '@bestal/ui';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@bestal.com');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/admin');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@bestal.com"
          autoComplete="email"
        />
        <p className="text-xs text-muted-foreground">
          Demo account: <span className="font-medium">admin@bestal.com</span>
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" className="rounded border-input" defaultChecked />
          Remember me
        </label>
        <a href="#" className="font-medium text-brand hover:underline">
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full">
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Not an admin?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Contact your administrator
        </Link>
      </p>
    </form>
  );
}
