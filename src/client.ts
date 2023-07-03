import { ConfigOptions } from './interfaces';
import { FetchHttpClient } from './net/fetchHttpClient';
import { UsersApi,IpfsApi } from './api/';
import { isApikey } from './functions';

/**
 * The main client class
 */
export class Client {
  public readonly _config: ConfigOptions;
  protected readonly __HttpClient: FetchHttpClient;
  public readonly user: UsersApi;
  public readonly ipfs: IpfsApi;

  constructor(config: ConfigOptions) {
    if (!config) {
      throw new TypeError('Config is required');
    }
    this._config = config;

    this.__HttpClient = new FetchHttpClient(config);
    this.user = new UsersApi(this.__HttpClient);
    this.ipfs = new IpfsApi(this.__HttpClient);
    this.checkAuth();
  }
  /**if an acessToken is passed,check it's validity */
  protected async checkAuth() {
    if (this._config.accessToken && this._config.accessToken.length > 0) {
      return !isApikey(this._config.accessToken)
        ? this.user.validatedToken().then(res => res)
        : null;
    }
    return;
  }
}
