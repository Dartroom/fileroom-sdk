import puppeteer, { Browser, Page } from 'puppeteer';
import { promises } from 'fs';
import { HttpClientResponseInterface } from '../../src/interfaces';
let browser: Browser;
let page: Page;
let script: string; // library bundle for the browser;
import dotenv from 'dotenv';
dotenv.config();
let testDevApiKEY = process.env.TEST_DEV_API_KEY as string;

let fileroomEvn = process.env.FILEROOM_ENV;
let oldToken = '';

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

describe('ipfsApi in the browser should', () => {
  it('be imported sucessfully with client', async () => {
    let handle = await page.evaluate(script);
    // @ts-ignore
    let Fileroom = await page.evaluateHandle(
      `new window.Fileroom.Client({accessToken: '', env: '${fileroomEvn}'})`,
    );

    let client = await Fileroom.getProperties();
    expect(client.has('ipfs')).toBe(true);
  });

  it('check pinning status of the given cid', async () => {
    let call = ` 
           let response;
          async function MakeRequest () {
        let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
        let status  = await client.ipfs.status('QmaNxbQNrJdLzzd8CKRutBjMZ6GXRjvuPepLuNSsfdeJRJ');
        
        response = status;
      
        
          };
        MakeRequest();
 `;
    await page.evaluate(call);

    let response: any = await page.evaluate('response');
    expect(response).toBeDefined();
    expect(response.status).toBeDefined();

    expect(response.status).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        peername: expect.any(String),
        ipfs_peer_id: expect.any(String),
        ipfs_peer_addresses: expect.any(Array),
        attempt_count: expect.any(Number),
        priority_pin: expect.any(Boolean),
        metadata: expect.any(Object),
        created: expect.any(String),
      }),
    );
  });
});
