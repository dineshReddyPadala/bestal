const SOCIAL_ICONS = [
  { label: 'LinkedIn', src: '/linkedin.png' },
  { label: 'Facebook', src: '/facebook.png' },
  { label: 'Instagram', src: '/instagram.png' },
] as const;

type SocialMediaIconsProps = {
  className?: string;
};

export function SocialMediaIcons({ className = 'mkt-ft-social' }: SocialMediaIconsProps) {
  return (
    <div className="mkt-ft-social-wrap">
      <p className="mkt-ft-social-label">Follow us on:</p>
      <div className={className} aria-label="Social media">
        {SOCIAL_ICONS.map(({ label, src }) => (
          <img key={label} src={src} alt="" title={label} width={24} height={24} />
        ))}
      </div>
    </div>
  );
}
