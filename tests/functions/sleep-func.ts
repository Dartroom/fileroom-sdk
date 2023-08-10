import { sleep } from '../../src/functions';

describe('sleep', () => {
  it('should pause execution for the given number of ms', async () => {
    const start = Date.now();
    await sleep(500);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(500);
  });

  it('should return a promise', () => {
    const result = sleep(10);
    expect(result).toBeInstanceOf(Promise);
  });

  it('should resolve the returned promise', async () => {
    await expect(sleep(10)).resolves.toBeUndefined();
  });

  it('should reject on invalid ms values', async () => {
    expect(async () => await sleep(-10)).rejects.toThrowError(
      new Error('ms must be a positive number'),
    );
  });
});
