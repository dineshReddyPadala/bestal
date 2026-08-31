const SOCIAL_ICONS = [
  {
    label: 'LinkedIn',
    src: '/linkedin.png',
    href: 'https://www.linkedin.com/company/bestal/home/',
  },
  {
    label: 'Facebook',
    src: '/facebook.png',
    href: 'https://www.facebook.com/profile.php?id=61593952793948',
  },
  {
    label: 'Instagram',
    src: '/instagram.png',
    href: 'https://www.instagram.com/bestal.co/',
  },
] as const;

type SocialMediaIconsProps = {
  className?: string;
};

export function SocialMediaIcons({ className = 'mkt-ft-social' }: SocialMediaIconsProps) {
  return (
    <div className="mkt-ft-social-wrap">
      <p className="mkt-ft-social-label">Follow us on:</p>
      <div className={className} aria-label="Social media">
        {SOCIAL_ICONS.map(({ label, src, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mkt-ft-social-btn"
            aria-label={label}
            title={label}
          >
            <img src={src} alt="" width={24} height={24} />
          </a>
        ))}
      </div>
    </div>
  );
}
