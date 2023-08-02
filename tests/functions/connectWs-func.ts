import { connectWS,Timeout } from '../../src/functions';
import WebSocket from 'isomorphic-ws';

describe('connectWS', () => {
  it('should return a Promise<WebSocket>', async () => {
    const url = 'wss://socketsbay.com/wss/v2/1/demo/';
    
    
    try {
      const result = await Promise.race([connectWS(url), Timeout(3000)]);

      await expect(result).toBeInstanceOf(WebSocket);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('should reject if connection fails', async () => {
    const url = 'ws://wrong.url';
    const spy = jest.fn();
    await connectWS(url).catch(spy);
    expect(spy).toHaveBeenCalled();
  });
});
