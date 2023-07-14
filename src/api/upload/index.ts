import { EventEmitter } from 'ee-ts';
import { Upload } from 'tus-js-client';

import { UploadFile, ProgressEvent, UploadEvents } from '../../types';
import {
  uploadOptions,
  RequestOptions,
  ConfigOptions,
  socketEvent,
  UploadListners,
} from '../../interfaces';
import { isBrowser, isNode } from 'browser-or-node';

import { Readable, Stream } from 'stream';
import { generateUUID } from '../../functions';
import { proxyHandler } from '../../functions';
import WebSocket from 'isomorphic-ws';


/**
 * Upload  endpoint for the FilesAPI of the Fileroom API
 *
 */
export class UploadApi extends EventEmitter<UploadListners> {
  _path: string = '/upload';
  _url: string = '';
  _uploadOptions: Record<string, string> = {};

  _headers: Record<string, string> = {};
  _tus: Upload | null = null;
  _rawUrl = '';
  _socket: WebSocket | null = null;
  _progressMap: Map<string, any> = new Map();
  _isSecure: boolean = false; // if the protocol is https
  _fileID: string = '';

  constructor(
    reqOpts: RequestOptions,

    cofig: ConfigOptions,
    options?: uploadOptions,
  ) {
    super();

    let { host, port, protocol, timeout } = reqOpts;

    const Secure = protocol === 'https';
    this._isSecure = Secure;
    this._rawUrl = `${Secure ? 'https' : 'http'}://${host}:${port}`;
    const url = new URL(this._path, this._rawUrl);
    url.port = port as string;
    this._url = url.toString();

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
  async start(file: UploadFile): Promise<UploadApi> {
    await this.setfileMeta(file);
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
        data = JSON.parse(data) as socketEvent;
        this.handleWsMessage(data, fileID);
      }
    });
    let upload = new Upload(file, {
      endpoint: this._url,
      metadata: this._uploadOptions,
      headers: this._headers,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      removeFingerprintOnSuccess: true,
      chunkSize: 10 * 1024 * 1024,

      onError: error => {

         throw new Error(error.message);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        var percentage = (bytesUploaded / bytesTotal) * 100;

        let payload: socketEvent = {
          event: 'progress',
          data: {
            progress: {
              percent: Math.round(percentage),
              job: 'original',
            },
            status: 'Tus Upload',
          },
        };
        this.handleWsMessage(payload, fileID);
      },
      onSuccess: () => {},
    });
    upload.start();
    this._tus = upload;

    return this;
  }
  /**
   * set the file metadata to be uploaded (size and type)
   * @returns boolean - true if the file metadata is set
   */
  async setfileMeta(file: UploadFile) {
    let done = false;

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

    if (file instanceof Stream) {
      let { fileTypeFromStream } = await import('file-type');
      let mimeType = await fileTypeFromStream(file as Readable);
      if (!mimeType) throw new Error('File type not supported');
      this._uploadOptions['filetype'] = mimeType.mime;
      // get the file size
      let size = 0;
      for await (const chunk of file) {
        size += chunk.length;
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
  handleWsMessage(event: socketEvent, fileID: string) {
    let { data } = event;

    if (data) {
      let status = data.status;
      this._progressMap.get(fileID)[status] = data;
      let value = this._progressMap.get(fileID) as ProgressEvent;
      let result = data.result || data.progress?.result;

      this.emit('progress', value);

      if (status === 'Preview Completed' && result) {
        this.emit('completed', result);
      }
    }
  }
}
