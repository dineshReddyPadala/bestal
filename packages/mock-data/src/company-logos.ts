/** Reliable demo company logos (Clearbit Logo API is discontinued). */

const BRAND_COLORS: Record<string, string> = {
  Stripe: '635bff',
  Shopify: '96bf48',
  'JPMorgan Chase': '0066b2',
  Spotify: '1db954',
  Airbnb: 'ff5a5f',
  Palantir: '101820',
  Coinbase: '0052ff',
  Microsoft: '0078d4',
  Google: '4285f4',
  Amazon: 'ff9900',
  Meta: '0866ff',
  Netflix: 'e50914',
  Salesforce: '00a1e0',
  Adobe: 'ff0000',
  IBM: '054ada',
  Oracle: 'f80000',
  SAP: '0faaFF',
  Deloitte: '86bc25',
  McKinsey: '051c2c',
};

export function companyLogoUrl(name: string): string {
  const bg = BRAND_COLORS[name] ?? '1e3a5f';
  const params = new URLSearchParams({
    name: name.slice(0, 2).toUpperCase(),
    background: bg,
    color: 'ffffff',
    size: '128',
    bold: 'true',
    format: 'svg',
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}
