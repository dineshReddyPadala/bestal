type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = 'light',
  align = 'left',
  className = '',
}: SectionHeadingProps) {
  const isDark = tone === 'dark';

  return (
    <div
      className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}
    >
      {eyebrow && (
        <p className="mb-3 text-[13px] font-medium text-accent-bright">{eyebrow}</p>
      )}
      <h2
        className={`font-display text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] sm:text-[38px] ${
          isDark ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-4 text-[15px] leading-relaxed ${isDark ? 'text-white/65' : 'text-ink/65'}`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
