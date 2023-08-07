import { EventEmitter } from 'ee-ts';
import { Upload } from 'tus-js-client';
import mime from 'mime-types';
import {
  UploadFile,
  ProgressEvent,
  GlobalProgress,
  UploadResult,
  RequestHeaders,
  FileDoc,
} from '../../types';
import {
  uploadOptions,
  RequestOptions,
  socketEvent,
  UploadListners,
} from '../../interfaces';
import { isBrowser, isNode } from 'browser-or-node';

import { Readable, Stream } from 'stream';
import { generateUUID, connectWS } from '../../functions';
import { proxyHandler, createObjTemplate, classifyFile } from '../../functions';
import WebSocket from 'isomorphic-ws';
import crypo from 'crypto';
import { FetchHttpClient } from '../../net/fetchHttpClient';
import { FilesApi } from '../files';

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

  _headers: RequestHeaders;
  _tus: Upload | null = null;
  _rawUrl = '';
  _socket: WebSocket | null = null;
  _progressMap: Map<string, any> = new Map();
  _isSecure: boolean = false; // if the protocol is https
  _fileID: string = '';
  _uploadCount: number = 0;
  uploads: Record<string, string> = {};
  protected createHttpRequest: FetchHttpClient;
  protected fileApi: FilesApi;
  uploadMultiple: boolean = false;

  constructor(
    client: FetchHttpClient,
    options?: uploadOptions,
    multiple = false,
  ) {
    super();
    let reqOpts = client._requestOpts as RequestOptions;
    let { host, port, protocol, timeout } = reqOpts;
    let config = client._config;
    this.createHttpRequest = client;
    this.fileApi = new FilesApi(client);
    this.uploadMultiple = multiple;
    const Secure = protocol === 'https';
    this._isSecure = Secure;
    this._rawUrl = `${Secure ? 'https' : 'http'}://${host}${
      port ? ':' + port : ''
    }`;
    const url = new URL(this._path, this._rawUrl);
    url.port = port as string;
    this._url = url.toString();
    this.createHttpRequest.extendHeaders({
      'X-Forwarded-Proto': protocol as string,
    });
    this._headers = this.createHttpRequest._Headers;
    if (options) {
      for (let [key, value] of Object.entries(options)) {
        this._uploadOptions[key] = JSON.stringify(value);
      }
    }

    // if the file Type is File or Blob, add the file size and type to the metadata (Browser only)
  }
  async start(file: UploadFile, options?: uploadOptions): Promise<UploadApi> {
    if (options) {
      for (let [key, value] of Object.entries(options)) {
        this._uploadOptions[key] = JSON.stringify(value);
      }
    }
    let sha = await this.setfileMeta(file);
    let fileID = generateUUID();
    // overide options on the the class;

    this._url = this._rawUrl + this._path + '?fileID=' + fileID;

    // populate progressMap with the fileID
    let mime = this._uploadOptions['filetype'] || '';
    let sizes: string[] = this._uploadOptions['resize']
      ? JSON.parse(this._uploadOptions['resize'])
      : [];

    let checksum = this._uploadOptions['checksum'] || sha;

    let fileExists = await this.fileApi.exists(checksum);
    let exists = fileExists.data.exists;

    let fileType = await classifyFile({ mimetype: mime });

    let obj = createObjTemplate(sizes.length, fileType, exists);

    let p = new Proxy(obj, proxyHandler);
    this._progressMap.set(fileID, p);

    if (this._uploadOptions.hasOwnProperty('name')) {
      this.uploads[fileID] = this._uploadOptions['name'];
    }

    let wsUrl = this._rawUrl.replace('http', 'ws') + '/file-events/' + fileID;

    this._socket = await connectWS(wsUrl);
    this._socket.onmessage = async (event: any) => {
      let data = event.data;
      if (data && data !== 'pong') {
        data = JSON.parse(data) as socketEvent;
        this.handleWsMessage(data, fileID);
      }
    };
    let upload = new Upload(file, {
      endpoint: this._url,
      metadata: this._uploadOptions,
      headers: this._headers as any,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      removeFingerprintOnSuccess: true,
      chunkSize: 5 * 1024 * 1024,

      onError: error => {
        this.emit('error', error);
        throw Error;
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
    let sha = '';

    if (
      isBrowser &&
      ((typeof File !== 'undefined' && file instanceof File) ||
        (typeof Blob !== 'undefined' && file instanceof Blob))
    ) {
      this._uploadOptions['filetype'] = file.type;
      // name
      this._uploadOptions['name'] = file.name;

      this._uploadOptions['size'] = file.size.toString();

      let hash = crypo.createHash('sha256');
      let stream = await file.stream();
      let reader = stream.getReader();

      while (true) {
        let { done, value } = await reader.read();
        if (done) break;
        if (value) hash.update(value);
      }
      file = reader;
      let checksum = hash.digest('base64');
      this._uploadOptions['checksum'] = checksum;
      sha = checksum;
    }

    // if the file Type is ReadableStream, add the file size and type to the metadata (Node only)

    if (file instanceof Stream) {
      // @ts-ignore
      if (file.hasOwnProperty('path') && file.path) {
        // @ts-ignore
        this._uploadOptions['name'] = file.path;
        // @ts-ignore
        let mimeType = mime.lookup(file.path);
        if (!mimeType) throw new Error('File type not supported');
        this._uploadOptions['filetype'] = mimeType;
      }

      //name

      // get the file size
      let size = 0;
      let hash = crypo.createHash('sha256');
      for await (const chunk of file) {
        size += chunk.length;
        hash.update(chunk);
      }
      let checksum = hash.digest('base64');
      this._uploadOptions['checksum'] = checksum;
      this._uploadOptions['size'] = size.toString();
      sha = checksum;
    }
    // wait till upload is comoleted

    return sha;
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
      let result = data.result || data.progress?.result;

      if (!this.uploadMultiple)
        this.emit('progress', this._progressMap.get(fileID) as ProgressEvent);

      let Globallisteners = [
        ...this.listeners('globalProgress'),
        ...this.listeners('allCompleted'),
      ];

      if (!this.uploadMultiple && Globallisteners.length) {
        throw new Error(
          'globalProgress and allCompleted listeners are required for multiple uploads, listen to the completed and progress events instead',
        );
      }

      let Singlelisteners = [
        ...this.listeners('progress'),
        ...this.listeners('completed'),
      ];
      if (this.uploadMultiple)
        if (Singlelisteners.length) {
          throw new Error(
            'progress and completed listeners are required for single uploads, listen to the globalProgress and allCompleted events instead',
          );
        }
      let totalProgress = 0;
      let expectedSize = [...this._progressMap.keys()].filter(
        event => event !== 'totalProgress',
      ).length;

      let obj: any = {};
      for (let [key, value] of this._progressMap) {
        let progress = value as ProgressEvent;
        let newKey = this.uploads[key] || key;
        if (newKey) obj[newKey] = value;
        let { overallProgress } = progress;
        if (overallProgress) totalProgress += overallProgress;
      }

      let percent = (totalProgress / (expectedSize * 100)) * 100;
      this._progressMap.set('totalProgress', Number(percent.toFixed(2)));

      obj.totalProgress = Number(percent.toFixed(2));

      this.emit('globalProgress', obj);

      let completed =
        result && result.hasOwnProperty('file')
          ? result.file
          : (result as FileDoc);

      if (
        result &&
        completed.expectedPreviewCount === completed.currentPreviewCount
      ) {
        if (this.uploadMultiple) {
          this._results.push(result);
          // when each upload is completed, upload
          this._uploadCount++;
          if (this._uploadCount === this._progressMap.size - 1) {
            this.emit('allCompleted', this._results);
            // close the socket
            this._socket?.close();
          }
        }

        this.emit('completed', result);
        // close the socket after the upload
        this._socket?.close();
      }
    }
  }
}
