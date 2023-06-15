import { BaseApi } from '../baseApi';

interface createUserOptions {
  userId?: string;
  email?: string;
  password?: string;
}
/**
 * 
 */
export class UsersApi extends BaseApi {
  private readonly _path: string = '/user';
  public readonly refreshToken = () => this.login();

  /** checks the validity of the acessToken and returns a new one
   *
   * @returns [{data:string}]
   */
  async login() {
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/login',
      'POST',
    );
    let json = await response.toJSON();
    return json;
  }
  /** create a new Fileroom User
   *
   * @param data
   * @returns
   */
  async create(data: createUserOptions) {
    if (!data || (data && !Object.keys(data).length))
      throw new TypeError(
        'username, email and password are required or a userId for dartroomUsers',
      );

    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/create',
      'POST',
      data,
    );
    let json =  response.getRawResponse();
    return json;
  }
}
