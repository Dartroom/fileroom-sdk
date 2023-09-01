import { Stream, Readable } from 'stream';
import { EventEmitter } from 'ee-ts';
import { Upload } from 'tus-js-client';
import WebSocket from 'isomorphic-ws';

interface ConfigOptions {
    accessToken: string;
    timeout?: number;
    env?: 'test' | 'production' | 'beta';
}

declare const enum PinStatus {
    PINNED = "pinned",
    QUEUED = "queued",
    UNPINNED = "unpinned"
}
declare const enum AccountType {
    DARTROOM = "DARTROOM",
    FILEROOM = "EXTERNAL"
}

/**Events recieved from  fileroom*/
type EventName = 'Create checksum' | 'Tus Upload' | 'Original Processed' | 'InterFs Upload' | 'InterFs Download' | 'IPfs Upload' | 'IPfs Download' | 'CDN Upload' | 'Pin Status' | 'Video Transcode' | 'Preview Completed';
type OverallProgress = {
    overallProgress: number;
};
type ProgressEvent = {
    [key in EventName]: EventProgress;
} & OverallProgress;
type UploadEvents = 'progress' | 'completed' | 'error' | 'success' | 'Globalprogress';
type ProgressMap = Map<string, EventProgress>;
type GlobalProgress = {
    [key in ProgressMap as string]: EventProgress;
} & {
    totalProgress: number;
};
type Color = string | RGBA;
type FileDoc = {
    _id: string;
    userId: string;
    totalSize: number;
    duplicate: boolean;
    duplicateFiles: string[];
    trackingId: string;
    expectedPreviewCount: number;
    currentPreviewCount: number;
    pinningStatus: PinStatus;
    original: {
        cid: string;
        mimetype: string;
        size: number;
        integrityHash: string;
        resolution: {
            width: number;
            height: number;
        };
        frameRate: number;
    };
    previews: Array<{
        cid: string;
        width: number;
        height: number;
        mimetype: string;
        size: number;
    }>;
};
type UploadResult = {
    file: FileDoc;
    deleted?: UploadDeleteResponse | null | any[];
    previewsFound?: boolean;
    listenTo?: {
        wsUrl: string;
        event: string;
    };
} & FileDoc;
type UploadDeleteResponse = {
    file?: FileDoc | null;
    deleted: true;
};
type SocketData = {
    status: EventName;
    progress?: {
        percent: number | string;
        job: string;
        result?: UploadResult;
    };
    filename?: string;
    result?: UploadResult;
    current?: number;
    totalJobs?: number;
};

type Long = {
    low: number;
    high: number;
    unsigned: boolean;
};
type UserDoc = {
    _id: string;
    userId: string;
    accountType: AccountType;
    bandwidthUsage: Long;
    totalStorageUsage: Long;
    uploadLimit: Long;
    storageLimit: Long;
    Filesuploaded: Number;
    FilesRecentStored: Number;
    apiToken: Array<{
        name: string;
        key: string;
    }>;
    restrictIPs: Boolean;
    restrictDomains: Boolean;
    ipWhitelist: Array<String>;
    domainWhitelist: Array<String>;
    showAll: Boolean;
};

type RequestData = Record<string, any>;
type RequestHeaders = Record<string, string | number | string[]> | typeof Request;
type ResponseHeaderValue = string | string[];
type ResponseHeaders = Record<string, ResponseHeaderValue> | typeof Headers;
type TimeoutError = TypeError & {
    code?: string;
};
type FileroomError = Array<{
    data?: {
        message: string;
    };
    message: string;
    source?: string;
    status?: number;
}>;
type StreamResponse = ReadableStream<Uint8Array> | Stream;
type UploadFile = File | Blob | Pick<ReadableStreamDefaultReader<any>, 'read'> | Readable;

interface HttpClientInterface {
    getClientName: () => string;
    makeRequest: (host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: RequestData, protocol: string, timeout: number) => Promise<HttpClientResponseInterface>;
}
interface HttpClientResponseInterface {
    getStatusCode: () => number;
    getHeaders: () => ResponseHeaders;
    getRawResponse: () => unknown;
    toStream: (streamCompleteCallback: () => void) => unknown;
    toJSON: () => Promise<any>;
}

/** defined Request */
interface RequestOptions {
    host: string;
    port?: number | string;
    path: string;
    protocol: string;
    timeout: number;
}

/**Input Options for client.user.create
 * @param userId - the userId can be provided without other fields to create a fileroom Account only for dartroomUsers.
 *@params {email,password}The remaining fields should be provided to create an External User (Dev User) for fileroom.
 *
 */
interface createUserOptions {
    userId?: string;
    email?: string;
    password?: string;
    name?: string;
}
/**Input Options for client.user.update */
interface updateUserOptions {
    addIP?: string;
    removeIP?: string;
    addDomain?: string;
    removeDomain?: string;
    restrictIPs?: string;
    restrictDomains?: boolean;
    showAll?: boolean;
    addApiKey?: string;
    removeApiKey?: string;
}
/**Input Options for client.user.login */
interface loginOptions {
    username?: string;
    password?: string;
    dartroomToken?: string;
}
/** Return Object from client.user.create */
interface createUserResponse {
    data: string | {
        id: string;
        token: string;
    };
}
/** Return Object from client.user.update */
interface updateUserResponse {
    data: {
        updated: UserDoc;
    };
}
/** Return Object from client.user.login */
interface loginResponse {
    data: string;
}
/** Return Object from client.user.validatedToken */
interface validatedTokenResponse {
    data: {
        isValid: boolean;
    };
}

interface statusResponse {
    peername: string;
    status: string;
    ipfs_peer_id: string;
    ipfs_peer_addresses: string[];
    timestamp: string;
    error: string;
    attempt_count: number;
    priority_pin: boolean;
    metadata: any | null;
    created: string;
}
/**Options for getResponse */
interface getOptions {
    origin?: string;
    size?: string;
}
/** Fetch polyfill response for legacy browsers

 */
interface LegacybrowserRawResponse {
    _bodyBlob: Blob;
    _bodyInit: Blob;
    type: string;
    url: string;
    statusText: string;
    ok: boolean;
    headers: Headers;
}
/** Pinning options for import a file by cid */
interface pinOptions {
    resize: string[];
}
/** Return Object from pin/cid */
interface pinResponse {
    data: {
        message: string;
        result?: FileDoc;
        listenTo?: {
            wsUrl: string;
            event: string;
        };
    };
}
interface socketEvent {
    event: string;
    data?: SocketData;
}
interface EventProgress {
    percent: number | string;
    jobs: Map<string, number>;
    result?: UploadResult;
}
interface UploadListners {
    progress: (progress: ProgressEvent) => void;
    completed: (result: UploadResult) => void;
    error: (error: Error) => void;
    globalProgress: (progress: GlobalProgress) => void;
    allCompleted: (result: UploadResult[]) => void;
}

interface listOptions {
    limit?: number;
    skip?: number;
    sortDsc?: boolean;
    sortBy?: string;
}
/**Expected Response from list */
interface listResponse {
    data: {
        docs: FileDoc[];
        totalDocs: number;
        limit: number;
        offest: number;
        totalPages: number;
        page: number;
        pagingCounter: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        prevPage: number;
        nextPage: number;
    };
}
interface existsResponse {
    data: {
        exists: boolean;
    };
}
/**Expected Response from awaitUpload */
interface awaitUploadResponse {
    data: FileDoc;
}
/**deleteOne Options */
interface deleteOneOptions {
    cid?: string;
    docID?: string;
}
/**Expected Response from deleteOne */
interface deleteResponse {
    data: {
        deleted?: boolean;
        docID?: FileDoc;
        modified?: FileDoc;
        deletedItems?: string[];
        filesDeleted?: number;
        storageSaved?: number;
        duplicatesDeleted?: number;
    };
}
/**Tus-metadata options */
interface uploadOptions {
    resize?: string[];
    replaceId?: string;
    resizeOptions?: SharpResizeOptions;
    name?: string;
}
/**Sharp Resize Options */
interface SharpResizeOptions {
    /** How the image should be resized to fit both provided dimensions, one of cover, contain, fill, inside or outside. (optional, default 'cover') */
    fit?: keyof FitEnum | undefined;
    /** Position, gravity or strategy to use when fit is cover or contain. (optional, default 'centre') */
    position?: number | string | undefined;
    /** Background colour when using a fit of contain, parsed by the color module, defaults to black without transparency. (optional, default {r:0,g:0,b:0,alpha:1}) */
    background?: Color | undefined;
    /** The kernel to use for image reduction. (optional, default 'lanczos3') */
    kernel?: keyof KernelEnum | undefined;
    /** Do not enlarge if the width or height are already less than the specified dimensions, equivalent to GraphicsMagick's > geometry option. (optional, default false) */
    withoutEnlargement?: boolean | undefined;
    /** Do not reduce if the width or height are already greater than the specified dimensions, equivalent to GraphicsMagick's < geometry option. (optional, default false) */
    withoutReduction?: boolean | undefined;
    /** Take greater advantage of the JPEG and WebP shrink-on-load feature, which can lead to a slight moiré pattern on some images. (optional, default true) */
    fastShrinkOnLoad?: boolean | undefined;
}
interface FitEnum {
    contain: 'contain';
    cover: 'cover';
    fill: 'fill';
    inside: 'inside';
    outside: 'outside';
}
interface KernelEnum {
    nearest: 'nearest';
    cubic: 'cubic';
    mitchell: 'mitchell';
    lanczos2: 'lanczos2';
    lanczos3: 'lanczos3';
}
interface RGBA {
    r?: number | undefined;
    g?: number | undefined;
    b?: number | undefined;
    alpha?: number | undefined;
}

/**
 * Encapsulates the logic for issuing a request to the our API.
 *
 * A custom HTTP client should should implement:
 * 1. A response class which extends HttpClientResponse and wraps around their
 *    own internal representation of a response.
 * 2. A client class which extends HttpClient and implements all methods,
 *    returning their own response class when making requests.
 */
declare class HttpClient implements HttpClientInterface {
    static CONNECTION_CLOSED_ERROR_CODES: string[];
    static TIMEOUT_ERROR_CODE: string;
    /** The client name used for diagnostics. */
    getClientName(): string;
    makeRequest(host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: RequestData, protocol: string, timeout: number): Promise<HttpClientResponseInterface>;
    /** Helper to make a consistent timeout error across implementations. */
    static makeTimeoutError(): TimeoutError;
}
declare class HttpClientResponse implements HttpClientResponseInterface {
    _statusCode: number;
    _headers: ResponseHeaders;
    constructor(statusCode: number, headers: ResponseHeaders);
    getStatusCode(): number;
    getHeaders(): ResponseHeaders;
    getRawResponse(): unknown;
    toStream(streamCompleteCallback: () => void): unknown;
    toJSON(): any;
}

declare class FetchHttpClient extends HttpClient implements HttpClientInterface {
    private _fetch;
    _Headers: RequestHeaders;
    readonly _config?: ConfigOptions;
    readonly _requestOpts?: RequestOptions;
    readonly _isLegacyBrowser: boolean;
    constructor(config?: ConfigOptions);
    /** update the acessToken */
    setToken(token: string): void;
    /** Extends the currents of the FetchHttpClient
     *
     * @param headers
     */
    extendHeaders(headers: RequestHeaders): void;
    /**override */
    getClientName(): string;
    /** Use either our dev enviroment or production to make requests
     *
     * @param path
     * @param method
     * @param body
     * @returns
     */
    makeRequestwithDefault(path: string, method: string, body?: RequestData | undefined): Promise<HttpClientResponseInterface>;
    /** Make a request
     *
     * @param host
     * @param port
     * @param path
     * @param method
     * @param headers
     * @param requestData
     * @param protocol
     * @param timeout
     * @returns
     */
    makeRequest(host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: RequestData | undefined, protocol: string, timeout: number): Promise<HttpClientResponseInterface>;
}
declare class FetchHttpClientResponse extends HttpClientResponse implements HttpClientResponseInterface {
    _res: Response;
    constructor(res: Response);
    getRawResponse(): Response;
    toStream(streamCompleteCallback: () => void): ReadableStream<Uint8Array> | null;
    toJSON(): Promise<any>;
    static _transformHeadersToObject(headers: Headers): ResponseHeaders;
}

/** Base class for all controllers */

declare class BaseApi {
    /**create a request builder */
    createHttpRequest: FetchHttpClient;
    constructor(client: FetchHttpClient);
}

/**
 *
 */
declare class UsersApi extends BaseApi {
    private readonly _path;
    /** checks the validity of the acessToken
     *
     * @returns void
     */
    readonly validateToken: () => Promise<validatedTokenResponse>;
    /** create a new Fileroom User
     *
     * @param data - {createUserOptions}
     * @returns createUserResponse - {data: string | { id: string,token: string}}
     */
    create(data: createUserOptions): Promise<createUserResponse>;
    /** update a Fileroom User
     *
     * @param data
     * @returns
     */
    update(data: updateUserOptions): Promise<updateUserResponse>;
    /** login dev user with their username and password
     * @param data -  username & password Or a dartroomToken
     * @returns loginResponse - {data:string} - the accessToken
     */
    login(data: loginOptions): Promise<loginResponse>;
}

/**
 *  IPFS  endpoint for the Fileroom API
 */
declare class IpfsApi extends BaseApi {
    returnedHeaders: Record<string, string>;
    /**check pinning status of the given cid
     * @param {cid} cid
     * @returns {statusResponse} statusResponse
     */
    status(cid: string): Promise<statusResponse>;
    /**
     *  get a file from the gateway
     * @param cid - cid of the file to fetch
     * @param {getOptions} options
     * @returns {{StreamResponse}} StreamResponse
     * */
    get(cid: string, options?: getOptions): Promise<StreamResponse>;
    /** import a file by cid, create previews and pin it to our ipfs cluster
     * @param cid
     * @param  options - {resize: string[]} - array of sizes to create previews for given file(image or video)
     */
    pin(cid: string, options?: pinOptions): Promise<pinResponse>;
}

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
declare class UploadApi extends EventEmitter<UploadListners> {
    _path: string;
    _url: string;
    _uploadOptions: Record<string, string>;
    _results: Array<UploadResult>;
    _headers: RequestHeaders;
    _tus: Upload | null;
    _rawUrl: string;
    _socket: WebSocket | null;
    _progressMap: Map<string, any>;
    _isSecure: boolean;
    _fileID: string;
    _uploadCount: number;
    uploads: Record<string, string>;
    protected createHttpRequest: FetchHttpClient;
    protected fileApi: FilesApi;
    uploadMultiple: boolean;
    messsageCount: number;
    finished: boolean;
    connections: Array<WebSocket>;
    constructor(client: FetchHttpClient, options?: uploadOptions, multiple?: boolean);
    start(file: UploadFile, options?: uploadOptions): Promise<UploadApi>;
    /**
     * set the file metadata to be uploaded (size and type)
     * @returns boolean - true if the file metadata is set
     */
    setfileMeta(file: UploadFile): Promise<string>;
    /**
     * Method to handle the websocket messages
     * emits progress, globalProgress, completed, allCompleted
     * @param event
     * @param fileID
     */
    handleWsMessage(event: socketEvent, fileID: string): Promise<void>;
    closeConnections(): Promise<void>;
}

/**
 * Files  endpoint of  Fileroom API for:
 * - listing files
 * - awaiting for uploaded files
 * - And  deleting  them
 * @example
 *
 */
declare class FilesApi extends BaseApi {
    upload: UploadApi | null;
    /**
     *  list  a user files
     * @param {listOptions} options
     * @returns {listOptions} listResponse
     */
    list(options?: listOptions): Promise<listResponse>;
    /** Wait for an uploaded or imported file and return its updated record
     *@param {string} id - tracking id of the file
     * @returns {awaitUploadResponse} awaitUploadResponse
     */
    awaitUpload(id: string): Promise<awaitUploadResponse>;
    /**
     * Delete a file and its previews
     * @param  {deleteOneOptions} opts
     * @returns {deleteResponse} deleteResponse
     *
     */
    deleteOne(opts: deleteOneOptions): Promise<deleteResponse>;
    /**
     *  Delete a list of  files and their previews
     * @param cids - list of cids to delete
     * @returns {deleteResponse} - {{data:Record<string,any>}}
     */
    deleteMany(cids: string[]): Promise<deleteResponse>;
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
    uploadFiles(files: UploadFile | Array<UploadFile>, options?: uploadOptions | Array<uploadOptions>): Promise<UploadApi | undefined>;
    /**
     *  Check if a file exists
     * @param search - cid or an integrityhash or OjHash
     * @returns
     */
    exists(search: string): Promise<existsResponse>;
}

/**
 * The main client class
 *params: config - default {env:'production'}
 * @example ```js
 * const client = new Client({accessToken: 'your token',env:'test' | 'production' | 'beta'});
  // import the ipfs and user api
  let {ipfs,user} = client;

  let result = await user.login({username:'username',password:'password'})


  ```
 **/
declare class Client {
    readonly _config: ConfigOptions;
    readonly __HttpClient: FetchHttpClient;
    readonly user: UsersApi;
    readonly ipfs: IpfsApi;
    readonly files: FilesApi;
    /**
     *
     * @param config  - {accessToken:string,env:'test' | 'production' | 'beta',timeout?:number}
     */
    constructor(config: ConfigOptions);
    /**if an acessToken is passed,check it's validity */
    protected checkAuth(): Promise<validatedTokenResponse | undefined>;
}

export { Client, Color, ConfigOptions, EventName, EventProgress, FetchHttpClient, FetchHttpClientResponse, FileDoc, FileroomError, GlobalProgress, HttpClientInterface, HttpClientResponseInterface, LegacybrowserRawResponse, ProgressEvent, ProgressMap, RGBA, RequestData, RequestHeaders, RequestOptions, ResponseHeaderValue, ResponseHeaders, SocketData, StreamResponse, TimeoutError, UploadApi, UploadDeleteResponse, UploadEvents, UploadFile, UploadListners, UploadResult, UserDoc, awaitUploadResponse, createUserOptions, createUserResponse, deleteOneOptions, deleteResponse, existsResponse, getOptions, listOptions, listResponse, loginOptions, loginResponse, pinOptions, pinResponse, socketEvent, statusResponse, updateUserOptions, updateUserResponse, uploadOptions, validatedTokenResponse };
