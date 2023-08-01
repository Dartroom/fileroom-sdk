import { connectWS } from '../../src/functions/connectWs';
import WebSocket from 'isomorphic-ws';
 jest.setTimeout(10000000);


describe('connectWS', () => {
  it('should return a Promise<WebSocket>', async () => {
    const url = 'wss://socketsbay.com/wss/v2/1/demo/';

    const result = await connectWS(url);

    await  expect(result).toBeInstanceOf(WebSocket);
    try {
      await result.close();
    } catch (err) { 

    }
  });

  it('should reject if connection fails', async () => {
    const url = 'ws://wrong.url';
    const spy = jest.fn();
    await connectWS(url).catch(spy);
    expect(spy).toHaveBeenCalled();
  });
});
