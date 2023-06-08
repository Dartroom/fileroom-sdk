/** Base class for all controllers */
export class BaseApi {
  /**create a request builder */
  protected createHttpRequest: any;

  constructor(client: any) {
    this.createHttpRequest = client;
  }
}
