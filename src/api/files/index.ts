import { BaseApi } from '../baseApi';
import {
  listOptions,
  listResponse,
  awaitUploadResponse,
  deleteOneOptions,
  deleteOneResponse,
} from '../../interfaces';
import { propagateErrors } from '../../functions';

/**
 * Files  endpoint of  Fileroom API for:
 * - listing files
 * - awaiting for uploaded files
 * - And  deleting  them
 * @example
 *
 */
export class FilesApi extends BaseApi {
  /**
   *  list  a user files
   * @param options
   * @returns listResponse
   */
  async list(options?: listOptions) {
    let url = '/files/list';
    if (options) {
      let listParams = new URLSearchParams();
      for (let [key, value] of Object.entries(options)) {
        listParams.append(key, value);
      }
      url = url + '?' + listParams.toString();
    }

    const response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      'GET',
    );

    let json: any = await response.toJSON();
    propagateErrors(json);

    return json as listResponse;
  }
  /** Wait for an uploaded or imported file and return its updated record
   *@param id -  trackingID of uploaded file, or cid of the imported file
   * @returns awaitUploadResponse
   */
  async awaitUpload(id: string) {
    let url = '/await/upload/' + id;
    const response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      'GET',
    );

    let json: any = await response.toJSON();

    propagateErrors(json);
    return json as awaitUploadResponse;
  }
  /**
   * Delete a file and its previews
   * @param opts - {cid: string, docID: string}
   * @returns deleteOneResponse - {{data:Record<string,any>}}
   *
   */
  async deleteOne(opts: deleteOneOptions) {
    if (
      !opts ||
      (opts && !Object.keys(opts).length && (opts.cid || opts.docID))
    )
      throw new TypeError('   cid or docID is required');

    if (opts.cid && opts.docID)
      throw new TypeError(' cid or docID is required,not both');

    let response = await this.createHttpRequest.makeRequestwithDefault(
      'delete/one',
      'POST',
      opts,
    );

    let json: any = await response.toJSON();
    propagateErrors(json);
    return json as deleteOneResponse;
  }
}
