//** An interface for all client pass to our client */

export interface ConfigOptions {
  //** The api key */
  acessToken: string;
  timeout?: number; //** The timeout for the request */
}
