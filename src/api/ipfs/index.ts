import { BaseApi } from '../baseApi';
import { StreamResponse } from '../../types';
import {
  statusResponse,
  LegacybrowserRawResponse,
  getOptions,
  pinOptions,
  pinResponse,
} from '../../interfaces';
import { isBrowser } from 'browser-or-node';
import { Stream } from 'stream';
import { propagateErrors } from '../../functions';
/**
 *  IPFS  endpoint for the Fileroom API
 */

export class IpfsApi extends BaseApi {
  public returnedHeaders: Record<string, string> = {};
  /**check pinning status of the given cid
   * @param {cid} cid
   * @returns {statusResponse} statusResponse
   */
  async status(cid: string) {
    const response = await this.createHttpRequest.makeRequestwithDefault(
      '/ipfs/status' + '?cid=' + cid,
      'GET',
    );
    let json: any = await response.toJSON();

    return json as statusResponse;
  }

  /**
   *  get a file from the gateway
   * @param cid - cid of the file to fetch
   * @param {getOptions} options
   * @returns {{StreamResponse}} StreamResponse
   * */
  async get(cid: string, options?: getOptions): Promise<StreamResponse> {
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

    let stream = null;
    if (contentType.includes('application/json')) {
      let json = await response.toJSON();
      propagateErrors(json);
    }

    /** if its legacy browsers with no fetch support, the response from fetch polyfill doesn't contain a streamable body instead it contains a blob
       so we need to get the blob and convert it to a stream (there is a performance hit here)
    *  see https://caniuse.com/fetch
      */

    if (this.createHttpRequest._isLegacyBrowser) {
      let raw = (await response.getRawResponse()) as LegacybrowserRawResponse;
      console.log(raw);

      stream = raw._bodyInit.stream();

      return stream;
    } else {
      stream = isBrowser
        ? (response.toStream(() => {}) as ReadableStream<Uint8Array>)
        : (response.toStream(() => {}) as Stream);

      return stream;
    }
  }
  /** import a file by cid, create previews and pin it to our ipfs cluster
   * @param cid
   * @param  options - {resize: string[]} - array of sizes to create previews for given file(image or video)
   */
  async pin(cid: string, options?: pinOptions): Promise<pinResponse> {
    if (!cid || (cid && cid.length < 5)) throw new TypeError('cid is required');
    let url = '/ipfs/pin/' + cid;

    if (options && options.resize) {
      let resizeParams = new URLSearchParams();
      for (let size of options.resize) resizeParams.append('resize', size);
      url = url + '?' + resizeParams.toString();
    }

    const response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      'POST',
    );

    let json: any = await response.toJSON();

    propagateErrors(json);

    return json as pinResponse;
  }
}
