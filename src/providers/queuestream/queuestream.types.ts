import type { Writable } from 'node:stream';

export type Queuestream = {
  getPrebuffer: () => Buffer;
  currentPipe: (wrstr: Writable, opts?: { end?: boolean }) => Writable;
  next: () => void;
  togglePause: (value?: boolean) => boolean;
};
