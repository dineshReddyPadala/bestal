/* eslint-disable react-refresh/only-export-components */
import type { ReactNode, SVGProps } from 'react';

const ICONS = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M21 21l-4.35-4.35" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 17.5l9 5 9-5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="17" cy="8.8" r="2.6" />
      <path d="M16 14.3c2.7.5 4.5 2.4 4.5 5.2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M15.3 8.7l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  map: (
    <>
      <path d="M9 4l-6 2.3v13.7l6-2.3 6 2.3 6-2.3V3.7L15 6 9 4z" />
      <path d="M9 4v13.7" />
      <path d="M15 6v13.7" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.6-4.6L3 9" />
      <path d="M3 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.6 4.6L21 15" />
      <path d="M21 20v-5h-5" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6.5 4 4 8-9" />
      <path d="M15 5.5h6V11.5" />
    </>
  ),
  code: (
    <>
      <path d="M9 8l-5 4.2L9 16.4" />
      <path d="M15 8l5 4.2-5 4.2" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v6.5c0 1.7 3.6 3 8 3s8-1.3 8-3V5.5" />
      <path d="M4 12v6.5c0 1.7 3.6 3 8 3s8-1.3 8-3V12" />
    </>
  ),
  cloud: <path d="M7 18a4.5 4.5 0 0 1-.6-9 5.5 5.5 0 0 1 10.8-1.4A4 4 0 0 1 17.5 18H7z" />,
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </>
  ),
  shield: <path d="M12 3l7.5 3v5.5c0 5-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.5-7.5-9.5V6L12 3z" />,
  check_circle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.6 2.6L16.3 9" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  branch: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M6 7v10" />
      <path d="M6 12h8a4 4 0 0 0 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.5 2" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l5 5v13H6V3z" />
      <path d="M14 3v5h5" />
      <path d="M9 12.5h6" />
      <path d="M9 16h6" />
    </>
  ),
  commercials: (
    <>
      <rect x="2.5" y="6" width="19" height="12.5" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M6 14.5h4" />
    </>
  ),
  user_check: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16.5 12.5l2 2 3.5-4" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="M8.5 13l-1.7 7 5.2-2.6 5.2 2.6-1.7-7" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
      <rect x="9" y="2.5" width="6" height="4" rx="1" />
      <path d="M8.5 11h7" />
      <path d="M8.5 14.7h7" />
    </>
  ),
  bar_chart: (
    <>
      <path d="M5 20V11" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2.5c3 1.5 5 5 5 9-1 1-3 2-5 2s-4-1-5-2c0-4 2-7.5 5-9z" />
      <circle cx="12" cy="10.5" r="1.6" />
      <path d="M8.5 15l-2.5 5" />
      <path d="M15.5 15l2.5 5" />
    </>
  ),
  package: (
    <>
      <path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4L12 2.5z" />
      <path d="M3.5 7.4L12 12.3l8.5-4.9" />
      <path d="M12 12.3v9.2" />
    </>
  ),
  repeat: (
    <>
      <path d="M18 3.5l3 3-3 3" />
      <path d="M21 6.5H8a5 5 0 0 0-5 5v1" />
      <path d="M6 20.5l-3-3 3-3" />
      <path d="M3 17.5h13a5 5 0 0 0 5-5v-1" />
    </>
  ),
  fingerprint: (
    <>
      <path d="M12 3a6.5 6.5 0 0 1 6.5 6.5c0 3.5-1 6-2.4 8.4" />
      <path d="M12 3a6.5 6.5 0 0 0-6.5 6.5c0 2 .3 3.6.8 5" />
      <path d="M8.7 21a15 15 0 0 0 2.2-6.4" />
      <path d="M15.3 21a17 17 0 0 0 1.6-5.6" />
      <path d="M9 9.5a3 3 0 0 1 6 0c0 3-1 6.5-2.8 9.7" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2.5" y="7" width="19" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M2.5 12.5h19" />
    </>
  ),
  cap: (
    <>
      <path d="M12 4l10 4.5L12 13 2 8.5 12 4z" />
      <path d="M6 10.5v4.7c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-4.7" />
    </>
  ),
  clipboard_check: (
    <>
      <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
      <rect x="9" y="2.5" width="6" height="4" rx="1" />
      <path d="M9 13l2 2 4-4.3" />
    </>
  ),
  check_square: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 12.3l2.6 2.6L16.5 9" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </>
  ),
  eye_off: (
    <>
      <path d="M3 3l18 18" />
      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6 0 9.5 6.5 9.5 6.5a13 13 0 0 1-3 3.6" />
      <path d="M6.2 6.9C4 8.5 2.5 11 2.5 11.5S6 18 12 18c1 0 2-.2 2.9-.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  copyright: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M14.5 9.5a3 3 0 1 0 0 5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15.5" r="4.5" />
      <path d="M11 12.5l9-9" />
      <path d="M16.5 6l2.5 2.5" />
      <path d="M14 8.5L16.5 11" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" />
    </>
  ),
  message: <path d="M3.5 5.5h17v11h-9l-4.5 4v-4h-3.5v-11z" />,
  send: (
    <>
      <path d="M21.5 2.5L11 13" />
      <path d="M21.5 2.5L15 21.5l-4-8.5-8.5-4L21.5 2.5z" />
    </>
  ),
  star: <path d="M12 3l2.7 5.9 6.3.7-4.7 4.4 1.3 6.3-5.6-3.2-5.6 3.2 1.3-6.3-4.7-4.4 6.3-.7L12 3z" />,
  shuffle: (
    <>
      <path d="M3 6.5h3.5L14 17.5h6.5" />
      <path d="M17 4.5l3.5 2-3.5 2" />
      <path d="M3 17.5h3.5L9 14" />
      <path d="M12.5 9l1.5-2h6.5" />
      <path d="M17 12.5l3.5 2-3.5 2" />
    </>
  ),
  heart: (
    <path d="M12 20.3S3.5 15 3.5 9a4.8 4.8 0 0 1 8.5-3 4.8 4.8 0 0 1 8.5 3c0 6-8.5 11.3-8.5 11.3z" />
  ),
  zap: <path d="M12.5 2.5L4 14h6.5L11 21.5 20 10h-6.5L12.5 2.5z" />,
  community: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="6.5" r="2.4" />
      <circle cx="7" cy="18" r="2.8" />
      <circle cx="17" cy="17" r="2.8" />
      <path d="M9.8 9.8l4.7-2M9 10.6l-1 5M9.4 17l5.6-.5M15 8.4l1.5 6.2" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5v-6h4v6" />
    </>
  ),
  discover: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M21 21l-4.35-4.35" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="7.5" r="3" />
      <circle cx="16.5" cy="9" r="2.4" />
      <path d="M3.5 19c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <path d="M14.5 13.8c2.2.5 3.5 2.2 3.5 4.9" />
    </>
  ),
  delivery: (
    <>
      <path d="M3 8.5l9-5 9 5v7l-9 5-9-5v-7z" />
      <path d="M3 8.5l9 5 9-5" />
      <path d="M12 13.5v7" />
    </>
  ),
  request: (
    <>
      <path d="M6 3.5h9l5 5v12H6v-17z" />
      <path d="M15 3.5v5h5" />
      <path d="M9 12h6" />
      <path d="M9 15.5h6" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16l3-4 3 2.5 4-6" />
    </>
  ),
  billing: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 9.5h19" />
      <path d="M6 14h4" />
    </>
  ),
  solution: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6.5 6.5 0 0 0-3.6 11.9c.6.4 1 1.1 1 1.9v.2h5.2v-.2c0-.8.4-1.5 1-1.9A6.5 6.5 0 0 0 12 3z" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="12" height="18" rx="1" />
      <path d="M16 8h4v13h-4" />
      <path d="M7.5 7h1.5M11.5 7h1.5M7.5 11h1.5M11.5 11h1.5M7.5 15h1.5M11.5 15h1.5" />
    </>
  ),
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, strokeWidth = 1.8, ...props }: IconProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {ICONS[name]}
    </svg>
  );
}

export function hasIcon(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(ICONS, name);
}

export function IconGlyph({ name }: { name: string }): ReactNode {
  if (!hasIcon(name)) return null;
  return ICONS[name];
}
