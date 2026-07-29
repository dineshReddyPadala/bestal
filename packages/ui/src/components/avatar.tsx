import { cn, initials } from '@bestal/shared-utils';
import { useEffect, useState, type HTMLAttributes } from 'react';

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

export function Avatar({ name, src, size = 'md', className, ...props }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = src?.trim();
  const showImage = Boolean(imageSrc) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-brand font-medium text-white',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
