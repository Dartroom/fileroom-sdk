/** Check if the acessToken passed   apiKey
 *  Our apikey is a 40 character hex string whilst acessToken longer
 *  @param {string} acessToken
 */

export function isApikey(token: string): boolean {
  return token.length === 40 && /[0-9A-Fa-f]{6}/g.test(token);
}
