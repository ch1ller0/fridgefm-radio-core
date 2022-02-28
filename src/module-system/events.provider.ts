import { EventEmitter } from 'events';
import { injectable } from '@fridgefm/inverter';
import { logger } from '../utils/logger';
import { PUBLIC_EVENTS } from '../features/EventBus/events';
import { CONFIG_TOKEN, EVENT_BUS_TOKEN } from './tokens';
import type { TEmitter, InfoEvent, ErrorEvent } from '../features/EventBus/events';

export const eventBusProvider = injectable({
  provide: EVENT_BUS_TOKEN,
  useFactory: (config) => {
    const emitter = new EventEmitter() as TEmitter;
    const publicEventBus: Pick<TEmitter, 'on' | 'emit'> = {
      on: (eventName, handler) => emitter.on(eventName, handler),
      emit: (eventName, ...args) => emitter.emit(eventName, ...args),
    };

    if (config.verbose) {
      publicEventBus.on(PUBLIC_EVENTS.INFO, ({ level, ...rest }: InfoEvent) =>
        logger.log(level || 'info', { ...rest }),
      );

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
  },
  inject: [CONFIG_TOKEN] as const,
});

/**
 * root: [config, queuestream, eventBus, playlist]
 * config: nothing
 * queuestream: [eventBus, playlist, prebuffer]
 * eventBus: [config]
 * playlist: [eventBus]
 * prebuffer: [config]
 */
