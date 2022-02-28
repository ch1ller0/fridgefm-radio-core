import { declareContainer, injectable } from '@fridgefm/inverter';
import { defaultConfig } from '../config/index';
import { BaseModule } from './base.module';
import { STATION_PUBLIC_TOKEN, CONFIG_TOKEN } from './tokens';
import { playlistProvider } from './playlist.provider';
import { prebufferProvider, queuestreamProvider } from './queuestream.provider';
import { eventBusProvider } from './events.provider';

export const createStation = () =>
  declareContainer({
    modules: [BaseModule],
    providers: [
      injectable({
        provide: CONFIG_TOKEN,
        useValue: defaultConfig,
      }),
      eventBusProvider,
      playlistProvider,
      prebufferProvider,
      queuestreamProvider,
    ],
  }).get(STATION_PUBLIC_TOKEN);
