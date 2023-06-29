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
describe.skip('Client in browser', () => {
  it('client is  imported sucessfully', async () => {
    let handle = await page.evaluate(script);

    let Fileroom = await page.evaluate('window.Fileroom');

    expect(Fileroom).toEqual(
      expect.objectContaining({
        Client: expect.any(Object),
      }),
    );
  });

  it('should throw error if config is not provided ', async () => {
    let call = `(async () => new Fileroom.Client({}))();`;
    try {
      await page.evaluate(call);
    } catch (error: any) {
      expect(error.message).toBe('Config is required');
    }
  });
});
