const express = require('express');
const path = require('path');
const { Station, SHUFFLE_METHODS, PUBLIC_EVENTS } = require('../lib/index');
const port = 3001;
const server = express();
const musicPath = path.resolve(__dirname, process.argv[2] || './music');

const station = new Station({
  verbose: true // for verbose logging to console
});
// add folder to station
station.addFolder(musicPath);

// update currently playing track info
let currentTrack;
station.on(PUBLIC_EVENTS.NEXT_TRACK, async (track) => {
  const result = await track.getMetaAsync();
  currentTrack = result;
});

station.on(PUBLIC_EVENTS.START, () => {
  // double the playlist on start
  station.reorderPlaylist(a => a.concat(a))
});

station.on(PUBLIC_EVENTS.RESTART, () => {
  station.reorderPlaylist(a => a.concat(a))
});

// add this handler - otherwise any error will exit the process as unhandled
station.on(PUBLIC_EVENTS.ERROR, console.error)

// main stream route
server.get('/stream', (req, res) => {
  station.connectListener(req, res);
});

// get id3 tags of the track
server.get('/info', (req, res) => {
  res.json(currentTrack);
});

// switch to the next track immediately
server.get('/controls/next', (req, res) => {
  station.next();
  res.json('Switched to next track');
});

// shuffle playlist
server.get('/controls/shufflePlaylist', (req, res) => {
  station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle());
  res.json('Playlist shuffled');
});

// rearrange tracks in a playlist
server.get('/controls/rearrangePlaylist', (req, res) => {
  const { newIndex, oldIndex } = req.query;
  station.reorderPlaylist(SHUFFLE_METHODS.rearrange({ from: oldIndex, to: newIndex }))
  res.json(`Succesfully moved element from "${oldIndex}" to "${newIndex}"`);
});

// just get the entire playlist
server.get('/controls/getPlaylist', (req, res) => {
  const plist = station.getPlaylist();
  res.json(plist);
});

// route for serving static
server.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './example.html'));
});

server.listen(port, () => {
  console.log(`RADIO APP IS AVAILABLE ON http://localhost:${port}`);
  station.start();
});
