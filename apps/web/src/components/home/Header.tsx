import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { navDraft } from '../../data/homeCopy';
import { Logo } from './Logo';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="section-shell flex h-16 items-center justify-between gap-4">
        <a href="#top" className="shrink-0" aria-label="BesTal home">
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-5">
            {navDraft.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="whitespace-nowrap text-[13px] font-medium text-white/70 transition-colors duration-150 ease-out hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            to="/login"
            className="rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-white/85 transition-colors duration-150 ease-out hover:border-white/45 hover:text-white"
          >
            {navDraft.signIn}
          </Link>
          <a
            href="#final-cta"
            className="rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-bright"
          >
            {navDraft.postAJob}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-full border border-white/20 p-2 text-white xl:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink xl:hidden">
          <div className="section-shell flex flex-col gap-1 py-4">
            {navDraft.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-white/75"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-full border border-white/20 py-2 text-center text-[13px] font-medium text-white"
              >
                {navDraft.signIn}
              </Link>
              <a
                href="#final-cta"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-accent py-2 text-center text-[13px] font-semibold text-white"
              >
                {navDraft.postAJob}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
