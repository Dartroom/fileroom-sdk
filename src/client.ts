import { ConfigOptions } from './interfaces';
import { FetchHttpClient } from './net/fetchHttpClient';
import { UsersApi, IpfsApi, FilesApi } from './api/';

/**
 * The main client class
 *params: config - default {env:'production'}
 * @example ```js 
  const client = new Client({accessToken: 'your token',env:'test' | 'production' | 'beta'});
  // import the ipfs and user api
  let {ipfs,user} = client;

  let result = await user.login({username:'username',password:'password'})


  ```
 */
export class Client {
  public readonly _config: ConfigOptions;
  protected readonly __HttpClient: FetchHttpClient;
  public readonly user: UsersApi;
  public readonly ipfs: IpfsApi;
  public readonly files: FilesApi;

  /**
   *
   * @param config  - {accessToken:string,env:'test' | 'production' | 'beta',timeout?:number}
   */
  constructor(config: ConfigOptions) {
    if (!config) {
      throw new TypeError('Config is required');
    }
    this._config = config;

    this.__HttpClient = new FetchHttpClient(config);
    this.user = new UsersApi(this.__HttpClient);
    this.ipfs = new IpfsApi(this.__HttpClient);
    this.files = new FilesApi(this.__HttpClient);
    this.checkAuth();
  }
  /**if an acessToken is passed,check it's validity */
  protected async checkAuth() {
    if (this._config.accessToken && this._config.accessToken.length > 0) {
      return this.user.validateToken().then(res => res);
    }
    return;
  }
}
