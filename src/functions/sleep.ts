/**
 * Pauses execution for the given number of milliseconds.
 *
 * @param ms - The number of milliseconds to pause for.
 * @returns A Promise that resolves after the given number of milliseconds.
 */
export function sleep(ms: number) {
  if (ms < 0) throw new Error('ms must be a positive number');
  return new Promise(resolve => setTimeout(resolve, ms));
}
