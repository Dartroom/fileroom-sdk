//** An interface for all client pass to our client */

export interface ConfigOptions {
  //** The api key */
  accessToken: string;
  timeout?: number; //** The timeout for the request */
  env?: 'test' | 'production' | 'beta';
}
