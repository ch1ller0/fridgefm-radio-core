/* eslint-disable no-console */
import path from 'path';
import express from 'express';
import { SHUFFLE_METHODS, PUBLIC_EVENTS, Station } from '../src/index';
import type { ShallowTrackMeta } from '../src/index';

const port = 3001;
const server = express();
const musicPath = path.resolve(process.cwd(), process.argv[2] || './examples/music');

const station = new Station({
  verbose: true, // for verbose logging to console
  responseHeaders: { 'icy-genre': 'jazz' },
});
// add folder to station
station.addFolder(musicPath);

// update currently playing track info
let currentTrack: ShallowTrackMeta;
station.on(PUBLIC_EVENTS.NEXT_TRACK, async (track) => {
  const result = await track.getMetaAsync();
  currentTrack = result;
});

station.on(PUBLIC_EVENTS.START, () => {
  // double the playlist on start
  station.reorderPlaylist((a) => a.concat(a));
});

station.on(PUBLIC_EVENTS.RESTART, () => {
  station.reorderPlaylist((a) => a.concat(a));
});

// add this handler - otherwise any error will exit the process as unhandled
station.on(PUBLIC_EVENTS.ERROR, console.error);

// main stream route
server.get('/stream', (req, res) => {
  // @ts-ignore
  station.connectListener(req, res, () => {});
});

// get id3 tags of the track
server.get('/info', (_, res) => {
  res.json(currentTrack);
});

// switch to the next track immediately
server.get('/controls/next', (_, res) => {
  station.next();
  res.json('Switched to next track');
});

// shuffle playlist
server.get('/controls/shufflePlaylist', (_, res) => {
  station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle());
  res.json('Playlist shuffled');
});

// rearrange tracks in a playlist
server.get('/controls/rearrangePlaylist', (req, res) => {
  const { newIndex, oldIndex } = req.query;
  station.reorderPlaylist(SHUFFLE_METHODS.rearrange({ from: Number(oldIndex), to: Number(newIndex) }));
  res.json(`Succesfully moved element from "${oldIndex}" to "${newIndex}"`);
});

// just get the entire playlist
server.get('/controls/getPlaylist', (_, res) => {
  const plist = station.getPlaylist();
  res.json(plist);
});

// route for serving static
server.get('*', (_, res) => {
  res.sendFile(path.resolve(__dirname, './example.html'));
});

server.listen(port, () => {
  console.log(`RADIO APP IS AVAILABLE ON http://localhost:${port}`);
  station.start();
});
