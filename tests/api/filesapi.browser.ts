import puppeteer, { Browser, Page } from 'puppeteer';
import { promises } from 'fs';
import * as matchers from 'jest-extended';
expect.extend(matchers);
let browser: Browser;
let page: Page;
let script: string; // library bundle for the browser;
import dotenv from 'dotenv';
dotenv.config();
let testDevApiKEY = process.env.TEST_DEV_API_KEY as string;
let testFilecid = process.env.TEST_FILECID as string;
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

describe('filesApi in the browser should', () => {
  it('be imported sucessfully with client', async () => {
    let handle = await page.evaluate(script);
    // @ts-ignore
    let Fileroom = await page.evaluateHandle(
      `new window.Fileroom.Client({accessToken: '', env: '${fileroomEvn}'})`,
    );

    let client = await Fileroom.getProperties();
    expect(client.has('ipfs')).toBe(true);
  });

  it("list a user's files", async () => {
    let call = ` 
           let response;
          async function MakeRequest () {
        let client = new Fileroom.Client({accessToken: '${testDevApiKEY}', env: '${fileroomEvn}'});
        let status  = await client.files.list();
        
        response = status;
      
        
          };
        MakeRequest();
 `;
    await page.evaluate(call);
    let response: any = await page.evaluate('response');
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();

    expect(response.data).toEqual(
      expect.objectContaining({
        docs: expect.any(Array),
        totalDocs: expect.any(Number),
        limit: expect.any(Number),
        hasNextPage: expect.any(Boolean),
        hasPrevPage: expect.any(Boolean),
        page: expect.any(Number),
        totalPages: expect.any(Number),
        pagingCounter: expect.any(Number),
        prevPage: expect.toBeOneOf([expect.any(Number), null]),
        offset: expect.any(Number),
        nextPage: expect.toBeOneOf([expect.any(Number), null]),
      }),
    );
  });

  it('await for an uploaded file', async () => {
    let call = ` 
          
          async function  awaitUpload() {
        let client = new Fileroom.Client({accessToken: '${testDevApiKEY}', env: '${fileroomEvn}'});
        let status  = await client.files.list();
        
        response = status;
      
        
          };
        awaitUpload();
 `;

    await page.evaluate(call);
    let response: any = await page.evaluate('response');
    expect(response).toBeDefined();
    expect(response).toEqual(
      expect.objectContaining({
        data: expect.any(Object),
      }),
    );
  });
});
