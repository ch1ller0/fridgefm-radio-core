/* eslint-disable no-console */
import path from 'path';
import express from 'express';
import { SHUFFLE_METHODS, PUBLIC_EVENTS, Station, DEFAULTS } from '../src/index';
import type { ShallowTrackMeta } from '../src/index';

const { NEXT_TRACK, ERROR } = PUBLIC_EVENTS;

const port = 3001;
const server = express();
const musicPath = path.resolve(process.cwd(), process.argv[2] || './examples/music');
const prebufferLength = DEFAULTS.PREBUFFER_LENGTH;

const station = new Station({
  verbose: true, // for verbose logging to console
  responseHeaders: { 'icy-genre': 'jazz' },
  prebufferLength,
});
// add folder to station
station.addFolder(musicPath);

// update currently playing track info
let currentTrack: ShallowTrackMeta;
station.on(NEXT_TRACK, async (track) => {
  const result = await track.getMetaAsync();
  if (!currentTrack) {
    currentTrack = result;
  } else {
    // in order to compensate a lag between the server and client
    setTimeout(() => {
      currentTrack = result;
    }, prebufferLength * 1000);
  }
});

// add this handler - otherwise any error will exit the process as unhandled
station.on(ERROR, console.error);

// main stream route
server.get('/stream', (req, res) => {
  // @ts-ignore
  station.connectListener(req, res, () => {});
});

// get id3 tags of the track
server.get('/getCurrentTrackInfo', (_, res) => {
  res.json(currentTrack);
});

// just get the entire playlist
server.get('/getPlaylist', (_, res) => {
  const plist = station.getPlaylist();
  res.json(plist);
});

// switch to the next track immediately
server.post('/controls/next', (_, res) => {
  station.next();
  res.json('Switched to next track');
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
  console.log(`RADIO APP IS AVAILABLE ON http://localhost:${port}`);
  station.start();
});
