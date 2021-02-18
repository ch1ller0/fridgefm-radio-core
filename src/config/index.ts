import { responseHeaders } from './responseHeaders';

export const defaultConfig = {
  /**
   * Pass your custom response headers from the station endpoint
   */
  responseHeaders: responseHeaders(),
  /**
   * If set to true enables verbose info logging
   */
  verbose: false,
};

export const mergeConfig = (cfg: Partial<Config>) => ({
  ...cfg,
  responseHeaders: responseHeaders(cfg.responseHeaders),
}) as Config;

export type Config = typeof defaultConfig;
