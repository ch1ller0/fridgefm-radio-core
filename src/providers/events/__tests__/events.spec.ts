import { eventBusFactory, PUBLIC_EVENTS } from '../events.provider';

const createMocks = () => ({
  start: jest.fn(),
  restart: jest.fn(),
  next_track: jest.fn(),
  info: jest.fn(),
});

describe('features/EventBus', () => {
  it.each([
    ['START', { message: 'Station started', payload: [] }],
    ['RESTART', { message: 'Station restarted', payload: [] }],
    ['NEXT_TRACK', { message: 'stringified-mock', payload: { fsStats: { stringified: 'stringified-mock' } } }],
  ])('"%s" infos public event', (eventName, { message, payload }) => {
    const mocks = createMocks();
    const instance = eventBusFactory({});
    const lowerCased = eventName.toLowerCase();

    instance.on(PUBLIC_EVENTS.INFO, mocks.info);
    instance.on(PUBLIC_EVENTS[eventName], mocks[lowerCased]);
    expect(mocks[lowerCased]).toHaveBeenCalledTimes(0);
    expect(mocks.info).toHaveBeenCalledTimes(0);

    instance.emit(PUBLIC_EVENTS[eventName], payload, 10);

    expect(mocks[lowerCased]).toHaveBeenCalledTimes(1);
    expect(mocks[lowerCased]).toHaveBeenCalledWith(payload, 10);

    expect(mocks.info).toHaveBeenCalledTimes(1);
    expect(mocks.info).toHaveBeenCalledWith({
      event: PUBLIC_EVENTS[eventName],
      message,
      timings: 10,
    });
  });
});
