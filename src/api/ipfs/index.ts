import { BaseApi } from '../baseApi';
import { statusResponse } from '../../interfaces';

/**
 *  IPFS  endpoint for the Fileroom API
 */

export class IpfsApi extends BaseApi {
  /**check pinning status of the given cid
   * @param cid
   * @returns statusResponse
   */
  async status(cid: string) {
    const response = await this.createHttpRequest.makeRequestwithDefault(
      '/ipfs/status' + '?cid=' + cid,
      'GET',
    );
    let json: any = await response.toJSON();

    return json as statusResponse;
  }
}
