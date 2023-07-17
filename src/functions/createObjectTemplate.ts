/** create an object template for progress-aggregation proxy
 *
 * @param {number} sizes
 * @param {"image"|'animation'|'video'} fileType
 * @return {{stage:string,expectedStage:number}}
 */
export function createObjTemplate(sizes: number, fileType: string) {
  if (fileType === 'video') {
    let obj = {
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
      },
      'InterFs Upload': {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
      },
      'InterFs Download': {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: sizes,
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
        expectedStage: sizes,
      },
      'CDN Upload': {
        progress: 0,
        used: false,
        expectedStage: sizes,
      },
    };
    return obj;
  }

  if (fileType === 'image' || fileType === 'animation') {
    let obj = {
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
    };
    return obj;
  }
  if (fileType === 'any') {
    let obj = {
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
    };
    return obj;
  }

  return {};
}
