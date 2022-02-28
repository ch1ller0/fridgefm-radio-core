import { createToken } from '@fridgefm/inverter';
import type { TEmitter } from '../features/EventBus/events';
import type { PrebufferT } from '../features/Prebuffer';
import type { TStation } from '../types/public.h';
import type { TPlaylist } from '../base/Playlist/Playlist.types';
import type { Queuestream } from '../base/Queuestream';
import type { Config } from '../config/index';

export const STATION_PUBLIC_TOKEN = createToken<TStation>('station_root');
export const QUEUESTREAM_TOKEN = createToken<Queuestream>('queuestream');
export const EVENT_BUS_TOKEN = createToken<Pick<TEmitter, 'emit' | 'on'>>('event_bus');
export const PLAYLIST_TOKEN = createToken<TPlaylist>('playlist');
export const CONFIG_TOKEN = createToken<Config>('config');
export const PREBUFFER_TOKEN = createToken<PrebufferT>('prebuffer');
