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
    const getPlaying = (pl) => pl.filter((track) => track.isPlaying);

    // as
    describe('start method', () => {
      it('playlist empty - start method wont execute', () => {
        const station = new Station();

        station.start();
        expect(getPlaying(station.getPlaylist())).toEqual([]);

        station.addFolder(pathToMusic);
        // still empty because station has not started
        expect(getPlaying(station.getPlaylist())).toEqual([]);
      });

      it('playlist not empty - start method executes', () => {
        const station = new Station();
        station.addFolder(pathToMusic);
        station.start();
        expect(getPlaying(station.getPlaylist()).length).toEqual(1);
      });
    });

    it('next method - switches to next track', () => {
      const station = new Station();
      station.addFolder(pathToMusic);

      const playing1 = getPlaying(station.getPlaylist());

      station.next();

      const playing2 = getPlaying(station.getPlaylist());

      expect(playing1).not.toEqual(playing2);
    });
  });

  describe('getReadableStream method', () => {
    it('returns a web ReadableStream', () => {
      const station = new Station();
      const stream = station.getReadableStream();

      expect(typeof stream.getReader).toEqual('function');
      stream.cancel();
    });

    it('streams live audio chunks once the station started', async () => {
      const station = new Station();
      station.addFolder(pathToMusic);
      station.start();

      const reader = station.getReadableStream().getReader();
      const { value, done } = await reader.read();

      expect(done).toEqual(false);
      expect(value).toBeInstanceOf(Uint8Array);
      expect(value.length).toBeGreaterThan(0);
      await reader.cancel();
    });

    it('cancelling one listener leaves the others streaming', async () => {
      const station = new Station();
      station.addFolder(pathToMusic);
      station.start();

      const readerA = station.getReadableStream().getReader();
      const readerB = station.getReadableStream().getReader();

      await readerA.cancel();
      const { value, done } = await readerB.read();

      expect(done).toEqual(false);
      expect(value).toBeInstanceOf(Uint8Array);
      await readerB.cancel();
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
    // @ts-expect-error
    station.connectListener(null, resMock, cbMock);
    expect(resMock.writeHead.mock.calls[0][0]).toEqual(200); // success code
    expect(resMock.writeHead.mock.calls[0][1]).toBeInstanceOf(Object); // response headers
    expect(resMock.write.mock.calls[0][0]).toBeInstanceOf(Buffer); // prebuffer attached
    expect(resMock.emit.mock.calls[0][0]).toEqual('pipe'); // pipes stream
    expect(cbMock).toBeCalledTimes(1); // callback executed

    // @ts-expect-error
    station.connectListener(null, resMock);
    expect(resMock.writeHead.mock.calls[1][0]).toEqual(200); // success code
    expect(resMock.writeHead.mock.calls[1][1]).toBeInstanceOf(Object); // response headers
    expect(resMock.write.mock.calls[1][0]).toBeInstanceOf(Buffer); // prebuffer attached
    expect(resMock.emit.mock.calls[1][0]).toEqual('pipe'); // pipes stream
    expect(cbMock).toBeCalledTimes(1); // callback executed
  });
});
