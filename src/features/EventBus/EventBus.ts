import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { defaultConfig } from '../../config/index';
import { PUBLIC_EVENTS } from './events';

import type { TEmitter, InfoEvent, ErrorEvent } from './events';

export class EventBus {
  private _emitter = new EventEmitter() as TEmitter;

  constructor({ config } = { config: defaultConfig }) {
    this._infoEmitOn();
    if (config.verbose) this._cliLoggerOn();
  }

  private _cliLoggerOn() {
    this.on(PUBLIC_EVENTS.INFO, ({ level, ...rest }: InfoEvent) => logger.log(level || 'info', { ...rest }));

    this.on(PUBLIC_EVENTS.ERROR, (event: ErrorEvent) =>
      logger.log('error', { ...event, message: event.error.message }),
    );
  }

  private _infoEmitOn() {
    this.on(PUBLIC_EVENTS.NEXT_TRACK, (tr, timings) =>
      this.emit(PUBLIC_EVENTS.INFO, {
        event: PUBLIC_EVENTS.NEXT_TRACK,
        message: tr.fsStats.stringified,
        timings,
      }),
    );

    this.on(PUBLIC_EVENTS.START, (_, timings) =>
      this.emit(PUBLIC_EVENTS.INFO, {
        event: PUBLIC_EVENTS.START,
        message: 'Station started',
        timings,
      }),
    );

    this.on(PUBLIC_EVENTS.RESTART, (_, timings) =>
      this.emit(PUBLIC_EVENTS.INFO, {
        event: PUBLIC_EVENTS.RESTART,
        message: 'Station restarted',
        timings,
      }),
    );
  }

  on: TEmitter['on'] = (eventName, handler) => this._emitter.on(eventName, handler);

  emit: TEmitter['emit'] = (eventName, ...args) => this._emitter.emit(eventName, ...args);
}
