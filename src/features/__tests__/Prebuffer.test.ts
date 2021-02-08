import { Buffer } from 'buffer';
import { Prebuffer } from '../Prebuffer';

const createChunks = (from: string) => from.split('').map((v) => Buffer.from([Number(v)]));

describe('features/Prebuffer', () => {
  it('adds chunks up to max', () => {
    const instance = new Prebuffer({ prebufferLength: 10 });
    expect(instance.getStorage()).toHaveLength(0);

    instance.modify(createChunks('1'));

    expect(instance.getStorage()).toHaveLength(10);
    expect(instance.getStorage().join('')).toEqual('1000000000');
  });

  it('does not overflow max values', () => {
    const instance = new Prebuffer({ prebufferLength: 10 });

    instance.modify(createChunks('1234567890'));
    expect(instance.getStorage()).toHaveLength(10);
    expect(instance.getStorage().join('')).toEqual('1234567890');

    // overflow - the length stays the same
    instance.modify(createChunks('1234'));
    expect(instance.getStorage().join('')).toEqual('4567890123');

    instance.modify(createChunks('1234'));
    expect(instance.getStorage().join('')).toEqual('8901234123');
  });

  it('uses default if length not set', () => {
    const instance = new Prebuffer();
    instance.modify(createChunks('1'));

    expect(instance.getStorage()).toHaveLength(12);
  });
});
