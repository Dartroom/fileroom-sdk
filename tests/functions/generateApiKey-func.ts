import { generateApiKey } from '../../src/functions/generateApiKey';

describe('generateApiKey', () => {
  it('should generate a 40 character hex string', () => {
    const apiKey = generateApiKey();
    expect(apiKey).toHaveLength(40);
    expect(apiKey).toMatch(/^[0-9a-fA-F]+$/);
  });

  it('should generate different keys each time', () => {
    const key1 = generateApiKey();
    const key2 = generateApiKey();
    expect(key1).not.toEqual(key2);
  });
});
