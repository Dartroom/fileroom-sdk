import { EventEmitter } from 'events';
import { Upload } from 'tus-js-client';

import { UploadFile } from '../../types';
import { uploadOptions, RequestOptions, ConfigOptions } from '../../interfaces';
import { isBrowser, isNode } from 'browser-or-node';

import { Readable, Stream } from 'stream';
import { generateUUID } from '../../functions';
import { proxyHandler } from '../../functions';
import WebSocket from 'isomorphic-ws';
import { FilesApi } from '../files';

/**
 * Upload  endpoint for the FilesAPI of the Fileroom API
 *
 */
export class UploadApi extends EventEmitter {
  _path: string = '/upload';
  _url: string = '';
  _uploadOptions: Record<string, string> = {};
  file: UploadFile;
  _headers: Record<string, string> = {};
  _tus: Upload | null = null;
  _rawUrl = '';
  _socket: WebSocket | null = null;
  _progressMap: Map<string, any> = new Map();
  _isSecure: boolean = false; // if the protocol is https
  _fileID: string = '';
  _filesApi: FilesApi | null = null;

  constructor(
    file: UploadFile,
    reqOpts: RequestOptions,
    fileApi: FilesApi,
    cofig: ConfigOptions,
    options?: uploadOptions,
  ) {
    super();
    this._filesApi = fileApi;
    let { host, port, protocol, timeout } = reqOpts;

    const Secure = protocol === 'https';
    this._isSecure = Secure;
    this._rawUrl = `${Secure ? 'https' : 'http'}://${host}:${port}`;
    const url = new URL(this._path, this._rawUrl);
    url.port = port as string;
    this._url = url.toString();
    this.file = file;

    this._headers = {
      Authorization: `Bearer ${cofig.accessToken}`,
      'X-Forwarded-Proto': protocol as string,
    };
    if (options) {
      for (let [key, value] of Object.entries(options)) {
        this._uploadOptions[key] = JSON.stringify(value);
      }
    }

    // if the file Type is File or Blob, add the file size and type to the metadata (Browser only)
  }
  async start() {
    await this.setfileMeta();
    let fileID = generateUUID();

    this._url = this._url + '?fileID=' + fileID;

    // populate progressMap with the fileID

    let p = new Proxy({}, proxyHandler);
    this._progressMap.set(fileID, p);

    let wsUrl = this._rawUrl.replace('http', 'ws') + '/file-events/' + fileID;

    let opts: any = {};
    if (isNode) {
      opts.encoding = 'utf8';
    }
    this._socket = new WebSocket(wsUrl);

    this._socket.on('message', async (data: any) => {
      if (data) {
        data = data.toString();
        data = JSON.parse(data);
        this.handleWsMessage(data, fileID);
        this.emit('overallProgress', this._progressMap.get(fileID));
      }
    });
    let upload = new Upload(this.file, {
      endpoint: this._url,
      metadata: this._uploadOptions,
      headers: this._headers,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      removeFingerprintOnSuccess: true,
      chunkSize: 10 * 1024 * 1024,

      onError: error => {
        this.emit('error', error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        this.emit('progress', bytesUploaded / bytesTotal);
      },
      onSuccess: () => {
        this.emit('success');
      },
    });
    upload.start();
    this._tus = upload;

    if (this._filesApi) {
      let completed = await this._filesApi.awaitUpload(fileID);

      this.emit('result', completed);
    }

    return this;
  }
  /**
   * set the file metadata to be uploaded (size and type)
   * @returns boolean - true if the file metadata is set
   */
  async setfileMeta() {
    let done = false;
    let file = this.file;
    if (
      isBrowser &&
      ((typeof File !== 'undefined' && file instanceof File) ||
        (typeof Blob !== 'undefined' && file instanceof Blob))
    ) {
      this._uploadOptions['filetype'] = file.type;
      this._uploadOptions['size'] = file.size.toString();
      done = true;
    }

    // if the file Type is ReadableStream, add the file size and type to the metadata (Node only)

    if (this.file instanceof Stream) {
      let file = this.file as Readable;

      let { fileTypeFromStream } = await import('file-type');
      let mimeType = await fileTypeFromStream(file);
      if (!mimeType) throw new Error('File type not supported');
      this._uploadOptions['filetype'] = mimeType.mime;
      // get the file size
      let size = 0;
      for await (const chunk of file) {
        size += chunk.length;
        this.emit('progress', size);
      }

      this._uploadOptions['size'] = size.toString();
      done = true;
    }
    // wait till upload is comoleted

    return done;
  }
   /**
    * Method to handle the websocket messages
    * @param event 
    * @param fileID 
    */
  handleWsMessage(event: any, fileID: string) {
    let { data } = event;

    if (data) {
      this._progressMap.get(fileID)[data.status] = data;
      let result = data.result || data.progress.result;
    }
  }
}
