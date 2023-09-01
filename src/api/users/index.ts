import { BaseApi } from '../baseApi';
import {
  createUserOptions,
  updateUserOptions,
  loginOptions,
  createUserResponse,
  updateUserResponse,
  loginResponse,
  validatedTokenResponse,
} from '../../interfaces';
import { propagateErrors, generateApiKey } from '../../functions';

/**
 *
 */
export class UsersApi extends BaseApi {
  private readonly _path: string = '/user';

  /** checks the validity of the acessToken
   *
   * @returns void
   */
  public readonly validateToken = async () => {
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/validateToken',
      'POST',
    );

    let json = await response.toJSON();

    propagateErrors(json);
    return json as validatedTokenResponse;
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
    let json = await response.toJSON();

    propagateErrors(json);
    return json as createUserResponse;
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
      'addApiKey',
      'removeApiKey',
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

    // stringify the addApiKey object
    let payload: any = { ...data };
    if (data.addApiKey) {
      let apiKey = generateApiKey();
      let keyObject = { [data.addApiKey]: apiKey };

      payload.addApiKey = JSON.stringify(keyObject);
    }
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/update',
      'POST',
      payload,
    );

    let json = await response.toJSON();

    propagateErrors(json);
    return json;
  }

  /** login dev user with their username and password
   * @param data -  username & password Or a dartroomToken
   * @returns loginResponse - {data:string} - the accessToken
   */
  async login(data: loginOptions): Promise<loginResponse> {
    if (!data || (data && !Object.keys(data).length))
      throw new TypeError(
        'username and password  or dartroomToken is required are  required',
      );

    if (data.dartroomToken && data.dartroomToken.length > 0) {
      this.createHttpRequest.extendHeaders({
        Authorization: `refresh ${data.dartroomToken}`,
      });
    }
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + '/login',
      'POST',
      data,
    );
    let json = await response.toJSON();

    propagateErrors(json);
    if (json.data) {
      this.createHttpRequest.setToken(json.data);
    }
    return json as loginResponse;
  }
}
