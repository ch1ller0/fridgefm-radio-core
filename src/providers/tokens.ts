import { createToken } from '@fridgefm/inverter';

import type { Config } from './config';

export const CONFIG_TOKEN = createToken<Config>('config');
