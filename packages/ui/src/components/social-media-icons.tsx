import { Facebook, Instagram, Linkedin } from 'lucide-react';

const SOCIAL_ICONS = [
  { label: 'Facebook', Icon: Facebook },
  { label: 'Instagram', Icon: Instagram },
  { label: 'LinkedIn', Icon: Linkedin },
] as const;

type SocialMediaIconsProps = {
  className?: string;
};

export function SocialMediaIcons({ className = 'mkt-ft-social' }: SocialMediaIconsProps) {
  return (
    <div className={className} aria-label="Social media">
      {SOCIAL_ICONS.map(({ label, Icon }) => (
        <span key={label} className="mkt-ft-social-icon" title={label} aria-hidden="true">
          <Icon strokeWidth={1.75} />
        </span>
      ))}
    </div>
  );
}
