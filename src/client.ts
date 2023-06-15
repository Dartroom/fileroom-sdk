import { ConfigOptions } from './interfaces';
import { FetchHttpClient } from './net/fetchHttpClient';
import { UsersApi } from './api/';
/**
 * The main client class
 */
export class Client {
  protected readonly _config: ConfigOptions;
  protected readonly __HttpClient: FetchHttpClient;
  public readonly user: UsersApi;

  constructor(config: ConfigOptions) {
    if (!config) {
      throw new TypeError('Config is required');
    }
    this._config = config;

    this.__HttpClient = new FetchHttpClient(config);
    this.user = new UsersApi(this.__HttpClient);
    this.checkAuth();
  }
  /**check if the authToken is valid */
  protected checkAuth() {
    if (!this._config.accessToken) {
      throw new Error('config.accessToken is required,');
    }
    return this.user
      .login()
      .then(res => res)
      .catch(e => {
        throw TypeError('invalid or expired AccessToken');
      });
  }
}
