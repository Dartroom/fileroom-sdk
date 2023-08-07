import { propagateErrors } from '../../src/functions';

describe('propagateErrors', () => {
  it('should throw error if json has errors property', () => {
    const json = {
      errors: [
        {
          message: 'Not found',
          status: 404,
        },
      ],
    };

    expect(() => {
      propagateErrors(json);
    }).toThrow('API_ERROR: NOT_FOUND 404');
  });

  it('should default status to 404 if not provided', () => {
    const json = {
      errors: [
        {
          message: 'Not found',
        },
      ],
    };

    expect(() => {
      propagateErrors(json);
    }).toThrow('API_ERROR: NOT_FOUND 404');
  });

  it('should set status to 404 if >= 403', () => {
    const json = {
      errors: [
        {
          message: 'Forbidden',
          status: 403,
        },
      ],
    };

    expect(() => {
      propagateErrors(json);
    }).toThrow('API_ERROR: NOT_FOUND 404');
  });

  it('should not throw if json does not have errors', () => {
    const json = {
      data: 'Success',
    };

    expect(() => {
      propagateErrors(json);
    }).not.toThrow();
  });
});
