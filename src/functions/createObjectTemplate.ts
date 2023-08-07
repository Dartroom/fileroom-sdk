/** create an object template for progress-aggregation proxy
 *
 * @param {number} sizes
 * @param {"image"|'animation'|'video'} fileType
 * @return {{stage:string,expectedStage:number}}
 */
export function createObjTemplate(
  sizes: number,
  fileType: string,
  duplicate = false,
) {
  if (fileType === 'video') {
    let obj = {
      'Tus Upload': {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: new Map(),
      },
      'InterFs Upload': {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
        jobs: new Map(),
      },
      'InterFs Download': {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
        jobs: new Map(),
      },
      'Ipfs Upload': {
        progress: 0,
        used: false,
        expectedStage: sizes,
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
        expectedStage: sizes,
        jobs: new Map(),
      },
      'CDN Upload': {
        progress: 0,
        used: false,
        expectedStage: sizes,
        jobs: new Map(),
      },
    };
    return duplicate
      ? {
          'Tus Upload': {
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
        }
      : sizes === 0
      ? {
          'Tus Upload': {
            progress: 0,
            used: false,
            expectedStage: 1,
            jobs: new Map(),
          },
          'InterFs Upload': {
            progress: 0,
            used: false,
            expectedStage: sizes + 1,
            jobs: new Map(),
          },

          'InterFs Download': {
            progress: 0,
            used: false,
            expectedStage: sizes + 1,
            jobs: new Map(),
          },
          'Original Processed': {
            progress: 100,
            used: false,
            expectedStage: 1,
            jobs: new Map(),
          },
        }
      : obj;
  }

  if (fileType === 'image' || fileType === 'animation') {
    let obj = {
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
    };
    return sizes === 0
      ? {
          'Tus Upload': {
            progress: 0,
            used: false,
            expectedStage: 1,
            jobs: new Map(),
          },
          'Ipfs Upload': {
            progress: 0,
            used: false,
            expectedStage: sizes + 1,
            jobs: new Map(),
          },

          'Preview Completed': {
            progress: 100,
            used: false,
            expectedStage: 1,
            jobs: new Map(),
          },
        }
      : obj;
  }
  if (fileType === 'any') {
    let obj = {
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
    };
    return duplicate
      ? {
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
        }
      : obj;
  }

  return {};
}
