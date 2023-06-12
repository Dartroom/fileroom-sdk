import { ConfigOptions } from './interfaces';
import { FetchHttpClient } from './net/fetchHttpClient';
/**
 * The main client class
 */
export class Client {
  protected _config: ConfigOptions;
  protected __HttpClient: FetchHttpClient;

  constructor(config: ConfigOptions) {
    if (!config) {
      throw new Error('Config is required');
    }
    this._config = config;

    this.__HttpClient = new FetchHttpClient(config);
  }

   protected checkAuth() {
    if (!this._config.acessToken) {
      throw new Error('Access token is required');
    }
  }
}
