import { Timeout } from '../../src/functions/timeout';

describe('Timeout', () => {
  it('should reject after specified timeout', async () => {
    const timeout = 1000;
    await expect(Timeout(timeout)).rejects.toThrow('Request timed out');
  });
});
