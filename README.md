# Radio engine for NodeJS

## Usage
### Server
```javascript
const { Station } = require('@ch1ller/radio-engine');
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