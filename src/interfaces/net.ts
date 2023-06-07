import { RequestHeaders, RequestData, ResponseHeaders } from '../types';

export interface HttpClientInterface {
  getClientName: () => string;
  makeRequest: (
    host: string,
    port: string,
    path: string,
    method: string,
    headers: RequestHeaders,
    requestData: RequestData,
    protocol: string,
    timeout: number,
  ) => Promise<HttpClientResponseInterface>;
}

export interface HttpClientResponseInterface {
  getStatusCode: () => number;
  getHeaders: () => ResponseHeaders;
  getRawResponse: () => unknown;
  toStream: (streamCompleteCallback: () => void) => unknown;
  toJSON: () => Promise<any>;
}
