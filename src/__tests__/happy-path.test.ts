import { Station, PUBLIC_EVENTS } from '../index';

const pathToMusic = `${process.cwd()}/examples/music`;

describe('public/happy-paths', () => {
  describe('playlist methods', () => {
    it('addFolder works as expected', () => {
      const station = new Station();

      expect(station.getPlaylist().length).toEqual(0);
      station.addFolder(pathToMusic);

      expect(station.getPlaylist().length).toEqual(2);
      station.addFolder(pathToMusic);
      expect(station.getPlaylist().length).toEqual(2);
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
      info: jest.fn(),
    };

    station.on(PUBLIC_EVENTS.START, (...args) => checker.start(...args));
    station.on(PUBLIC_EVENTS.NEXT_TRACK, (...args) => checker.nextTrack(...args));
    station.on(PUBLIC_EVENTS.RESTART, (...args) => checker.restart(...args));
    station.on(PUBLIC_EVENTS.ERROR, (...args) => checker.error(...args));
    station.on(PUBLIC_EVENTS.INFO, (...args) => checker.error(...args));

    station.addFolder(pathToMusic);

    // event "start"
    station.start();

    expect(checker.start).toHaveBeenCalledTimes(1);
    // start event fired
    expect(checker.start).toHaveBeenCalledWith(station.getPlaylist());
    // nextTrack event fired
    expect(checker.nextTrack.mock.calls[0][0]).toEqual(station.getPlaylist()[0]);

    // event "nextTrack"
    station.next();
    // nextTrack returns a track
    expect(checker.nextTrack.mock.calls[1][0]).toEqual(station.getPlaylist()[1]);

    // event "restart"
    station.next();

    // returns playlist
    expect(checker.restart.mock.calls[0][0].map((v) => v.fsStats))
      .toEqual(station.getPlaylist().map((v) => v.fsStats));

    // @TODO find some way to test error event
  });
});

describe('public/Station/unhappy-paths', () => {
  it('wrong folder', () => {
    const station = new Station();
    expect(() => {
      station.addFolder('biba'); // non-existing
    }).toThrow();
  });

  it.todo('track was deleted while playback - revalidates folders and');
});
