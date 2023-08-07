import { createObjTemplate } from '../../src/functions';

describe('createObjTemplate', () => {
  it('should return correct template for video file type', () => {
    const result = createObjTemplate(2, 'video');

    expect(result).toEqual({
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'InterFs Upload': {
        progress: 0,
        used: false,
        expectedStage: 3,
        jobs: new Map(),
      },
      'InterFs Download': {
        progress: 0,
        used: false,
        expectedStage: 3,
        jobs: new Map(),
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: 2,
        jobs: new Map(),
      },
      'Original Processed': {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Video Transcode': {
        progress: 0,
        used: false,
        expectedStage: 2,
        jobs: new Map(),
      },
      'CDN Upload': {
        progress: 0,
        used: false,
        expectedStage: 2,
        jobs: new Map(),
      },
    });
  });

  it('should return correct template for 0 sizes video file', () => {
    const result = createObjTemplate(0, 'video');

    expect(result).toEqual({
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'InterFs Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'InterFs Download': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Original Processed': {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
    });
  });

  it('should return correct template for image file type', () => {
    const result = createObjTemplate(2, 'image');

    expect(result).toEqual({
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: 2,
        jobs: new Map(),
      },
      'CDN Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
    });
  });

  it('should return correct template for 0 sizes image file', () => {
    const result = createObjTemplate(0, 'image');

    expect(result).toEqual({
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
    });
  });

  it('should return correct template for any file type', () => {
    const result = createObjTemplate(2, 'any');

    expect(result).toEqual({
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'CDN Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
    });
  });

  it('should return correct template for duplicate any file', () => {
    const result = createObjTemplate(2, 'any', true);

    expect(result).toEqual({
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
    });
  });
});
