/** Base class for all controllers */
import { FetchHttpClient } from '../net/fetchHttpClient';
export class BaseApi {
  /**create a request builder */
   createHttpRequest: FetchHttpClient;

  constructor(client: FetchHttpClient) {
    this.createHttpRequest = client;
  }
}
