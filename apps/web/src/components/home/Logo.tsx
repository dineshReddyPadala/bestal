type LogoProps = {
  tone?: 'light' | 'dark';
};

export function Logo({ tone = 'dark' }: LogoProps) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-white" />
      </span>
      <span
        className={`font-display text-[19px] font-semibold tracking-tight ${
          tone === 'dark' ? 'text-white' : 'text-ink'
        }`}
      >
        BesTal
      </span>
    </span>
  );
}
