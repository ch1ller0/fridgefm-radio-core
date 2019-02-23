const express = require('express');
const { Station } = require('../index');
const station = new Station();
const port = 3000;
const server = express();
const path = require('path').resolve(__dirname, '../src/sound/__tests__/mp3_test/');

const tracks = [
  {
    path,
    file: 'Artist1 - Track1.mp3',
  },
  {
    path,
    file: 'Artist1 - Track2.mp3',
  },
];

station.addTrack(tracks[0]);
station.addTrack(tracks[1]);

server.get('/stream', (req, res) => {
  station.connectListener(req, res);
});

server.get('*', (req, res) => {
  res.send(`<!DOCTYPE html><html><body>
  <audio controls src='stream' type='audio/mp3'/>
  </body></html`);
});

station.start({
  shuffle: true,
});

server.listen(port, () => {
  console.log(`RADIO APP IS AVAILABLE ON http://localhost:${port}`);
});
