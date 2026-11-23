import { readFile } from 'node:fs/promises';
import { createServer, type ServerResponse } from 'node:http';
import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import type { ShallowTrackMeta } from '../src/index';
import { PUBLIC_EVENTS, SHUFFLE_METHODS, Station } from '../src/index';

const { NEXT_TRACK, ERROR } = PUBLIC_EVENTS;

const port = 3001;
const musicPath = path.resolve(process.cwd(), process.argv[2] || './examples/music');
const prebufferLength = 8;

const createStation = () => {
  const station = new Station({
    verbose: true, // for verbose logging to console
    responseHeaders: { 'icy-genre': 'jazz' },
    prebufferLength,
  });
  // add folder to station
  station.addFolder(musicPath);

  // Shuffle immediately
  station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle());

  // update currently playing track info
  const stationState: {
    currentTrack: ShallowTrackMeta | undefined;
    paused: boolean;
  } = {
    currentTrack: undefined,
    paused: false,
  };
  station.on(NEXT_TRACK, async (track) => {
    const result = await track.getMetaAsync();
    if (!stationState.currentTrack) {
      stationState.currentTrack = result;
    } else {
      // in order to compensate a lag between the server and client
      setTimeout(() => {
        stationState.currentTrack = result;
      }, prebufferLength * 1000);
    }
  });

  // add this handler - otherwise any error will exit the process as unhandled
  // biome-ignore lint/suspicious/noConsole: We need logging here
  station.on(ERROR, console.error);

  return { station, stationState };
};

const { station, stationState } = createStation();

const sendJson = (res: ServerResponse, data: unknown) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(data));
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  const { pathname, searchParams } = url;

  // main stream route
  if (req.method === 'GET' && pathname === '/stream') {
    res.writeHead(200, { 'icy-genre': 'jazz' });
    const stream = station.getReadableStream();

    // @ts-expect-error this is ok
    pipeline(Readable.fromWeb(stream), res, (err) => {
      if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
        // biome-ignore lint/suspicious/noConsole: We need logging here
        console.error(err);
      }
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/state') {
    const playlist = station.getPlaylist();
    sendJson(res, { currentTrack: stationState.currentTrack, playlist, paused: stationState.paused });
    return;
  }

  // switch to the next track immediately
  if (req.method === 'POST' && pathname === '/controls/next') {
    station.next();
    sendJson(res, 'Switched to next track');
    return;
  }

  if (req.method === 'POST' && pathname === '/controls/pause') {
    const paused = station.togglePause();
    stationState.paused = paused;
    sendJson(res, `Paused: ${paused}`);
    return;
  }

  // shuffle playlist
  if (req.method === 'POST' && pathname === '/controls/shufflePlaylist') {
    station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle());
    sendJson(res, 'Playlist shuffled');
    return;
  }

  // rearrange tracks in a playlist
  if (req.method === 'POST' && pathname === '/controls/rearrangePlaylist') {
    const oldIndex = searchParams.get('oldIndex');
    const newIndex = searchParams.get('newIndex');
    station.reorderPlaylist(SHUFFLE_METHODS.rearrange({ from: Number(oldIndex), to: Number(newIndex) }));
    sendJson(res, `Succesfully moved element from "${oldIndex}" to "${newIndex}"`);
    return;
  }

  // route for serving static
  if (req.method === 'GET') {
    try {
      const html = await readFile(path.resolve(__dirname, './example.html'));
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(html);
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: We need logging here
      console.error(err);
      res.writeHead(500);
      res.end();
    }
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(port, () => {
  // biome-ignore lint/suspicious/noConsole: We need logging here
  console.log(`Example server started, open http://localhost:${port}/ in the browser`);
  station.start();
});
