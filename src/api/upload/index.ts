import { EventEmitter } from 'ee-ts';
import { Upload } from 'tus-js-client';

import {
  UploadFile,
  ProgressEvent,
  GlobalProgress,
  UploadResult,
} from '../../types';
import {
  uploadOptions,
  RequestOptions,
  ConfigOptions,
  socketEvent,
  UploadListners,
  EventProgress,
} from '../../interfaces';
import { isBrowser, isNode } from 'browser-or-node';

import { Readable, Stream } from 'stream';
import { generateUUID } from '../../functions';
import { proxyHandler, createObjTemplate, classifyFile } from '../../functions';
import WebSocket from 'isomorphic-ws';

/**
 * Upload  endpoint for the FilesAPI of the Fileroom API
 * @param reqOpts - {host,port,protocol,timeout} 
 * @param config - {accessToken,env} 
 * @options - uploadOptions  
 * 
 * @example 
 * ```js

      const client = new Client({accessToken: 'your token',env:'test' | 'production' | 'beta'});

      let readStream = fs.createReadStream('path/to/file');
      // usage with files APi (single file upload)
      let {files} = client;
        let upload = await files.uploadFile(readStream,{
          resize:[1080]
        });

        upload.on('progress',(progress)=>{
        // get the progress of the upload
        }) 

        upload.on('completed',(result)=>{
        // get the result of the upload
        
        }) 

        upload.on("error",(error)=>{}) // get the error of the upload

        // usage with upload API (multiple file upload)

        import {Upload} from 'fileroom-sdk';

        let upload = new UploadApi(reqOpts,config,options);

        let files = [file1,file2,file3];

        for(let file of files){
          await upload.start(file);
        }

        upload.on("globalProgress",(progress)=>{
          // get the ProgressMap of the uploads
           
        }) 

          upload.on("allCompleted",(results)=>{
          // await for all uploads to complete and get the results
          })
          upload.on("error",(error)=>{}) // get the error of the upload
 ```
 *
 */
export class UploadApi extends EventEmitter<UploadListners> {
  _path: string = '/upload';
  _url: string = '';
  _uploadOptions: Record<string, string> = {};
  _results: Array<UploadResult> = []; // all collections of results from uploads

  _headers: Record<string, string> = {};
  _tus: Upload | null = null;
  _rawUrl = '';
  _socket: WebSocket | null = null;
  _progressMap: Map<string, any> = new Map();
  _isSecure: boolean = false; // if the protocol is https
  _fileID: string = '';
  _uploadCount: number = 0;
  uploads: Record<string, string> = {};

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

    this._url = this._rawUrl + this._path + '?fileID=' + fileID;

    // populate progressMap with the fileID
    let mime = this._uploadOptions['filetype'] || '';
    let sizes: string[] = this._uploadOptions['resize']
      ? JSON.parse(this._uploadOptions['resize'])
      : [];

    let fileType = await classifyFile({ mimetype: mime });

    let obj = createObjTemplate(sizes.length, fileType);

    let p = new Proxy(obj, proxyHandler);
    this._progressMap.set(fileID, p);

    if (this._uploadOptions.hasOwnProperty('name')) {
      this.uploads[fileID] = this._uploadOptions['name'];
    }

    let wsUrl = this._rawUrl.replace('http', 'ws') + '/file-events/' + fileID;

    let opts: any = {};
    if (isNode) {
      opts.encoding = 'utf8';
    }
    this._socket = new WebSocket(wsUrl);

    this._socket.onmessage = async (event: MessageEvent) => {
      let data = event.data;
      if (data) {
        data = JSON.parse(data) as socketEvent;
        this.handleWsMessage(data, fileID);
      }
    };
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
      onProgress: async (bytesUploaded, bytesTotal) => {
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
        await this.handleWsMessage(payload, fileID);
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
      // name
      this._uploadOptions['name'] = file.name;

      this._uploadOptions['size'] = file.size.toString();
      done = true;
    }

    // if the file Type is ReadableStream, add the file size and type to the metadata (Node only)

    if (file instanceof Stream) {
      let { fileTypeFromStream } = await import('file-type');
      // @ts-ignore
      if (file.hasOwnProperty('path') && file.path) {
        // @ts-ignore
        this._uploadOptions['name'] = file.path;
      }

      let mimeType = await fileTypeFromStream(file as Readable);
      if (!mimeType) throw new Error('File type not supported');
      this._uploadOptions['filetype'] = mimeType.mime;
      //name

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
   * emits progress, globalProgress, completed, allCompleted
   * @param event
   * @param fileID
   */
  async handleWsMessage(event: socketEvent, fileID: string) {
    let { data } = event;

    if (data) {
      let status = data.status;
      this._progressMap.get(fileID)[status] = data;

      this.emit('progress', this._progressMap.get(fileID) as ProgressEvent);

      let result = data.result || data.progress?.result;
      // global;

      this.emit(
        'globalProgress',
        this._progressMap as GlobalProgress,
        Object.keys(this.uploads)?.length ? this.uploads : undefined,
      );

      if (status === 'Preview Completed' && result) {
        this.emit('completed', result);
        this._results.push(result);
        // when each upload is completed, upload
        this._uploadCount++;
        if (this._uploadCount === this._progressMap.size)
          this.emit('allCompleted', this._results);
      }
    }
  }
}
