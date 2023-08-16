export const TimeoutTracker: {
  timeout: NodeJS.Timeout | null;
} = {
  timeout: null,
};
export const Timeout = (num: number) =>
  new Promise((resolve, reject) => {
    TimeoutTracker.timeout = setTimeout(() => {
      TimeoutTracker.timeout = null;
      reject(new Error('Request timed out'));
    }, num);
  });
