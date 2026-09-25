import { AVATAR_COLORS } from '@/constants/content';
import { PROFESSIONALS } from '@/constants/workspace-data';
import type { Professional } from '@/types';

interface AvatarProps {
  professional: Professional;
  size?: number;
}

export function Avatar({ professional, size }: AvatarProps) {
  const index = PROFESSIONALS.indexOf(professional);
  const color = AVATAR_COLORS[index] ?? '#0B1F3A';
  return (
    <div
      className="av"
      style={{
        background: color,
        ...(size
          ? { width: size, height: size, fontSize: size * 0.34 }
          : undefined),
      }}
    >
      {professional.initials}
    </div>
  );
}
