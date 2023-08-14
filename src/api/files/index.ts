import { BaseApi } from '../baseApi';
import {
  listOptions,
  listResponse,
  awaitUploadResponse,
  deleteOneOptions,
  deleteResponse,
  uploadOptions,
  existsResponse,
} from '../../interfaces';
import { propagateErrors, sleep } from '../../functions';

import { UploadApi } from '../upload';
import { UploadFile, UploadEvents } from '../../types';

/**
 * Files  endpoint of  Fileroom API for:
 * - listing files
 * - awaiting for uploaded files
 * - And  deleting  them
 * @example
 *
 */
export class FilesApi extends BaseApi {
  public upload: UploadApi | null = null;
  /**
   *  list  a user files
   * @param {listOptions} options
   * @returns {listOptions} listResponse
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
   *@param {string} id - tracking id of the file
   * @returns {awaitUploadResponse} awaitUploadResponse
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
   * @param  {deleteOneOptions} opts
   * @returns {deleteResponse} deleteResponse
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
    return json as deleteResponse;
  }

  /**
   *  Delete a list of  files and their previews
   * @param cids - list of cids to delete
   * @returns {deleteResponse} - {{data:Record<string,any>}}
   */

  async deleteMany(cids: string[]) {
    let url = '/delete/many';
    if (!cids || !cids.length) throw new TypeError('cids is required');

    let cidParams = new URLSearchParams();
    for (let cid of cids) {
      cidParams.append('cid', cid);
    }
    url = url + '?' + cidParams.toString();

    let response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      'POST',
    );

    let json: any = await response.toJSON();

    propagateErrors(json);
    return json as deleteResponse;
  }
  /**
   * upload a file or an array of files with individual options(array)  or one globaloptions(see uploadOptions)
   * @param {UploadFile} file
   * @param {uploadOptions} options
   * @event  error - when an error occurs
   * @event progress - progressEvents  for when a single file is uploaded
   * @event  complete - when a single file is uploaded and the upload is complete
   * @event  completeAll - when multiple files are uploaded and their upload is complete
   * @event  globalProgress - progressEvents  for when multiple files are uploaded
   * @returns {UploadApi | Array<UploadApi> |undefined} - UploadApi instance
   */
  async uploadFiles(
    files: UploadFile | Array<UploadFile>,
    options?: uploadOptions | Array<uploadOptions>,
  ) {
    if (!arguments.length) throw new TypeError('file(s) is required');

    let multipleFiles = Array.isArray(files);
    let globalOpts = Array.isArray(options) ? undefined : options;

    this.upload = new UploadApi(
      this.createHttpRequest,
      globalOpts,
      multipleFiles,
    );

    try {
      if (!Array.isArray(files)) {
        this.upload = await this.upload.start(files, globalOpts);
        return this.upload;
      }

      for (let [index, file] of Object.entries(files)) {
        let opts = Array.isArray(options) ? options[Number(index)] : undefined;
        this.upload = await this.upload.start(file, opts);
        // sleep for 200ms
        await sleep(200);
      }
      return this.upload;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   *  Check if a file exists
   * @param search - cid or an integrityhash or OjHash
   * @returns
   */
  async exists(search: string) {
    let url = '/files/exists';

    if (!search)
      throw new TypeError('cid or an integrityhash or OjHash is required');

    let searchParams = new URLSearchParams();
    searchParams.append('search', search);
    url = url + '?' + searchParams.toString();

    let response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      'GET',
    );

    let json: any = await response.toJSON();

    propagateErrors(json);
    return json as existsResponse;
  }
}
