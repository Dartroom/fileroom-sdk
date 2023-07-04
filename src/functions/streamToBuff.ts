import { Stream } from 'stream';
/**convert a readStream to a buffer */

export async function streamToBuff(stream: Stream): Promise<Buffer> {
  return new Promise((r, j) => {
    let buffer = Buffer.from([]);
    stream.on('data', buf => {
      buffer = Buffer.concat([buffer, buf]);
    });
    stream.on('end', () => r(buffer));
    stream.on('error', j);
  });
}
