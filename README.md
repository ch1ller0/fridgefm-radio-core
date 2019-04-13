# Radio engine for NodeJS

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

station.addTrack({ path: '/Music/', file: 'track1.mp3' });
station.addTrack({ path: '/Music/', file: 'track2.mp3' });
station.addTrack({ path: '/Music/', file: 'track3.mp3' });

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

## Demo
Fully working demo is available on http://ch1ller.com
