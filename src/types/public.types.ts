import type { Queuestream } from '../providers/queuestream/queuestream.types';
import type { ClientRequest, ServerResponse } from 'http';
import type { TrackList, ReorderCb } from '../providers/playlist/playlist.types';
import type { TEmitter } from '../providers/events/events.types';

export type TStation = {
  /**
   * Start the radio station
   */
  start(): void;
  /**
   * Pause the stream. In order to unpause, run pause again
   * @returns true if stream's new state is on pause
   * false otherwise
   */
  togglePause: Queuestream['togglePause'];
  /**
   * Add the folder to the playlist
   */
  addFolder(folder: string): void;
  /**
   * Immediately switch to the next track
   */
  next(): void;
  /**
   * Lets you reorder your playlist based on the passed function
   * @returns a list of tracks
   */
  reorderPlaylist(cb: ReorderCb): TrackList;
  /**
   * Returns the playlist with its current state
   * @returns a list of tracks
   */
  getPlaylist(): TrackList;
  /**
   * Starts piping the stream to the listener
   */
  connectListener(req: ClientRequest | undefined, res: ServerResponse, cb: () => void): void;
  /**
   * Lets you listen to various track events
   */
  on: TEmitter['on'];
};

export type { ReorderCb, TrackList, TPlaylist } from '../providers/playlist/playlist.types';
export type { ShallowTrackMeta, TTrack, TrackStats } from '../providers/track/track.types';
