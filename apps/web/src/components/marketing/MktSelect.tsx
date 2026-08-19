import { useEffect, useMemo, useRef, useState } from 'react';

export type MktSelectOption = {
  value: string;
  label: string;
};

type MktSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: MktSelectOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  variant?: 'filter' | 'toolbar';
};

function ChevronDownIcon() {
  return (
    <svg
      className="mkt-select-chevron"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MktSelect({
  value,
  onChange,
  options,
  searchable = false,
  searchPlaceholder = 'Search…',
  className,
  variant = 'filter',
}: MktSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    setQuery('');
  }

  const rootClass = ['mkt-select', variant === 'toolbar' ? 'mkt-select--toolbar' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className={rootClass}>
      <button
        type="button"
        className="mkt-select-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="mkt-select-value">{selected?.label ?? 'Select'}</span>
        <ChevronDownIcon />
      </button>

      {open ? (
        <div className="mkt-select-menu">
          {searchable ? (
            <div className="mkt-select-search-wrap">
              <input
                type="search"
                className="mkt-select-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
              />
            </div>
          ) : null}
          <ul className="mkt-select-list" role="listbox">
            {filtered.length === 0 ? (
              <li className="mkt-select-empty">No matches</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    className={`mkt-select-option${option.value === value ? ' is-selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function mktOptionsFromStrings(items: readonly string[]): MktSelectOption[] {
  return items.map((item) => ({ value: item, label: item }));
}
