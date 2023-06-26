import { BaseApi } from '../baseApi';
import { createUserOptions, updateUserOptions } from '../../interfaces';

/**
 *
 */
export class UsersApi extends BaseApi {
  private readonly _path: string = '/user';

  /** checks the validity of the acessToken and returns a new one
   *
   * @returns [{data:string}]
   */
  public readonly refreshToken = async () => {
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/refreshToken',
      'POST',
    );
    let json = await response.toJSON();
    if (json.data) {
      this.createHttpRequest.setToken(json.data);
    }
    return json;
  };
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
    let json = response.getRawResponse();
    return json;
  }
  /** update a Fileroom User
   *
   * @param data
   * @returns
   */
  async update(data: updateUserOptions) {
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
   * @returns {data: apiKey}
   */
  async login(data: { username: string; password: string }) {
    if (!data || (data && !Object.keys(data).length))
      throw new TypeError('username and password are required');
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
