const express = require('express');
const path = require('path');
const { Station } = require('../lib/index');
const port = 3001;
const server = express();
const musicPath = path.resolve(__dirname, process.argv[2] || './music');

const station = new Station();
// add folder to station
station.addFolder(musicPath);

// update currently playing track info
let currentTrack;
station.on('nextTrack', async (track, stats) => {
  console.log(`nextTrack handler took ${stats.time}ms`)
  const result = await track.getMetaAsync();
  currentTrack = result;
});

station.on('start', () => {
  station.shufflePlaylist();
});

station.on('restart', (_, stats) => {
  console.log(`restart handler took ${stats.time}ms`)
  station.shufflePlaylist();
});

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
  station.shufflePlaylist();
  res.json('Playlist shuffled');
});

// just get the entire playlist
server.get('/controls/getPlaylist', (req, res) => {
  const plist = station.getPlaylist();
  res.json(plist);
});

// rearrange tracks in a playlist
server.get('/controls/rearrangePlaylist', (req, res) => {
  const { newIndex, oldIndex } = req.query;
  const { from, to } = station.rearrangePlaylist(oldIndex, newIndex);
  res.json(`Succesfully moved element from "${from}" to "${to}"`);
});

// route for serving static
server.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './example.html'));
});

server.listen(port, () => {
  console.log(`RADIO APP IS AVAILABLE ON http://localhost:${port}`);
  station.start();
});
