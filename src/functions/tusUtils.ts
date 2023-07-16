export function incrementGlobalProgress(target: Record<string, any>) {
  // increment global progress;
  let values = Object.values(target).filter(v => v && v.progress&&v.used);

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
    //console.log(typeof value, value)
    // if the target doesn't has the property, add with default value {progress:0};

    const hasProgress =
      typeof value === 'object' && Reflect.has(value, 'progress');
    const hasPercent =
      hasProgress &&
      typeof value.progress === 'object' &&
      Reflect.has(value['progress'] || {}, 'percent');
    //console.log(`${prop}: ${hasProgress}`, value)
    // prop is should be defined;

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
        if (value.result) {
          target[prop].result = value.result;
        }
        incrementGlobalProgress(target);
        return true;
      }
      // just set the target property;
      target[prop] = value;
      target[prop].used = true;
      incrementGlobalProgress(target); // increment overall progress
      return true;
    } else {
      target[prop] = value.progress || value;
      target[prop].used = true;

      target[prop].progress = 100;
      incrementGlobalProgress(target); // increment overall progress
      return true;
    }
  },
};
