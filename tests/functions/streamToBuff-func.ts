import { streamToBuff } from '../../src/functions';
import { PassThrough } from 'stream';

describe('streamToBuff', () => {
  it('should convert a stream to a buffer', async () => {
    const stream = new PassThrough();
    stream.end('hello');

    const buffer = await streamToBuff(stream);

    expect(buffer).toEqual(Buffer.from('hello'));
  });
});
