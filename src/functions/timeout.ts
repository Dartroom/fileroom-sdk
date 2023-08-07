export const Timeout= (num: number) =>
  new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, num);
  });
