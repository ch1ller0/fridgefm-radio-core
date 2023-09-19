import type { Writable } from 'stream';

export type Queuestream = {
  getPrebuffer: () => Buffer;
  currentPipe: (wrstr: Writable, opts?: { end?: boolean }) => Writable;
  next: () => void;
};
