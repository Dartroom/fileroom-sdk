// write tests for the fetchHttpClient class
import { Client, ConfigOptions } from '../../src/';

describe('Client in nodejs', () => {
  it('class is exported by library', async () => {
    expect(Client).toBeDefined();
  });

  it('should throw error if config is not provided  ', async () => {
    // @ts-ignore
    expect(() => new Client()).toThrowError(new Error('Config is required'));
  });
});
