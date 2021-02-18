import type TypedEmitter from 'typed-emitter';
import type { TrackList } from '../../base/Playlist/Playlist.types';
import type { TTrack } from '../../base/Track/Track.types';

export const PUBLIC_EVENTS = {
  ERROR: 'error',
  INFO: 'einfo',
  START: 'estart',
  RESTART: 'erestart',
  NEXT_TRACK: 'enexttrack',
} as const;

type BaseEvent = {
  event: string
  name?: string
  message?: string
  timings?: number
};

export type InfoEvent = { level?: 'debug' | 'info' | 'warn' } & BaseEvent;

export type ErrorEvent = { error: Error } & BaseEvent;

export interface PublicEvents {
  [PUBLIC_EVENTS.ERROR]: (i: ErrorEvent) => void,
  [PUBLIC_EVENTS.INFO]: (i: InfoEvent) => void,
  [PUBLIC_EVENTS.START]: (list: TrackList, timings: number) => void,
  [PUBLIC_EVENTS.RESTART]: (list: TrackList, timings: number) => void,
  [PUBLIC_EVENTS.NEXT_TRACK]: (tr: TTrack, timings: number) => void,
}

export type TEmitter = TypedEmitter<PublicEvents>;
