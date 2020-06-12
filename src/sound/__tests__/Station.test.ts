import { times, range } from 'lodash';
import { Station } from '../../index';

const pathToMusic = `${process.cwd()}/examples/music`;

describe('public/Station', () => {
  describe('playlist methods', () => {
    it('addFolder works as expected', () => {
      const station = new Station();

      expect(station.getPlaylist().length).toEqual(0);
      station.addFolder(pathToMusic);
      expect(station.getPlaylist().length).toEqual(2);
      station.addFolder(pathToMusic);
      expect(station.getPlaylist().length).toEqual(4);
    });

    it('shufflePlaylist with built-in random algorythm', () => {
      const station = new Station();

      // if random sort equals previous result, test will fail
      // minimize random factor by scheduling more tracks
      times(100, () => { // results in 200 tracks in playlist
        station.addFolder(pathToMusic);
      });

      const firstPlaylist = station.getPlaylist();
      station.shufflePlaylist();
      const secondPlaylist = station.getPlaylist();

      expect(firstPlaylist).not.toEqual(secondPlaylist);
      expect(firstPlaylist.length).toEqual(secondPlaylist.length);
    });

    const getTracksSeq = (pl) => pl.map((t) => t.fsStats.name);

    it('shufflePlaylist with custom algorythm', () => {
      const station = new Station();

      times(5, () => {
        station.addFolder(pathToMusic);
      });

      // custom sorting algorithm
      station.shufflePlaylist((a, b) => {
        const getLastChar = (t) => t[t.length - 1];

        return getLastChar(a.fsStats.name) - getLastChar(b.fsStats.name);
      });

      const result = getTracksSeq(station.getPlaylist());

      expect(range(0, 5).map(() => 'Artist1 - Track1')).toEqual(result.slice(0, 5));
      expect(range(5, 10).map(() => 'Artist1 - Track2')).toEqual(result.slice(5, 10));
    });

    it('rearrangePlaylist works right', () => {
      const station = new Station();

      times(2, () => {
        station.addFolder(pathToMusic);
      });

      expect(getTracksSeq(station.getPlaylist())).toEqual([
        'Artist1 - Track1',
        'Artist1 - Track2',
        'Artist1 - Track1',
        'Artist1 - Track2',
      ]);

      // swap first and second track position
      station.rearrangePlaylist(0, 1);

      expect(getTracksSeq(station.getPlaylist())).toEqual([
        'Artist1 - Track2',
        'Artist1 - Track1',
        'Artist1 - Track1',
        'Artist1 - Track2',
      ]);
    });
  });

  describe('control methods', () => {
    const station = new Station();
    const getPlaying = (pl) => pl.filter((track) => track.isPlaying);

    it('start method wont start if playlist empty', () => {
      station.start();
      expect(getPlaying(station.getPlaylist())).toEqual([]);

      station.addFolder(pathToMusic);
      // still empty because station has not started
      expect(getPlaying(station.getPlaylist())).toEqual([]);
    });

    it('start if playlist not empty', () => {
      station.start();
      expect(getPlaying(station.getPlaylist()).length).toEqual(1);
    });

    it('next method switches to next track', () => {
      const playing1 = getPlaying(station.getPlaylist());

      station.next();

      const playing2 = getPlaying(station.getPlaylist());

      expect(playing1).not.toEqual(playing2);
    });
  });

  it('connectListener method', () => {
    const resMock = {
      writeHead: jest.fn(),
      write: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
    };

    const cbMock = jest.fn();

    const station = new Station();

    station.addFolder(pathToMusic);
    // @ts-ignore
    station.connectListener(null, resMock, cbMock);
    expect(resMock.writeHead.mock.calls[0][0]).toEqual(200); // success code
    expect(resMock.writeHead.mock.calls[0][1]).toBeInstanceOf(Object); // response headers
    expect(resMock.write.mock.calls[0][0]).toBeInstanceOf(Buffer); // prebuffer attached
    expect(resMock.emit.mock.calls[0][0]).toEqual('pipe'); // pipes stream
    expect(cbMock).toBeCalledTimes(1); // callback executed

    // @ts-ignore
    station.connectListener(null, resMock);
    expect(resMock.writeHead.mock.calls[1][0]).toEqual(200); // success code
    expect(resMock.writeHead.mock.calls[1][1]).toBeInstanceOf(Object); // response headers
    expect(resMock.write.mock.calls[1][0]).toBeInstanceOf(Buffer); // prebuffer attached
    expect(resMock.emit.mock.calls[1][0]).toEqual('pipe'); // pipes stream
    expect(cbMock).toBeCalledTimes(1); // callback executed
  });

  it('events firing', () => {
    const station = new Station();
    const checker = {
      start: jest.fn(),
      nextTrack: jest.fn(),
      restart: jest.fn(),
      error: jest.fn(),
    };

    station.on('start', (...args) => checker.start(...args));
    station.on('nextTrack', (...args) => checker.nextTrack(...args));
    station.on('restart', (...args) => checker.restart(...args));
    station.on('error', (...args) => checker.error(...args));

    station.addFolder(pathToMusic);

    // event "start"
    station.start();
    // start event fired
    expect(checker.start.mock.calls[0][0]).toEqual(station.getPlaylist());
    // nextTrack event fired
    expect(checker.nextTrack.mock.calls[0][0]).toEqual(station.getPlaylist()[0]);

    // event "nextTrack"
    station.next();
    // nextTrack returns a track
    expect(checker.nextTrack.mock.calls[1][0]).toEqual(station.getPlaylist()[1]);
    // also sends time which the handler took
    const nextTrStats = checker.nextTrack.mock.calls[1][1];
    expect(typeof nextTrStats.time).toEqual('number');

    // event "restart"
    station.next();
    // returns playlist
    expect(checker.restart.mock.calls[0][0]).toEqual(station.getPlaylist());
    // also sends time which the handler took
    const nextStats = checker.nextTrack.mock.calls[1][1];
    expect(typeof nextStats.time).toEqual('number');

    // @TODO find some way to test error event
  });

  describe('unhappy paths', () => {
    it('wrong folder', () => {
      const station = new Station();
      expect(() => {
        station.addFolder('biba'); // non-existing
      }).toThrow();
    });
  });
});
