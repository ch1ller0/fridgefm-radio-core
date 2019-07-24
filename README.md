# Radio engine for NodeJS

![GitHub](https://img.shields.io/github/license/kefir100/radio-ch1ller.svg)
![node](https://img.shields.io/node/v/@kefir100/radio-engine.svg)
![CircleCI](https://img.shields.io/circleci/build/github/Kefir100/radio-ch1ller.svg)
![npm](https://img.shields.io/npm/dw/@kefir100/radio-engine.svg)

## Usage

### Installation
```
npm i @kefir100/radio-engine --save
```
### Server
```javascript
const { Station } = require('@kefir100/radio-engine');
const station = new Station({
  error: (...args) => {} // override default handlers
});

station.addTrack({ path: '/Music/', name: 'track1.mp3' });
station.addTrack({ path: '/Music/', name: 'track2.mp3' });
station.addTrack({ path: '/Music/', name: 'track3.mp3' });

server.get('/stream', (req, res) => {
  station.connectListener(req, res);
});

station.start({
  shuffle: true,
});
```
### Client
```html
<audio
    controls
    type='audio/mp3'
    src='/stream'
/>
```

or just go to [EXAMPLES](./examples/server.js)
```
node examples/server.js
```
OR
```
node examples/server.js [path/to/your_mp3tracks]
```

# NOTICE
Version `1.3.0` lacks backward compatibility. You just have to use addTrack method using `name` field (see the example below) as opposed to `file` (like in previous versions).

## Demo
Fully working demo is available on http://ch1ller.com
