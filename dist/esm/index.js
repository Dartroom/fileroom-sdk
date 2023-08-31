import fetch from 'cross-fetch';
import { isBrowser } from 'browser-or-node';
import WebSocket from 'isomorphic-ws';
import { EventEmitter } from 'ee-ts';
import { Upload } from 'tus-js-client';
import mime from 'mime-types';
import { Stream } from 'stream';
import crypo from 'crypto';

// src/net/fetchHttpClient.ts

// src/net/defaultRequestOptions.ts
var TestOpts = {
  host: "localhost",
  port: 3001,
  protocol: "http",
  path: "/",
  timeout: 6e4
};
var ProdOpts = {
  host: "beta-ams-1.fileroom.app",
  path: "/",
  protocol: "https",
  timeout: 12e4
};
var BetaOpts = {
  host: "beta.fileroom.app",
  path: "/",
  protocol: "https",
  timeout: 12e4
};

// src/functions/propagateErrors.ts
function propagateErrors(json) {
  if (json && json.errors) {
    let error = json.errors[0];
    let status = error.status || 404;
    let message = error.message;
    throw new Error("API_ERROR: " + status + " reason: " + message);
  }
}

// src/functions/genUUID.ts
var generateUUID = (a = "") => a ? (
  /* eslint-disable no-bitwise */
  ((Number(a) ^ Math.random() * 16) >> Number(a) / 4).toString(16)
) : `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, generateUUID);

// src/functions/tusUtils.ts
function incrementGlobalProgress(target) {
  let values = Object.values(target).filter(
    (v) => v && v.hasOwnProperty("progress")
  );
  let total = values.length * 100;
  let overall = values.reduce((a, b) => a + Number(b.progress), 0) / total * 100;
  overall = Number.isNaN(overall) ? 0 : Number(overall.toFixed(2));
  target.overallProgress = overall;
}
var proxyHandler = {
  set(target, prop, value) {
    const hasProgress = typeof value === "object" && Reflect.has(value, "progress");
    const hasPercent = hasProgress && typeof value.progress === "object" && Reflect.has(value["progress"], "percent");
    try {
      if (target[prop] && !target[prop]["jobs"]) {
        target[prop].used = true;
        target[prop].jobs = /* @__PURE__ */ new Map();
      }
      if (hasProgress) {
        if (hasPercent) {
          target[prop].used = true;
          target[prop].jobs.set(value.progress.job, value.progress.percent);
          let jobs = target[prop].jobs;
          let expectedStage = target[prop].expectedStage;
          target[prop].progress = [...jobs.values()].reduce((a, b) => a + Number(b), 0) / (expectedStage * 100) * 100;
          let result = value.result || value.progress?.result;
          if (result) {
            target[prop].result = result;
          }
          incrementGlobalProgress(target);
          return true;
        }
        let v = target[prop];
        target[prop] = { ...v, ...value };
        target[prop].used = true;
        incrementGlobalProgress(target);
        return true;
      } else {
        let v = target[prop];
        let val = value.progress || value;
        target[prop] = { ...v, ...val };
        target[prop].used = true;
        target[prop].progress = 100;
        incrementGlobalProgress(target);
        return true;
      }
    } catch (error) {
      return true;
    }
  }
};

// src/functions/createObjectTemplate.ts
function createObjTemplate(sizes, fileType, duplicate = false) {
  if (fileType === "video") {
    let obj = {
      "Tus Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "InterFs Upload": {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "InterFs Download": {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Ipfs Upload": {
        progress: 0,
        used: false,
        expectedStage: sizes,
        jobs: /* @__PURE__ */ new Map()
      },
      "Original Processed": {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Preview Completed": {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Video Transcode": {
        progress: 0,
        used: false,
        expectedStage: sizes,
        jobs: /* @__PURE__ */ new Map()
      },
      "CDN Upload": {
        progress: 0,
        used: false,
        expectedStage: sizes,
        jobs: /* @__PURE__ */ new Map()
      }
    };
    return duplicate ? {
      "Tus Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Original Processed": {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      }
    } : sizes === 0 ? {
      "Tus Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "InterFs Upload": {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "InterFs Download": {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Original Processed": {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      }
    } : obj;
  }
  if (fileType === "image" || fileType === "animation") {
    let obj = {
      "Tus Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Ipfs Upload": {
        progress: 0,
        used: false,
        expectedStage: 2,
        jobs: /* @__PURE__ */ new Map()
      },
      "CDN Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Preview Completed": {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      }
    };
    return sizes === 0 ? {
      "Tus Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Ipfs Upload": {
        progress: 0,
        used: false,
        expectedStage: sizes + 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Preview Completed": {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      }
    } : obj;
  }
  if (fileType === "any") {
    let obj = {
      "Tus Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Ipfs Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "CDN Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Preview Completed": {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      }
    };
    return duplicate ? {
      "Tus Upload": {
        progress: 0,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      },
      "Preview Completed": {
        progress: 100,
        used: false,
        expectedStage: 1,
        jobs: /* @__PURE__ */ new Map()
      }
    } : obj;
  }
  return {};
}

// src/functions/classifyFile.ts
function classifyFile(file) {
  return new Promise((resolve, reject) => {
    let fileFormat = file.mimetype.split("/")[1];
    let supportedAudio = /(mpeg)|(mp3)|(mp4)|(ogg)|(wav)|(webm)|(flac)|(aac)|(weba)|(amr)|(opus)|(m4a)|(oga)/g;
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp" || file.mimetype === "image/avif" || file.mimetype === "image/tiff") {
      resolve("image" /* IMAGE */);
    } else if (file.mimetype === "image/gif" || file.mimetype === "image/webp") {
      resolve("animation" /* ANIMATION */);
    } else if (file.mimetype === "video/mp4") {
      resolve("video" /* VIDEO */);
    } else if (file.mimetype.includes("audio") && supportedAudio.test(fileFormat) || file.mimetype.includes("application/") && ["pdf", "json"].includes(fileFormat) || file.mimetype === "image/svg+xml") {
      resolve("any" /* ANY */);
    } else {
      reject("unsupported" /* UNSUPPORTED */);
    }
  });
}
async function connectWS(url) {
  return new Promise(function(resolve, reject) {
    var server = new WebSocket(url);
    server.onopen = () => {
      resolve(server);
    };
    const interval = setInterval(() => {
      if (server.readyState !== 1) {
        return;
      }
      server.send("ping");
    }, 3e3);
    server.onerror = (err) => {
      clearInterval(interval);
      reject(err);
    };
    server.onclose = () => {
      clearInterval(interval);
    };
  });
}

// src/functions/timeout.ts
var TimeoutTracker = {
  timeout: null
};
var Timeout = (num) => new Promise((resolve, reject) => {
  TimeoutTracker.timeout = setTimeout(() => {
    TimeoutTracker.timeout = null;
    reject(new Error("Request timed out"));
  }, num);
});

// src/functions/sleep.ts
function sleep(ms) {
  if (ms < 0)
    throw new Error("ms must be a positive number");
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/net/httpClient.ts
var HttpClient = class {
  /** The client name used for diagnostics. */
  getClientName() {
    throw new Error("getClientName not implemented.");
  }
  makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    throw new Error("makeRequest not implemented.");
  }
  /** Helper to make a consistent timeout error across implementations. */
  static makeTimeoutError() {
    const timeoutErr = new TypeError(
      HttpClient.TIMEOUT_ERROR_CODE
    );
    timeoutErr.code = HttpClient.TIMEOUT_ERROR_CODE;
    return timeoutErr;
  }
};
HttpClient.CONNECTION_CLOSED_ERROR_CODES = ["ECONNRESET", "EPIPE"];
HttpClient.TIMEOUT_ERROR_CODE = "ETIMEDOUT";
var HttpClientResponse = class {
  constructor(statusCode, headers) {
    this._statusCode = statusCode;
    this._headers = headers;
  }
  getStatusCode() {
    return this._statusCode;
  }
  getHeaders() {
    return this._headers;
  }
  getRawResponse() {
    throw new Error("getRawResponse not implemented.");
  }
  toStream(streamCompleteCallback) {
    throw new Error("toStream not implemented.");
  }
  toJSON() {
    throw new Error("toJSON not implemented.");
  }
};

// src/net/fetchHttpClient.ts
var FetchHttpClient = class extends HttpClient {
  constructor(config) {
    super();
    this._Headers = {};
    this._isLegacyBrowser = false;
    this._fetch = isBrowser ? window.fetch || fetch : fetch;
    this._isLegacyBrowser = isBrowser && !window.fetch;
    if (config) {
      let headers = {
        Authorization: `${config.accessToken && config.accessToken.length > 0 ? "Bearer " + config.accessToken : ""}`
      };
      this._config = config;
      this._Headers = headers;
      switch (config.env) {
        case "test":
          this._requestOpts = TestOpts;
          break;
        case "beta":
          this._requestOpts = BetaOpts;
        default:
          this._requestOpts = ProdOpts;
      }
    }
  }
  /** update the acessToken */
  setToken(token) {
    if (this._config) {
      this._config.accessToken = token;
      this._Headers = {
        ...this._Headers,
        Authorization: `Bearer ${token}`
      };
    }
  }
  /** Extends the currents of the FetchHttpClient
   *
   * @param headers
   */
  extendHeaders(headers) {
    this._Headers = { ...this._Headers, ...headers };
  }
  /**override */
  getClientName() {
    return "fetch";
  }
  /** Use either our dev enviroment or production to make requests
   *
   * @param path
   * @param method
   * @param body
   * @returns
   */
  makeRequestwithDefault(path, method, body) {
    if (!this._requestOpts) {
      throw new Error("Config is required");
    }
    let { host, port, protocol, timeout } = this._requestOpts;
    port = port ? port.toString() : "";
    return this.makeRequest(
      host,
      port,
      path,
      method,
      this._Headers,
      body,
      protocol,
      timeout
    );
  }
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
  makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    const Secure = protocol === "https";
    const url = new URL(path, `${Secure ? "https" : "http"}://${host}:${port}`);
    url.port = port;
    const fetchFn = this._fetch;
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    const body = requestData || (methodHasPayload ? "" : void 0);
    let options = {
      method,
      headers
    };
    if (body) {
      options.body = new URLSearchParams(body);
    }
    const fetchPromise = fetchFn(url.toString(), options);
    return Promise.race([fetchPromise, Timeout(timeout)]).then((res) => {
      return new FetchHttpClientResponse(res);
    }).finally(() => {
      if (TimeoutTracker.timeout) {
        clearTimeout(TimeoutTracker.timeout);
      }
    });
  }
};
var FetchHttpClientResponse = class extends HttpClientResponse {
  constructor(res) {
    super(
      res.status,
      FetchHttpClientResponse._transformHeadersToObject(res.headers)
    );
    this._res = res;
  }
  getRawResponse() {
    return this._res;
  }
  toStream(streamCompleteCallback) {
    streamCompleteCallback();
    return this._res.body;
  }
  toJSON() {
    return this._res.json();
  }
  static _transformHeadersToObject(headers) {
    const headersObj = {};
    for (const entry of headers) {
      if (!Array.isArray(entry) || entry.length != 2) {
        throw new Error(
          "Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object."
        );
      }
      headersObj[entry[0]] = entry[1];
    }
    return headersObj;
  }
};

// src/api/baseApi.ts
var BaseApi = class {
  constructor(client) {
    this.createHttpRequest = client;
  }
};

// src/api/users/index.ts
var UsersApi = class extends BaseApi {
  constructor() {
    super(...arguments);
    this._path = "/user";
    /** checks the validity of the acessToken
     *
     * @returns void
     */
    this.validateToken = async () => {
      const response = await this.createHttpRequest.makeRequestwithDefault(
        this._path + "/validateToken",
        "POST"
      );
      let json = await response.toJSON();
      propagateErrors(json);
      return json;
    };
  }
  /** create a new Fileroom User
   *
   * @param data - {createUserOptions}
   * @returns createUserResponse - {data: string | { id: string,token: string}}
   */
  async create(data) {
    if (!data || data && !Object.keys(data).length)
      throw new TypeError(
        "username, email and password are required or a userId for dartroomUsers"
      );
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + "/create",
      "POST",
      data
    );
    let json = await response.toJSON();
    propagateErrors(json);
    return json;
  }
  /** update a Fileroom User
   *
   * @param data
   * @returns
   */
  async update(data) {
    let allowedFields = [
      "addIP",
      "removeIP",
      "addDomain",
      "removeDomain",
      "restrictIPs",
      "restrictDomains",
      "showAll",
      "addApiKey",
      "removeApiKey"
    ];
    if (!data || data && !Object.keys(data).length)
      throw new TypeError(
        "at least one of the following fields is required: addIP,removeIP,addDomain,removeDomain,restrictIPs,restrictDomains,showAll"
      );
    if (!Object.keys(data).every((k) => allowedFields.includes(k))) {
      throw new TypeError(
        "at least one of the following fields is required: addIP,removeIP,addDomain,removeDomain,restrictIPs,restrictDomains,showAll"
      );
    }
    let payload = { ...data };
    if (data.addApiKey) {
      payload.addApiKey = JSON.stringify(data.addApiKey);
    }
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + "/update",
      "POST",
      payload
    );
    let json = await response.toJSON();
    propagateErrors(json);
    return json;
  }
  /** login dev user with their username and password
   * @param data -  username & password Or a dartroomToken
   * @returns loginResponse - {data:string} - the accessToken
   */
  async login(data) {
    if (!data || data && !Object.keys(data).length)
      throw new TypeError(
        "username and password  or dartroomToken is required are  required"
      );
    if (data.dartroomToken && data.dartroomToken.length > 0) {
      this.createHttpRequest.extendHeaders({
        Authorization: `refresh ${data.dartroomToken}`
      });
    }
    const response = await this.createHttpRequest.makeRequestwithDefault(
      this._path + "/login",
      "POST",
      data
    );
    let json = await response.toJSON();
    propagateErrors(json);
    if (json.data) {
      this.createHttpRequest.setToken(json.data);
    }
    return json;
  }
};
var IpfsApi = class extends BaseApi {
  constructor() {
    super(...arguments);
    this.returnedHeaders = {};
  }
  /**check pinning status of the given cid
   * @param {cid} cid
   * @returns {statusResponse} statusResponse
   */
  async status(cid) {
    const response = await this.createHttpRequest.makeRequestwithDefault(
      "/ipfs/status?cid=" + cid,
      "GET"
    );
    let json = await response.toJSON();
    return json;
  }
  /**
   *  get a file from the gateway
   * @param cid - cid of the file to fetch
   * @param {getOptions} options
   * @returns {{StreamResponse}} StreamResponse
   * */
  async get(cid, options) {
    if (!cid || cid && cid.length < 5)
      throw new TypeError("cid is required");
    let url = "/ipfs/" + cid;
    if (options && options.origin) {
      this.createHttpRequest.extendHeaders({ Origin: options.origin });
    }
    if (options && options.size) {
      url = url + "?size=" + options.size;
    }
    const response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      "GET"
    );
    let headers = response.getHeaders();
    this.returnedHeaders = headers;
    let contentType = headers["content-type"];
    let stream = null;
    if (contentType.includes("application/json")) {
      let json = await response.toJSON();
      propagateErrors(json);
    }
    if (this.createHttpRequest._isLegacyBrowser) {
      let raw = await response.getRawResponse();
      console.log(raw);
      stream = raw._bodyInit.stream();
      return stream;
    } else {
      stream = isBrowser ? response.toStream(() => {
      }) : response.toStream(() => {
      });
      return stream;
    }
  }
  /** import a file by cid, create previews and pin it to our ipfs cluster
   * @param cid
   * @param  options - {resize: string[]} - array of sizes to create previews for given file(image or video)
   */
  async pin(cid, options) {
    if (!cid || cid && cid.length < 5)
      throw new TypeError("cid is required");
    let url = "/ipfs/pin/" + cid;
    if (options && options.resize) {
      let resizeParams = new URLSearchParams();
      for (let size of options.resize)
        resizeParams.append("resize", size);
      url = url + "?" + resizeParams.toString();
    }
    const response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      "POST"
    );
    let json = await response.toJSON();
    propagateErrors(json);
    return json;
  }
};
var UploadApi = class extends EventEmitter {
  constructor(client, options, multiple = false) {
    super();
    this._path = "/upload";
    this._url = "";
    this._uploadOptions = {};
    this._results = [];
    this._tus = null;
    this._rawUrl = "";
    this._socket = null;
    this._progressMap = /* @__PURE__ */ new Map();
    this._isSecure = false;
    // if the protocol is https
    this._fileID = "";
    this._uploadCount = 0;
    this.uploads = {};
    this.uploadMultiple = false;
    this.messsageCount = 0;
    this.finished = false;
    this.connections = [];
    let reqOpts = client._requestOpts;
    let { host, port, protocol, timeout } = reqOpts;
    client._config;
    this.createHttpRequest = client;
    this.fileApi = new FilesApi(client);
    this.uploadMultiple = multiple;
    const Secure = protocol === "https";
    this._isSecure = Secure;
    this._rawUrl = `${Secure ? "https" : "http"}://${host}${port ? ":" + port : ""}`;
    const url = new URL(this._path, this._rawUrl);
    url.port = port;
    this._url = url.toString();
    this.createHttpRequest.extendHeaders({
      "X-Forwarded-Proto": Secure ? "https" : "http"
    });
    this._headers = this.createHttpRequest._Headers;
    if (options) {
      for (let [key, value] of Object.entries(options)) {
        this._uploadOptions[key] = JSON.stringify(value);
      }
    }
  }
  async start(file, options) {
    if (options) {
      for (let [key, value] of Object.entries(options)) {
        this._uploadOptions[key] = JSON.stringify(value);
      }
    }
    let sha = await this.setfileMeta(file);
    let fileID = generateUUID();
    this._url = this._rawUrl + this._path + "?fileID=" + fileID;
    let mime2 = this._uploadOptions["filetype"] || "";
    let sizes = this._uploadOptions["resize"] ? JSON.parse(this._uploadOptions["resize"]) : [];
    let checksum = this._uploadOptions["checksum"] || sha;
    let fileExists = await this.fileApi.exists(checksum);
    let exists = fileExists.data.exists;
    let fileType = await classifyFile({ mimetype: mime2 });
    let obj = createObjTemplate(sizes.length, fileType, exists);
    let p = new Proxy(obj, proxyHandler);
    this._progressMap.set(fileID, p);
    if (this._uploadOptions.hasOwnProperty("name")) {
      this.uploads[fileID] = this._uploadOptions["name"];
    }
    let wsUrl = this._rawUrl.replace("http", "ws") + "/file-events/" + fileID;
    this._socket = await connectWS(wsUrl);
    this.connections.push(this._socket);
    this._socket.onmessage = async (event) => {
      let data = event.data;
      this.messsageCount++;
      if (data && data !== "pong") {
        data = JSON.parse(data);
        await this.handleWsMessage(data, fileID);
      }
    };
    let upload = new Upload(file, {
      endpoint: this._url,
      metadata: this._uploadOptions,
      headers: this._headers,
      retryDelays: [0, 3e3, 5e3, 1e4, 2e4],
      removeFingerprintOnSuccess: true,
      chunkSize: 1 * 1024 * 1024,
      onError: (error) => {
        this.emit("error", error);
        throw Error;
      },
      onProgress: async (bytesUploaded, bytesTotal) => {
        var percentage = bytesUploaded / bytesTotal * 100;
        let payload = {
          event: "progress",
          data: {
            progress: {
              percent: Math.round(percentage),
              job: "original"
            },
            status: "Tus Upload"
          }
        };
        await this.handleWsMessage(payload, fileID);
      },
      onSuccess: () => {
      }
    });
    upload.start();
    this._tus = upload;
    return this;
  }
  /**
   * set the file metadata to be uploaded (size and type)
   * @returns boolean - true if the file metadata is set
   */
  async setfileMeta(file) {
    let sha = "";
    if (isBrowser && (typeof File !== "undefined" && file instanceof File || typeof Blob !== "undefined" && file instanceof Blob)) {
      this._uploadOptions["filetype"] = file.type;
      this._uploadOptions["name"] = file.name;
      this._uploadOptions["size"] = file.size.toString();
      let hash = crypo.createHash("sha256");
      let stream = await file.stream();
      let reader = stream.getReader();
      while (true) {
        let { done, value } = await reader.read();
        if (done)
          break;
        if (value)
          hash.update(value);
      }
      file = reader;
      let checksum = hash.digest("base64");
      this._uploadOptions["checksum"] = checksum;
      sha = checksum;
    }
    if (file instanceof Stream) {
      if (file.hasOwnProperty("path") && file.path) {
        this._uploadOptions["name"] = file.path;
        let mimeType = mime.lookup(file.path);
        if (!mimeType)
          throw new Error("File type not supported");
        this._uploadOptions["filetype"] = mimeType;
      }
      let size = 0;
      let hash = crypo.createHash("sha256");
      for await (const chunk of file) {
        size += chunk.length;
        hash.update(chunk);
      }
      let checksum = hash.digest("base64");
      this._uploadOptions["checksum"] = checksum;
      this._uploadOptions["size"] = size.toString();
      sha = checksum;
    }
    return sha;
  }
  /**
   * Method to handle the websocket messages
   * emits progress, globalProgress, completed, allCompleted
   * @param event
   * @param fileID
   */
  async handleWsMessage(event, fileID) {
    let { data } = event;
    if (data) {
      let status = data.status;
      this._progressMap.get(fileID)[status] = data;
      let result = data.result || data.progress?.result;
      if (!this.uploadMultiple)
        this.emit("progress", this._progressMap.get(fileID));
      let Globallisteners = [
        ...this.listeners("globalProgress"),
        ...this.listeners("allCompleted")
      ];
      if (!this.uploadMultiple && Globallisteners.length) {
        throw new Error(
          "globalProgress and allCompleted listeners are required for multiple uploads, listen to the completed and progress events instead"
        );
      }
      let Singlelisteners = [
        ...this.listeners("progress"),
        ...this.listeners("completed")
      ];
      if (this.uploadMultiple) {
        if (Singlelisteners.length) {
          throw new Error(
            "progress and completed listeners are required for single uploads, listen to the globalProgress and allCompleted events instead"
          );
        }
      }
      let totalProgress = 0;
      let expectedSize = [...this._progressMap.keys()].filter(
        (event2) => event2 !== "totalProgress"
      ).length;
      let obj = {};
      for (let [key, value] of this._progressMap) {
        let progress = value;
        let newKey = this.uploads[key] || key;
        if (newKey)
          obj[newKey] = value;
        let { overallProgress } = progress;
        if (overallProgress)
          totalProgress += overallProgress;
      }
      let percent = totalProgress / (expectedSize * 100) * 100;
      this._progressMap.set("totalProgress", Number(percent.toFixed(2)));
      obj.totalProgress = Number(percent.toFixed(2));
      this.emit("globalProgress", obj);
      let completed = result && result.hasOwnProperty("file") ? result.file : result;
      if (result && completed.expectedPreviewCount === completed.currentPreviewCount) {
        if (this.uploadMultiple) {
          this._results.push(result);
          this._uploadCount++;
          if (this._uploadCount === this._progressMap.size - 1) {
            this.finished = true;
            this.emit("allCompleted", this._results);
            if (this.finished)
              await this.closeConnections();
          }
        }
        this.emit("completed", result);
        this.finished = true;
        if (!this.uploadMultiple && this.finished)
          await this.closeConnections();
      }
    }
  }
  async closeConnections() {
    this.connections.forEach((cons) => {
      cons.close();
    });
  }
};

// src/api/files/index.ts
var FilesApi = class extends BaseApi {
  constructor() {
    super(...arguments);
    this.upload = null;
  }
  /**
   *  list  a user files
   * @param {listOptions} options
   * @returns {listOptions} listResponse
   */
  async list(options) {
    let url = "/files/list";
    if (options) {
      let listParams = new URLSearchParams();
      for (let [key, value] of Object.entries(options)) {
        listParams.append(key, value);
      }
      url = url + "?" + listParams.toString();
    }
    const response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      "GET"
    );
    let json = await response.toJSON();
    propagateErrors(json);
    return json;
  }
  /** Wait for an uploaded or imported file and return its updated record
   *@param {string} id - tracking id of the file
   * @returns {awaitUploadResponse} awaitUploadResponse
   */
  async awaitUpload(id) {
    let url = "/await/upload/" + id;
    const response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      "GET"
    );
    let json = await response.toJSON();
    propagateErrors(json);
    return json;
  }
  /**
   * Delete a file and its previews
   * @param  {deleteOneOptions} opts
   * @returns {deleteResponse} deleteResponse
   *
   */
  async deleteOne(opts) {
    if (!opts || opts && !Object.keys(opts).length && (opts.cid || opts.docID))
      throw new TypeError("   cid or docID is required");
    if (opts.cid && opts.docID)
      throw new TypeError(" cid or docID is required,not both");
    let response = await this.createHttpRequest.makeRequestwithDefault(
      "delete/one",
      "POST",
      opts
    );
    let json = await response.toJSON();
    propagateErrors(json);
    return json;
  }
  /**
   *  Delete a list of  files and their previews
   * @param cids - list of cids to delete
   * @returns {deleteResponse} - {{data:Record<string,any>}}
   */
  async deleteMany(cids) {
    let url = "/delete/many";
    if (!cids || !cids.length)
      throw new TypeError("cids is required");
    let cidParams = new URLSearchParams();
    for (let cid of cids) {
      cidParams.append("cid", cid);
    }
    url = url + "?" + cidParams.toString();
    let response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      "POST"
    );
    let json = await response.toJSON();
    propagateErrors(json);
    return json;
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
  async uploadFiles(files, options) {
    if (!arguments.length)
      throw new TypeError("file(s) is required");
    let multipleFiles = Array.isArray(files);
    let globalOpts = Array.isArray(options) ? void 0 : options;
    this.upload = new UploadApi(
      this.createHttpRequest,
      globalOpts,
      multipleFiles
    );
    try {
      if (!Array.isArray(files)) {
        this.upload = await this.upload.start(files, globalOpts);
        return this.upload;
      }
      for (let [index, file] of Object.entries(files)) {
        let opts = Array.isArray(options) ? options[Number(index)] : void 0;
        this.upload = await this.upload.start(file, opts);
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
  async exists(search) {
    let url = "/files/exists";
    if (!search)
      throw new TypeError("cid or an integrityhash or OjHash is required");
    let searchParams = new URLSearchParams();
    searchParams.append("search", search);
    url = url + "?" + searchParams.toString();
    let response = await this.createHttpRequest.makeRequestwithDefault(
      url,
      "GET"
    );
    let json = await response.toJSON();
    propagateErrors(json);
    return json;
  }
};

// src/client.ts
var Client = class {
  /**
   *
   * @param config  - {accessToken:string,env:'test' | 'production' | 'beta',timeout?:number}
   */
  constructor(config) {
    if (!config) {
      throw new TypeError("Config is required");
    }
    this._config = config;
    this.__HttpClient = new FetchHttpClient(config);
    this.user = new UsersApi(this.__HttpClient);
    this.ipfs = new IpfsApi(this.__HttpClient);
    this.files = new FilesApi(this.__HttpClient);
    this.checkAuth();
  }
  /**if an acessToken is passed,check it's validity */
  async checkAuth() {
    if (this._config.accessToken && this._config.accessToken.length > 0) {
      return this.user.validateToken().then((res) => res);
    }
    return;
  }
};

export { Client, FetchHttpClient, FetchHttpClientResponse, UploadApi };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map