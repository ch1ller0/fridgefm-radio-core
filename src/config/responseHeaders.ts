export const responseHeaders = (cfg?: Record<string, string>) => ({
  ...(cfg || {
    'icy-br': '56',
    'icy-genre': 'house',
    'icy-metaint': '0',
    'icy-pub': '0',
    'icy-url': 'https://',
  }),
  'icy-name': '@fridgefm/radio-engine',
  'icy-notice1': 'Live radio powered by https://www.npmjs.com/package/@fridgefm/radio-engine',
  'Cache-Control': 'no-cache,no-store,must-revalidate,max-age=0',
  'Content-Type': 'audio/mpeg',
}) as Record<string, string>;
