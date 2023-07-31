import { createObjTemplate } from '../../src/functions';

describe('createObjTemplate', () => {
  it('should return correct template for video file type', () => {
    const result = createObjTemplate(2, 'video');

    expect(result).toEqual({
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
      },
      'InterFs Upload': {
        progress: 0,
        used: false,
        expectedStage: 3,
      },
      'InterFs Download': {
        progress: 0,
        used: false,
        expectedStage: 3,
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: 2,
      },
      'Original Processed': {
        progress: 100,
        used: false,
        expectedStage: 1,
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
      },
      'Video Transcode': {
        progress: 0,
        used: false,
        expectedStage: 2,
      },
      'CDN Upload': {
        progress: 0,
        used: false,
        expectedStage: 2,
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
      },
      'InterFs Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
      },
      'InterFs Download': {
        progress: 0,
        used: false,
        expectedStage: 1,
      },
      'Original Processed': {
        progress: 100,
        used: false,
        expectedStage: 1,
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
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: 2,
      },
      'CDN Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
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
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
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
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
      },
      'CDN Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
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
      },
      'Preview Completed': {
        progress: 100,
        used: false,
        expectedStage: 1,
      },
    });
  });
});
