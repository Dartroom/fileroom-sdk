import { BaseApi } from '../baseApi';
import {
  statusResponse,
  getResponse,
  LegacybrowserRawResponse,
  getOptions,
} from '../../interfaces';
import { isBrowser} from 'browser-or-node';
import { Stream } from 'stream';
/**
 *  IPFS  endpoint for the Fileroom API
 */

export class IpfsApi extends BaseApi {
  public returnedHeaders: Record<string, string> = {};
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
  async get(cid: string, options?: getOptions): Promise<getResponse> {
    if (!cid || (cid && cid.length < 5)) throw new TypeError('cid is required');
    let url = '/ipfs/' + cid;
    if (options && options.origin) {
      this.createHttpRequest.extendHeaders({ Origin: options.origin });
    }

    if (options && options.size) {
      url = url + '?' + 'size=' + options.size;
    }

    const response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      'GET',
    );
    let headers: any = response.getHeaders();
    this.returnedHeaders = headers;

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
      if (json.errors) {
        let error = json.errors[0];
        let status = error.status as number;
        let message = status >= 403 ? 'NOT_FOUND' : error.message;
        status = status >= 403 ? 404 : status;

        throw new Error('API_ERROR: ' + message + ' ' + status);
      }
    }
    result.metadata = metatdata;
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
      stream = isBrowser
        ? (response.toStream(() => {}) as ReadableStream<Uint8Array>)
        : (response.toStream(() => {}) as Stream);
      result.stream = stream;
      return result;
    }
  }
}
