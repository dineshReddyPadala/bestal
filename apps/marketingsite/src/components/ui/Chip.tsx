interface ChipProps {
  children: string;
  accent?: boolean | string;
}

export function Chip({ children, accent }: ChipProps) {
  const cls = accent === true ? 'acc' : typeof accent === 'string' ? accent : '';
  return <span className={`chip ${cls}`.trim()}>{children}</span>;
}
