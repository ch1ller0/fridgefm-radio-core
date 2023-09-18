export type Config = {
  responseHeaders: Record<string, string>;
  verbose: boolean;
  prebufferLength: number;
};

const responseHeaders = (cfg?: Record<string, string>) => ({
  ...(cfg || {
    'icy-br': '56',
    'icy-genre': 'house',
    'icy-metaint': '0',
    'icy-pub': '0',
    'icy-url': 'https://',
  }),
  'icy-name': '@fridgefm/radio-core',
  'icy-notice1': 'Live radio powered by https://www.npmjs.com/package/@fridgefm/radio-core',
  'Cache-Control': 'no-cache,no-store,must-revalidate,max-age=0',
  'Content-Type': 'audio/mpeg',
});

export const createConfig = (cfg: Partial<Config>): Config => ({
  verbose: false,
  prebufferLength: 12,
  ...cfg,
  responseHeaders: responseHeaders(cfg.responseHeaders),
});

export const DEFAULTS = {
  PREBUFFER_LENGTH: 12,
};
