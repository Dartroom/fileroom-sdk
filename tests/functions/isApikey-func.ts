import { isApikey } from '../../src/functions';

describe('isApikey', () => {
  it('should return true for a valid 40 character hex api key', () => {
    const apiKey = '0123456789abcdef0123456789abcdef01234567';
    expect(isApikey(apiKey)).toBe(true);
  });

  it('should return false for non-hex strings', () => {
    const invalidApiKey = 'abcdefghijklmnopqrstuvwxyz0123456789';
    expect(isApikey(invalidApiKey)).toBe(false);
  });

  it('should return false for strings less than 40 characters', () => {
    const shortApiKey = '0123456789abcdef0123456789abcde';
    expect(isApikey(shortApiKey)).toBe(false);
  });

  it('should return false for strings greater than 40 characters', () => {
    const longApiKey = '0123456789abcdef0123456789abcdef012345678';
    expect(isApikey(longApiKey)).toBe(false);
  });
});
