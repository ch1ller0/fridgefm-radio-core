import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import express from 'express';
import type { ShallowTrackMeta } from '../src/index';
import { PUBLIC_EVENTS, SHUFFLE_METHODS, Station } from '../src/index';

const { NEXT_TRACK, ERROR } = PUBLIC_EVENTS;

const port = 3001;
const server = express();
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

// main stream route
server.get('/stream', (_, res) => {
  res.writeHead(200, { 'icy-genre': 'jazz' });
  const stream = station.getReadableStream();

  // @ts-expect-error this is ok
  pipeline(Readable.fromWeb(stream), res, (err) => {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      console.error(err);
    }
  });
});

server.get('/state', (_, res) => {
  const playlist = station.getPlaylist();
  res.json({ currentTrack: stationState.currentTrack, playlist, paused: stationState.paused });
});

// switch to the next track immediately
server.post('/controls/next', (_, res) => {
  station.next();
  res.json('Switched to next track');
});

server.post('/controls/pause', (_, res) => {
  const paused = station.togglePause();
  stationState.paused = paused;
  res.json(`Paused: ${paused}`);
});

// shuffle playlist
server.post('/controls/shufflePlaylist', (_, res) => {
  station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle());
  res.json('Playlist shuffled');
});

// rearrange tracks in a playlist
server.post('/controls/rearrangePlaylist', (req, res) => {
  const { newIndex, oldIndex } = req.query;
  station.reorderPlaylist(SHUFFLE_METHODS.rearrange({ from: Number(oldIndex), to: Number(newIndex) }));
  res.json(`Succesfully moved element from "${oldIndex}" to "${newIndex}"`);
});

// route for serving static
server.get('*', (_, res) => {
  res.sendFile(path.resolve(__dirname, './example.html'));
});

server.listen(port, () => {
  // biome-ignore lint/suspicious/noConsole: We need logging here
  console.log(`Example server started, open http://localhost:${port}/ in the browser`);
  station.start();
});
