import { Station, PUBLIC_EVENTS } from '../../index';
import { pathToMusic } from '../test-utils.mock';

const createChecker = () => ({
  start: jest.fn(),
  nextTrack: jest.fn(),
  restart: jest.fn(),
  error: jest.fn(),
});

describe('public/HappyPath/events', () => {
  it('station events - fires', () => {
    const checker = createChecker();
    const station = new Station();

    station.on(PUBLIC_EVENTS.START, (...args) => checker.start(...args));
    station.on(PUBLIC_EVENTS.NEXT_TRACK, (...args) => checker.nextTrack(...args));
    station.on(PUBLIC_EVENTS.RESTART, (...args) => checker.restart(...args));
    station.on(PUBLIC_EVENTS.ERROR, (...args) => checker.error(...args));

    station.addFolder(pathToMusic);

    // event "start"
    station.start();

    expect(checker.start).toHaveBeenCalledTimes(1);
    // start event fired
    expect(checker.start.mock.calls[0][0]).toEqual(station.getPlaylist());
    // expect(checker.start).toHaveBeenCalledWith(station.getPlaylist());
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
