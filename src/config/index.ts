import { responseHeaders } from './responseHeaders';

export const defaultConfig = {
  responseHeaders: responseHeaders(),
  verbose: false,
};

export const mergeConfig = (cfg: Partial<Config>) => ({
  ...cfg,
  responseHeaders: responseHeaders(cfg.responseHeaders),
}) as Config;

export type Config = typeof defaultConfig;
