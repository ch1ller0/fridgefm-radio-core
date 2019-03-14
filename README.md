# Radio engine for NodeJS

## Usage

### Installation
```
npm i @kefir100/radio-engine --save
```
### Server
```javascript
const { Station } = require('@kefir100/radio-engine');
const station = new Station();

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

## Demo
Fully working demo is available on ch1ller.com
