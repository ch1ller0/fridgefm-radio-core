import type TypedEmitter from 'typed-emitter';
import type { PUBLIC_EVENTS } from './events.provider';
import type { TrackList } from '../playlist/playlist.types';
import type { TTrack } from '../track/track.types';

type BaseEvent = {
  event: string;
  name?: string;
  message?: string;
  timings?: number;
};

export type InfoEvent = { level?: 'debug' | 'info' | 'warn' } & BaseEvent;

export type ErrorEvent = { error: Error } & BaseEvent;

export type PublicEvents = {
  [PUBLIC_EVENTS.ERROR]: (i: ErrorEvent) => void;
  [PUBLIC_EVENTS.INFO]: (i: InfoEvent) => void;
  [PUBLIC_EVENTS.START]: (list: TrackList, timings: number) => void;
  [PUBLIC_EVENTS.RESTART]: (list: TrackList, timings: number) => void;
  [PUBLIC_EVENTS.NEXT_TRACK]: (tr: TTrack, timings: number) => void;
  [PUBLIC_EVENTS.PAUSE]: (isPaused: boolean) => void;
};

export type TEmitter = TypedEmitter<PublicEvents>;
