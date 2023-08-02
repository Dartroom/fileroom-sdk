import puppeteer, { Browser, Page } from 'puppeteer';
import { promises } from 'fs';
import { HttpClientResponseInterface } from '../../src/interfaces';
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
describe('UploadApi in browser', () => {
  it('is  imported sucessfully', async () => {
    let handle = await page.evaluate(script);

    let Fileroom = await page.evaluate('window.Fileroom');

    expect(Fileroom).toEqual(
      expect.objectContaining({
        Client: expect.any(Object),
        UploadApi: expect.any(Object),
      }),
    );
  });

  it('should set file metadata if file is a File', async () => {
    let call = `
           let  uploadApi;

            async function MakeRequest () {
let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
 let httpClient = client.__HttpClient;
   let blob = new Blob([JSON.stringify({ name: 'javascript' })], {
        type: 'application/json',
      });
      uploadApi = new Fileroom.UploadApi(httpClient);
      let file = new File([blob], 'sample.json',{
        type:blob.type
      });
      let str = await uploadApi.setfileMeta(file);

            }
              MakeRequest();  `;

    try {
      await page.evaluate(call);
      let uploadApi: any = await page.evaluate('uploadApi');

      expect(uploadApi).toBeDefined();

      expect(uploadApi._uploadOptions).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          size: expect.any(String),
          filetype: expect.any(String),
          checksum: expect.any(String),
        }),
      );
    } catch (error: any) {
      // dothing
      console.log(error);
    }
  });
});
