import { Station } from '../../index';
import { pathToMusic } from '../test-utils.mock';

describe('public/HappyPath/Station', () => {
  describe('playlist methods', () => {
    it('adding folders - deduplicates same tracks', () => {
      const station = new Station();

      expect(station.getPlaylist().length).toEqual(0);
      station.addFolder(pathToMusic);

      expect(station.getPlaylist().length).toEqual(2);
      station.addFolder(pathToMusic);
      expect(station.getPlaylist().length).toEqual(2);
    });

    it.todo('reorder folders - customly changes tracks order');
    it.todo('getting playlist - returns the playlist');
  });

  describe('control methods', () => {
    const station = new Station();
    const getPlaying = (pl) => pl.filter((track) => track.isPlaying);

    describe('start method', () => {
      it('playlist empty - start method wont execute', () => {
        station.start();
        expect(getPlaying(station.getPlaylist())).toEqual([]);

        station.addFolder(pathToMusic);
        // still empty because station has not started
        expect(getPlaying(station.getPlaylist())).toEqual([]);
      });

      it('playlist not empty - start method executes', () => {
        station.start();
        expect(getPlaying(station.getPlaylist()).length).toEqual(1);
      });
    });

    it('next method - switches to next track', () => {
      const playing1 = getPlaying(station.getPlaylist());

      station.next();

      const playing2 = getPlaying(station.getPlaylist());

      expect(playing1).not.toEqual(playing2);
    });
  });

  it('listner connects - response methods are called', () => {
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
});
