# Radio engine for NodeJS
[![build](https://img.shields.io/circleci/build/github/ch1ller0/fridgefm-radio-core.svg)](https://circleci.com/gh/ch1ller0/fridgefm-radio-core)
[![coverage](https://img.shields.io/codecov/c/gh/ch1ller0/fridgefm-radio-core.svg)](https://codecov.io/gh/ch1ller0/fridgefm-radio-core)
[![npm](https://img.shields.io/npm/dw/@fridgefm/radio-core.svg)](https://www.npmjs.com/package/@fridgefm/radio-core)
![GitHub](https://img.shields.io/github/license/ch1ller0/fridgefm-radio-core.svg)
![node](https://img.shields.io/node/v/@fridgefm/radio-core.svg)

## Usage

> Simple lightweight package to start your own `live` radio station 📻 Just drop your `mp3` files and broadcast them to the world 🌎Heavily inspired by [Shoutcast](https://www.shoutcast.com) and [Icecast](http://icecast.org).

## Setup

### Installation
```
npm i @fridgefm/radio-core --save
```
### Server
```javascript
const { Station } = require('@fridgefm/radio-core');
const station = new Station();

station.addFolder('User/Music');

server.get('/stream', (req, res) => {
  station.connectListener(req, res);
});

station.start();
```
### Client
```html
<audio
    controls
    type='audio/mp3'
    src='/stream'
/>
```

## Station constructor
Creating a station is as simple as 
```javascript
const myAwesomeStation = new Station({
  verbose: false, // if true - enables verbose logging (great for debugging),
  responseHeaders: { // in case you want custom response headers for your endpoint
    'icy-genre': 'jazz'
  }
})
```

## Station methods
### Public methods that should be exposed to users
`connectListener` connects real users to your station  
response argument is required
```javascript
station.connectListener(request, response, callback);
```
### Private methods that should be used only by admins
`addFolder` adds track within a folder to the playlist
```javascript
station.addFolder('User/Music');
```
`start` starts broadcasting
```javascript
station.start();
```
`next` instantly switches track to the next one
```javascript
station.next();
```
`getPlaylist` just returns you the entire playlist
```javascript
station.getPlaylist();
```

## Station events
Station emits several events - they are available via 
```javascript
const { PUBLIC_EVENTS } = require('@fridgefm/radio-core')
```
#### `NEXT_TRACK`
event fires when track changes  
useful for getting to know when exactly the track changed and what track that is
```javascript
station.on(PUBLIC_EVENTS.NEXT_TRACK, (track) => {
  const result = await track.getMetaAsync();
  console.log(result)
})
```

#### `START`
Event fires on station start  
```javascript
station.on(PUBLIC_EVENTS.START, () => { console.log('Station started') });
```

#### `RESTART`
Event fires on station restart (when playlist is drained and new one is created)  
it might be a nice time to shuffle your playlist for example
```javascript
station.on(PUBLIC_EVENTS.RESTART, () => { /* do something*/ });
```

#### `ERROR`
Event fires when there is some error. You `should` add this handler - otherwise any error will be treated as unhandled (causing `process.exit` depending on Node version)
```javascript
station.on(PUBLIC_EVENTS.ERROR, (e) => { handleError(e) });
```

## or just go to [examples](./examples/server.js)
```
yarn build
node examples/server.js
```
OR
```
yarn build
node examples/server.js [path/to/your_mp3tracks]
# in this case it would take a little more time, just wait
```

## Demo
Fully working demo is available on https://fridgefm.com
