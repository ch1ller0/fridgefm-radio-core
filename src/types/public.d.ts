import type { ClientRequest, ServerResponse } from 'http';
import type { TrackList, ReorderCb } from '../base/Playlist/Playlist.types';
import type { TEmitter } from '../features/EventBus/events';

export type TStation = {
  /**
   * Start the radio station
   */
  start(): void;
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
   */
  reorderPlaylist(cb: ReorderCb): TrackList;
  /**
   * Returns the playlist with its current state
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
