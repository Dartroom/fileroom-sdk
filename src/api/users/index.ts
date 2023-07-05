import { BaseApi } from '../baseApi';
import {
  createUserOptions,
  updateUserOptions,
  loginOptions,
  createUserResponse,
  updateUserResponse,
  loginResponse,
} from '../../interfaces';

/**
 *
 */
export class UsersApi extends BaseApi {
  private readonly _path: string = '/user';

  /** checks the validity of the acessToken
   *
   * @returns void
   */
  public readonly validatedToken = async () => {
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/refreshToken',
      'POST',
    );

    let json = await response.toJSON();

    if (json && json.errors) {
      throw TypeError('invalid or expired AccessToken');
    }
  };
  /** create a new Fileroom User
   *
   * @param data - {createUserOptions}
   * @returns createUserResponse - {data: string | { id: string,token: string}}
   */
  async create(data: createUserOptions): Promise<createUserResponse> {
    if (!data || (data && !Object.keys(data).length))
      throw new TypeError(
        'username, email and password are required or a userId for dartroomUsers',
      );

    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/create',
      'POST',
      data,
    );
    let json = response.toJSON();
    return json;
  }
  /** update a Fileroom User
   *
   * @param data
   * @returns
   */
  async update(data: updateUserOptions): Promise<updateUserResponse> {
    let allowedFields = [
      'addIP',
      'removeIP',
      'addDomain',
      'removeDomain',
      'restrictIPs',
      'restrictDomains',
      'showAll',
    ];

    if (!data || (data && !Object.keys(data).length))
      throw new TypeError(
        'at least one of the following fields is required: addIP,removeIP,addDomain,removeDomain,restrictIPs,restrictDomains,showAll',
      );

    if (!Object.keys(data).every(k => allowedFields.includes(k))) {
      throw new TypeError(
        'at least one of the following fields is required: addIP,removeIP,addDomain,removeDomain,restrictIPs,restrictDomains,showAll',
      );
    }
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/update',
      'POST',
      data,
    );
    let json = response.toJSON();
    return json;
  }

  /** login dev user with their username and password
   * @param data
   * @returns loginResponse - {data:string} - the accessToken
   */
  async login(data: loginOptions): Promise<loginResponse> {
    if (!data || (data && !Object.keys(data).length))
      throw new TypeError(
        'username and password  or the dartroomID & fileroomID are  required',
      );
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/login',
      'POST',
      data,
    );
    let json = await response.toJSON();
    if (json.data) {
      this.createHttpRequest.setToken(json.data);
    }
    return json;
  }
}
