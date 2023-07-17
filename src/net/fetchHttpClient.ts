// source:github.com/strip/stripe-node;
import fetch from 'cross-fetch';
import { TestOpts, ProdOpts } from './defaultRequestOptions';
import { isBrowser } from 'browser-or-node';
import {
  RequestData,
  RequestHeaders,
  ResponseHeaders,
  TimeoutError,
} from '../types';
import {
  HttpClientInterface,
  HttpClientResponseInterface,
  ConfigOptions,
  RequestOptions,
} from '../interfaces';
import { HttpClient, HttpClientResponse } from './httpClient';

export class FetchHttpClient extends HttpClient implements HttpClientInterface {
  private _fetch: typeof fetch;
  private _Headers: RequestHeaders = {};
  readonly _config?: ConfigOptions;
  readonly _requestOpts?: RequestOptions;
  public readonly _isLegacyBrowser: boolean = false;

  constructor(config?: ConfigOptions) {
    super();

    // if the Fetch API is not available in legacy browsers,  we need to use a polyfill from cross-fetch else use the native fetch(on the window object)
    this._fetch = isBrowser ? window.fetch || fetch : fetch;

    this._isLegacyBrowser = isBrowser && !window.fetch;

    if (config) {
      let headers = {
        Authorization: `${
          config.accessToken && config.accessToken.length > 0
            ? 'Bearer ' + config.accessToken
            : ''
        }`,
      } as RequestHeaders;

      this._config = config;
      this._Headers = headers;
      switch (config.env) {
        case 'test':
          this._requestOpts = TestOpts;
          break;
        default:
          this._requestOpts = ProdOpts;
      }
    }
  }
  /** update the acessToken */
  setToken(token: string) {
    if (this._config) {
      this._config.accessToken = token;
      //set Authorization header
      this._Headers = {
        ...this._Headers,
        Authorization: `Bearer ${token}`,
      } as RequestHeaders;
    }
  }

  /** Extends the currents of the FetchHttpClient
   *
   * @param headers
   */
  extendHeaders(headers: RequestHeaders) {
    this._Headers = { ...this._Headers, ...headers } as RequestHeaders;
  }

  /**override */
  getClientName(): string {
    return 'fetch';
  }
  /** Use either our dev enviroment or production to make requests
   *
   * @param path
   * @param method
   * @param body
   * @returns
   */
  makeRequestwithDefault(
    path: string,
    method: string,
    body?: RequestData | undefined,
  ): Promise<HttpClientResponseInterface> {
    if (!this._requestOpts) {
      throw new Error('Config is required');
    }

    let { host, port, protocol, timeout } = this._requestOpts;
    port = port ? port.toString() : '';
    return this.makeRequest(
      host,
      port,
      path,
      method,
      this._Headers,
      body,
      protocol,
      timeout,
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
  makeRequest(
    host: string,
    port: string,
    path: string,
    method: string,
    headers: RequestHeaders,
    requestData: RequestData | undefined,
    protocol: string,
    timeout: number,
  ): Promise<HttpClientResponseInterface> {
    const Secure = protocol === 'https';
    const url = new URL(path, `${Secure ? 'https' : 'http'}://${host}:${port}`);
    url.port = port;

    const fetchFn = this._fetch;

    const methodHasPayload =
      method == 'POST' || method == 'PUT' || method == 'PATCH';
    const body = requestData || (methodHasPayload ? '' : undefined);

    let options: any = {
      method,
      headers,
    };

    if (body) {
      options.body = new URLSearchParams(body);
    }

    const fetchPromise = fetchFn(url.toString(), options);

    // The Fetch API does not support passing in a timeout natively, so a
    // timeout promise is constructed to race against the fetch and preempt the
    // request, simulating a timeout.
    //
    // This timeout behavior differs from Node:
    // - Fetch uses a single timeout for the entire length of the request.
    // - Node is more fine-grained and resets the timeout after each stage of
    //   the request.
    //
    // As an example, if the timeout is set to 30s and the connection takes 20s
    // to be established followed by 20s for the body, Fetch would timeout but
    // Node would not. The more fine-grained timeout cannot be implemented with
    // fetch.

    let pendingTimeoutId: NodeJS.Timeout | null;
    /*const timeoutPromise = new Promise((_, reject) => {
      pendingTimeoutId = setTimeout(() => {
        pendingTimeoutId = null;
        reject(HttpClient.makeTimeoutError());
      }, timeout);
    });
    */

    return Promise.race([fetchPromise])
      .then(res => {
        return new FetchHttpClientResponse(res as Response);
      })
      .finally(() => {
        if (pendingTimeoutId) {
          clearTimeout(pendingTimeoutId);
        }
      });
  }
}

export class FetchHttpClientResponse
  extends HttpClientResponse
  implements HttpClientResponseInterface
{
  _res: Response;

  constructor(res: Response) {
    super(
      res.status,
      FetchHttpClientResponse._transformHeadersToObject(res.headers),
    );
    this._res = res;
  }

  getRawResponse(): Response {
    return this._res;
  }

  toStream(
    streamCompleteCallback: () => void,
  ): ReadableStream<Uint8Array> | null {
    // Unfortunately `fetch` does not have event handlers for when the stream is
    // completely read. We therefore invoke the streamCompleteCallback right
    // away. This callback emits a response event with metadata and completes
    // metrics, so it's ok to do this without waiting for the stream to be
    // completely read.
    streamCompleteCallback();

    // Fetch's `body` property is expected to be a readable stream of the body.
    return this._res.body;
  }

  toJSON(): Promise<any> {
    return this._res.json();
  }

  static _transformHeadersToObject(headers: Headers): ResponseHeaders {
    // Fetch uses a Headers instance so this must be converted to a barebones
    // JS object to meet the HttpClient interface.
    const headersObj: ResponseHeaders = {};

    for (const entry of headers) {
      if (!Array.isArray(entry) || entry.length != 2) {
        throw new Error(
          'Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.',
        );
      }

      headersObj[entry[0]] = entry[1];
    }

    return headersObj;
  }
}
