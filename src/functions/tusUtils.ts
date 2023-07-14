export function incrementGlobalProgress(target: Record<string, any>) {
  // increment global progress;
  let values = Object.values(target).filter(v => v && v.progress);

  let overall =
    (values.reduce((a, b) => a + Number(b.progress), 0) /
      (values.length * 100)) *
    100;
  overall = Number.isNaN(overall) ? 0 : Number(overall.toFixed(2));

  target.overallProgress = overall;
}
/** Proxy handler for the progressMap */
export const proxyHandler = {
  set(target: any, prop: string, value: any) {
    // if the target doesn't has the property, add with default value {progress:0};

    const hasProgress =
      typeof value === 'object' && Reflect.has(value, 'progress');
    const hasPercent =
      hasProgress &&
      typeof value.progress === 'object' &&
      Reflect.has(value['progress'] || {}, 'percent');

    if (!target[prop] && prop) {
      target[prop] = { progress: 0, jobs: new Map() };
    }

    if (hasProgress) {
      if (hasPercent) {
        target[prop].jobs.set(value.progress.job, value.progress.percent);
        let jobs = target[prop].jobs;
        target[prop].progress =
          ([...jobs.values()].reduce((a, b) => a + Number(b), 0) /
            (jobs.size * 100)) *
          100;
        if (value.result) {
          target[prop].result = value.result;
        }
        incrementGlobalProgress(target);
        return true;
      }
      // just set the target property;
      target[prop] = value;

      incrementGlobalProgress(target); // increment overall progress
      return true;
    } else {
      target[prop] = value.progress || value;

      target[prop].progress = 100;
      incrementGlobalProgress(target); // increment overall progress
      return true;
    }
  },
};
