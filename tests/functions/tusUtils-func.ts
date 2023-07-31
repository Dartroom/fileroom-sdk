import { incrementGlobalProgress, proxyHandler } from '../../src/functions';

describe('tusUtils', () => {
  describe('incrementGlobalProgress', () => {
    it('should calculate overall progress', () => {
      const target: any = {
        prop1: { progress: 50 },
        prop2: { progress: 100 },
      };

      incrementGlobalProgress(target);

      expect(target.overallProgress).toBe(75);
    });
  });
});
