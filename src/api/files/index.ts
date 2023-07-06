import { BaseApi } from '../baseApi';
import {
  listOptions,
  listResponse,
  awaitUploadResponse,
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
  /** Wait for an uploaded or imported file and return updated its updated record
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
}
