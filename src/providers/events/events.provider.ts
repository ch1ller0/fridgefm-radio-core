import { EventEmitter } from 'events';
import { injectable, createToken } from '@fridgefm/inverter';
import { logger } from '../../utils/logger';
import { CONFIG_TOKEN } from '../tokens';

import type { ErrorEvent, InfoEvent, TEmitter } from './events.types';
import type { Config } from '../config';

export const EVENT_BUS_TOKEN = createToken<Pick<TEmitter, 'emit' | 'on'>>('event_bus');

export const PUBLIC_EVENTS = {
  ERROR: 'error',
  INFO: 'einfo',
  START: 'estart',
  RESTART: 'erestart',
  NEXT_TRACK: 'enexttrack',
} as const;

export const eventBusFactory = (config: Config) => {
  const emitter = new EventEmitter() as TEmitter;
  const publicEventBus: Pick<TEmitter, 'on' | 'emit'> = {
    on: (eventName, handler) => emitter.on(eventName, handler),
    emit: (eventName, ...args) => emitter.emit(eventName, ...args),
  };

  if (config.verbose) {
    publicEventBus.on(PUBLIC_EVENTS.INFO, ({ level, ...rest }: InfoEvent) => logger.log(level || 'info', { ...rest }));

    publicEventBus.on(PUBLIC_EVENTS.ERROR, (event: ErrorEvent) =>
      logger.log('error', { ...event, message: event.error.message }),
    );
  }

  publicEventBus.on(PUBLIC_EVENTS.NEXT_TRACK, (tr, timings) =>
    publicEventBus.emit(PUBLIC_EVENTS.INFO, {
      event: PUBLIC_EVENTS.NEXT_TRACK,
      message: tr.fsStats.stringified,
      timings,
    }),
  );

  publicEventBus.on(PUBLIC_EVENTS.START, (_, timings) =>
    publicEventBus.emit(PUBLIC_EVENTS.INFO, {
      event: PUBLIC_EVENTS.START,
      message: 'Station started',
      timings,
    }),
  );

  publicEventBus.on(PUBLIC_EVENTS.RESTART, (_, timings) =>
    publicEventBus.emit(PUBLIC_EVENTS.INFO, {
      event: PUBLIC_EVENTS.RESTART,
      message: 'Station restarted',
      timings,
    }),
  );

  return publicEventBus;
};

export const eventBusProvider = injectable({
  provide: EVENT_BUS_TOKEN,
  useFactory: eventBusFactory,
  inject: [CONFIG_TOKEN] as const,
});
