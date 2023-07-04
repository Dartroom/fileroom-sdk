import { BaseApi } from '../baseApi';
import {
  statusResponse,
  getResponse,
  LegacybrowserRawResponse,
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
    /** if its legacy browsers with no fetch support, the response from fetch polyfill doesn't contain a streamable body instead it contains a blob
       so we need to get the blob and convert it to a stream (there is a performance hit here)
    *  see https://caniuse.com/fetch
      */

    if (this.createHttpRequest._isLegacyBrowser) {
      let raw = (await response.getRawResponse()) as LegacybrowserRawResponse;
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
