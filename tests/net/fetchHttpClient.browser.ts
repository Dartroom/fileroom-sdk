import puppeteer, { Browser, Page } from 'puppeteer';
import { promises } from 'fs';
import { HttpClientResponseInterface } from '../../src/interfaces';
let browser: Browser;
let page: Page;
let script: string; // library bundle for the browser;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
  });
  page = await browser.newPage();

  await page.goto('https://google.com');
  // load browser script;
  script = await promises.readFile(
    process.cwd() + '/dist/browser/index.js',
    'utf-8',
  );
});

// close the browser after all test
afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});
describe('FetchHttpClient in browser', () => {
  it('library and classes are imported sucessfully', async () => {
    let handle = await page.evaluate(script);

    let Fileroom = await page.evaluate('window.Fileroom');

    expect(Fileroom).toEqual(
      expect.objectContaining({
        FetchHttpClient: expect.any(Object),
      }),
    );
  });

  it('should make a request and return json', async () => {
    let call = ` 
           let response;
          async function MakeRequest () {
        let fetchClient = new Fileroom.FetchHttpClient();
      
        const host = 'jsonplaceholder.typicode.com';
        const port = '';
        const path = '/users/1';
        const method = 'GET';
        const headers = {
          'Content-Type': 'application/json',
        };
        const requestData = undefined;
        const protocol = 'https';
        const timeout = 10000;
         response = 
          await fetchClient.makeRequest(
            host,
            port,
            path,
            method,
            headers,
            requestData,
            protocol,
            timeout,
          );
          
          };
        MakeRequest();
 `;
    try {
      await page.evaluate(call);
      let response: any = await page.evaluate('response.toJSON()');

      expect(response).toBeDefined();

      expect(response).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          address: expect.any(Object),
          phone: expect.any(String),
          website: expect.any(String),
          company: expect.any(Object),
        }),
      );
   
    } catch (error: any) { 
      expect(error).toBeDefined();
    }
  });
});
