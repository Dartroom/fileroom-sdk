import { BaseApi } from '../baseApi';
import {
  statusResponse,
  getResponse,
  browserRawResponse,
} from '../../interfaces';
import { isBrowser } from 'browser-or-node';
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

  /** get a file from the gateway
   * @param cid
   * */
  async get(cid: string): Promise<getResponse> {
    const response = await this.createHttpRequest.makeRequestwithDefault(
      '/ipfs/' + cid,
      'GET',
    );
    let headers: any = response.getHeaders();
    let contentType = headers['content-type'];
    let fileLength = headers['content-length'];
    let metatdata = {
      contentType: contentType,
      contentLength: fileLength,
    };
    let result = {} as getResponse;

    let stream = null;
    if (contentType.includes('application/json')) {
      let json = await response.toJSON();
      result.errors = json.errors.map((v: any) => {
        v.status = 404;
        v.message = 'File not found';
        return v;
      });
      return result;
    }
    result.metatdata = metatdata;
    if (isBrowser) {
      let raw = (await response.getRawResponse()) as browserRawResponse;
      console.log(raw);

      stream = raw._bodyInit.stream();
      result.stream = stream;
      return result;
    } else {
      stream = response.toStream(() => {}) as ReadableStream<Uint8Array>;
      result.stream = stream;
      return result;
    }
  }
}
