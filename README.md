# Radio engine for NodeJS
[![build](https://img.shields.io/circleci/build/github/Kefir100/radio-ch1ller.svg)](https://circleci.com/gh/Kefir100/radio-ch1ller)
[![coverage](https://img.shields.io/codecov/c/gh/Kefir100/radio-ch1ller.svg)](https://codecov.io/gh/Kefir100/radio-ch1ller)
[![npm](https://img.shields.io/npm/dw/@kefir100/radio-engine.svg)](https://www.npmjs.com/package/@kefir100/radio-engine)
![GitHub](https://img.shields.io/github/license/kefir100/radio-ch1ller.svg)
![node](https://img.shields.io/node/v/@kefir100/radio-engine.svg)

## Usage

> Simple lightweight package to start your own `live` radio station 📻 Just drop your `mp3` files and broadcast them to the world 🌎Heavily inspired by [Shoutcast](https://www.shoutcast.com) and [Icecast](http://icecast.org).

## Setup

### Installation
```
npm i @kefir100/radio-engine --save
```
### Server
```javascript
const { Station } = require('@kefir100/radio-engine');
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
`shufflePlaylist` shuffles playlist once   
You may want to pass your own sorting function, defaults to random shuffle
```javascript
station.shufflePlaylist(sortingFunction);
```
`rearrangePlaylist` just returns you the entire playlist  
```javascript
// the example moves the first track to the 5th position in playlist
station.rearrangePlaylist(0, 4);
```

## Station events
#### `nextTrack`
event fires when track changes  
useful for getting to know when exactly the track changed and what track that is
```javascript
station.on('nextTrack', (track) => { console.log(track) });
```

#### `start`
event fires on station start  
```javascript
station.on('start', () => { console.log('Station started') });
```

#### `restart`
event fires on station restart (when playlist is drained and new one is created)  
it might be a nice time to shuffle your playlist for example
```javascript
station.on('restart', () => { station.shufflePlaylist() });
```

#### `error`
event fires when there is some error
```javascript
station.on('error', (e) => { handleError(e) });
```

## or just go to [EXAMPLES](./examples/server.js)
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
Fully working demo is available on http://ch1ller.com
