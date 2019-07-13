const express = require("express");
const path = require("path");
const fs = require("fs");
const { Station } = require("../lib/index");

const station = new Station();
const port = 3001;
const server = express();
const musicPath = path.resolve(__dirname, process.argv[2] || "./music");

// add tracks to station
fs.readdirSync(musicPath)
  .forEach((name) => {
    station.addTrack({
      path: musicPath,
      name,
    });
  });

// update currently playing track info
let currentTrack;
station.on("nextTrack", (track) => {
  currentTrack = track.getMeta();
});

// start station
station.start({
  shuffle: true,
});

// stream route
server.get("/stream", (req, res) => {
  station.connectListener(req, res);
});

// route for getting id3 tags of the track
server.get("/info", (req, res) => {
  res.json(currentTrack);
});

// route for serving static
server.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./example.html"));
});

server.listen(port, () => {
  console.log(`RADIO APP IS AVAILABLE ON http://localhost:${port}`);
});
