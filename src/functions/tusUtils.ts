import { SocketData } from '../types';

export function incrementGlobalProgress(target: Record<string, any>) {
  // increment global progress;
  let values = Object.values(target).filter(
    v => v && v.hasOwnProperty('progress'),
  );

  let total = values.length * 100;

  let overall =
    (values.reduce((a, b) => a + Number(b.progress), 0) / total) * 100;
  overall = Number.isNaN(overall) ? 0 : Number(overall.toFixed(2));

  target.overallProgress = overall;
}
/** Proxy handler for the progressMap */
export const proxyHandler = {
  set(target: any, prop: string, value: any) {
    //console.log(typeof value, value)
    // if the target doesn't has the property, add with default value {progress:0};

    const hasProgress =
      typeof value === 'object' && Reflect.has(value, 'progress');
    const hasPercent =
      hasProgress &&
      typeof value.progress === 'object' &&
      Reflect.has(value['progress'], 'percent');
    //console.log(`${prop}: ${hasProgress}`, value)
    // prop is should be defined;
    try {
      if (target[prop] && !target[prop]['jobs']) {
        target[prop].used = true;
        target[prop].jobs = new Map();
      }
      if (hasProgress) {
        if (hasPercent) {
          target[prop].used = true;
          target[prop].jobs.set(value.progress.job, value.progress.percent);
          let jobs = target[prop].jobs;
          let expectedStage = target[prop].expectedStage;
          target[prop].progress =
            ([...jobs.values()].reduce((a, b) => a + Number(b), 0) /
              (expectedStage * 100)) *
            100;

          let result = value.result || value.progress?.result;
          if (result) {
            target[prop].result = result;
          }

          incrementGlobalProgress(target);
          return true;
        }
        // just set the target property;

        let v = target[prop];
        target[prop] = { ...v, ...value };
        target[prop].used = true;

        incrementGlobalProgress(target); // increment overall progress
        return true;
      } else {
        // got here
        let v = target[prop];
        let val = value.progress || value;
        target[prop] = { ...v, ...val };

        target[prop].used = true;

        target[prop].progress = 100;
        incrementGlobalProgress(target); // increment overall progress
        return true;
      }
    } catch (error) {
      console.log(error);
      return true;
    }
  },
};
