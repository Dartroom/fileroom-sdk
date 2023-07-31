import { generateUUID } from '../../src/functions';

describe('generateUUID', () => {
  it('should generate a UUID when no input provided', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  

  it('should generate different UUIDs when called multiple times', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toEqual(uuid2);
  });

  it('should handle invalid input', () => {
    const input = 'invalid';
    expect(() => generateUUID(input)).not.toThrow();
  });
});
