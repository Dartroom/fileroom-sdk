import { EventProgress } from '../../dist';
import {
  incrementGlobalProgress,
  proxyHandler,
  createObjTemplate,
} from '../../src/functions';
import { SocketData, ProgressEvent } from '../../src/types';

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

  describe('proxyHandler', () => {
    it('should handle setting a progress value with percent', () => {
      const target = createObjTemplate(2, 'video');

      const value = {
        status: 'CDN Upload',
        progress: {
          percent: 50,
          job: 'job1',
        },
      } as SocketData;
      const prop = value.status;
      proxyHandler.set(target, prop, value);
      // @ts-ignore
      let val = target[prop] as EventProgress;

      //@ts-ignore
      expect(val.jobs.get('job1')).toBe(50);
      //@ts-ignore
      expect(val.progress).toBe(25);
    });

    it('should handle setting a progress value with percent and result', () => {
      const target = createObjTemplate(2, 'video');

      const value = {
        status: 'CDN Upload',
        progress: {
          percent: 50,
          job: 'job1',
          result: {
            file: {},
          },
        },
      } as SocketData;
      const prop = value.status;
      proxyHandler.set(target, prop, value);
      // @ts-ignore
      let val = target[prop] as EventProgress;

      //@ts-ignore
      expect(val.jobs.get('job1')).toBe(50);
      //@ts-ignore
      expect(val.progress).toBe(25);
      //@ts-ignore
      expect(val.result).toEqual(
        expect.objectContaining({
          file: expect.any(Object),
        }),
      );
    });

    it('should handle setting a progress value without percent', () => {
      const target = createObjTemplate(2, 'video');

      const value = {
        status: 'CDN Upload',
        progress: {
          job: 'job1',
        },
      } as SocketData;
      const prop = value.status;

      proxyHandler.set(target, prop, value);

      // @ts-ignore
      let val = target[prop] as EventProgress;

      // @ts-ignore
      expect(val.progress).toBeDefined();
    });

    it('should handle setting a non-progress value', () => {
      let target = createObjTemplate(2, 'video');

      const value = {
        status: 'CDN Upload',
        result: {
          file: {},
        },
      } as SocketData;
      const prop = value.status;
      proxyHandler.set(target, prop, value);

      //@ts-ignore
      let val = target[prop] as EventProgress;

      //@ts-ignore
      expect(val.result).toEqual(
        expect.objectContaining({
          file: expect.any(Object),
        }),
      );
      //@ts-ignore
      expect(val.progress).toBe(100);
    });
  });
});
