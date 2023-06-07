// write tests for the fetchHttpClient class
import { FetchHttpClient } from '../../src/net/fetchHttpClient';
import { RequestHeaders, RequestData } from '../../src/types';
import { HttpClientResponseInterface } from '../../src/interfaces';

describe('FetchHttpClient in nodejs', () => {
  let fetchClient = new FetchHttpClient();

  it('should make a request and return json', async () => {
    const host = 'jsonplaceholder.typicode.com';
    const port = '';
    const path = '/users/1';
    const method = 'GET';
    const headers: RequestHeaders = {
      'Content-Type': 'application/json',
    };
    const requestData = undefined;
    const protocol = 'https';
    const timeout = 500;
    const response: HttpClientResponseInterface = await fetchClient.makeRequest(
      host,
      port,
      path,
      method,
      headers,
      requestData,
      protocol,
      timeout,
    );

    expect(response).toBeDefined();
    expect(response.getStatusCode()).toBe(200);
    expect(response.getHeaders()).toBeDefined();
    expect(response.getRawResponse()).toBeDefined();
    expect(await response.toJSON()).toBeDefined();
  });
});
