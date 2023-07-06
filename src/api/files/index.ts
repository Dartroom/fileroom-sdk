import { BaseApi } from '../baseApi';
import { listOptions, listResponse } from '../../interfaces';

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

    if (json && json.errors) {
      let error = json.errors[0];
      let status = (error.status as number) || 404;
      let message = status >= 403 ? 'NOT_FOUND' : error.message;
      status = status >= 403 ? 404 : status;

      throw new Error('API_ERROR: ' + message + ' ' + status);
    }

    return json as listResponse;
  }
}
