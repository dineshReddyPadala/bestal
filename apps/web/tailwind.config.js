import uiPreset from '@bestal/ui/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [uiPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Portal tokens (keep for dashboard shells) */
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          hover: 'hsl(var(--brand-hover))',
          light: 'hsl(var(--brand-light))',
        },
        navy: {
          DEFAULT: 'hsl(var(--navy))',
          light: 'hsl(var(--navy-light))',
        },
        /* Home landing palette — use <alpha-value> so bg-ink/95 etc. work */
        ink: 'rgb(10 13 11 / <alpha-value>)',
        forest: 'rgb(14 36 28 / <alpha-value>)',
        moss: 'rgb(20 55 43 / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(28 122 90 / <alpha-value>)',
          bright: 'rgb(47 160 122 / <alpha-value>)',
          foreground: '#ffffff',
        },
        'accent-bright': 'rgb(47 160 122 / <alpha-value>)',
        cream: 'rgb(244 242 234 / <alpha-value>)',
        'cream-deep': 'rgb(235 232 220 / <alpha-value>)',
        line: 'rgb(222 218 203 / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
      maxWidth: {
        shell: '1180px',
      },
    },
  },
};
