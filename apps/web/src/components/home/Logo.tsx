import { BESTAL_LOGO_SRC } from '../../lib/brand';

type LogoProps = {
  tone?: 'light' | 'dark';
};

export function Logo(_props: LogoProps) {
  return (
    <img src={BESTAL_LOGO_SRC} alt="BesTal" className="h-9 w-auto object-contain object-left" />
  );
}
