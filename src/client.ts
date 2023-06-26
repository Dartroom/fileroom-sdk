import { ConfigOptions } from './interfaces';
import { FetchHttpClient } from './net/fetchHttpClient';
import { UsersApi } from './api/';
import { isApikey } from './functions';
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
  /**if an acessToken is passed,check it's validity */
  protected checkAuth() {
    if (
      this._config.accessToken &&
      this._config.accessToken.length &&
      !isApikey(this._config.accessToken)
    ) {
      return this.user
        .refreshToken()
        .then(res => res)
        .catch(e => {
          throw TypeError('invalid or expired AccessToken');
        });
    }
  }
}
