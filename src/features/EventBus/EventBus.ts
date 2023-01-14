import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { defaultConfig } from '../../config/index';
import { PUBLIC_EVENTS } from './events';

import type { TEmitter, InfoEvent, ErrorEvent } from './events';

/**
 * This entity enables event system, its emitting and listenings.
 */
export const createEventBus = ({ config } = { config: defaultConfig }) => {
  const emitter = new EventEmitter() as TEmitter;
  const on: TEmitter['on'] = (eventName, handler) => emitter.on(eventName, handler);
  const emit: TEmitter['emit'] = (eventName, ...args) => emitter.emit(eventName, ...args);

  on(PUBLIC_EVENTS.NEXT_TRACK, (tr, timings) =>
    emit(PUBLIC_EVENTS.INFO, { event: PUBLIC_EVENTS.NEXT_TRACK, message: tr.fsStats.stringified, timings }),
  );
  on(PUBLIC_EVENTS.START, (_, timings) =>
    emit(PUBLIC_EVENTS.INFO, { event: PUBLIC_EVENTS.START, message: 'Station started', timings }),
  );
  on(PUBLIC_EVENTS.RESTART, (_, timings) =>
    emit(PUBLIC_EVENTS.INFO, { event: PUBLIC_EVENTS.RESTART, message: 'Station restarted', timings }),
  );

  if (config.verbose) {
    on(PUBLIC_EVENTS.INFO, ({ level, ...rest }: InfoEvent) => logger.log(level || 'info', { ...rest }));
    on(PUBLIC_EVENTS.ERROR, (event: ErrorEvent) => logger.log('error', { ...event, message: event.error.message }));
  }

  return { on, emit };
};

export type EventBus = ReturnType<typeof createEventBus>;
