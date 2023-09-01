import puppeteer, { Browser, Page } from 'puppeteer';
import { promises } from 'fs';
import { HttpClientResponseInterface } from '../../src/interfaces';
let browser: Browser;
let page: Page;
let script: string; // library bundle for the browser;
import dotenv from 'dotenv';
dotenv.config();
let testDevApiKEY = process.env.TEST_DEV_API_KEY as string;
let testDevPassword = process.env.TEST_DEV_PASSWORD;
let testDevUsername = process.env.TEST_DEV_USERNAME;
let testUserDartroomID = process.env.TEST_USER_DARTROOMID;
let testUserFileRoomID = process.env.TEST_USER_FILEROOMID;
let testUserDartroomToken = process.env.TEST_USER_DARTROOM_TOKEN as string;
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
describe('UserApi in the browser should', () => {
  it('be imported sucessfully with client', async () => {
    let handle = await page.evaluate(script);
    // @ts-ignore
    let Fileroom = await page.evaluateHandle(
      `new window.Fileroom.Client({accessToken: '', env: '${fileroomEvn}'})`,
    );

    let client = await Fileroom.getProperties();

    expect(client.has('user')).toBe(true);
  });

  it("validate a user's token", async () => {
    let call = `
              let res;
             async function ValidateToken () {
                 let client  = new Fileroom.Client({accessToken: '${testDevApiKEY}', env: '${fileroomEvn}'});
                  res = await client.user.validateToken();
             };
              ValidateToken();
    `;
    try {
      await page.evaluate(call);
      let response: any = await page.evaluate('res');

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.isValid).toBeDefined();
      expect(response.data.isValid).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid access token');
    }
  });

  it('login a Dev user with his password and username', async () => {
    let call = ` 
           let response;
          async function MakeRequest () {
        let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
        let user = await client.user.login({username:'${testDevUsername}', password: '${testDevPassword}'});
        response = user;
      
        
          };
        MakeRequest();
 `;
    await page.evaluate(call);

    let response = await page.evaluate('response');
    expect(response).toEqual(
      expect.objectContaining({
        data: expect.any(String),
      }),
    );
  });

  it('login a dartroom artist with their dartroomToken', async () => {
    let call = ` 
    
          async function MakeRequest () {
        let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
        let user = await client.user.login({dartroomToken: '${testUserDartroomToken}'});
          return  user;
          };
        MakeRequest();
 `;

    let response = await page.evaluate(call);

    //let response = await page.evaluate('response');

    expect(response).toEqual(
      expect.objectContaining({
        data: expect.any(String),
      }),
    );
  });

  it('update the config.accessToken on login', async () => {
    let call = ` 
           let config;
          async function MakeRequest () {
        let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
        let user = await client.user.login({username:'${testDevUsername}', password: '${testDevPassword}'});
         config = client._config;
         return user;
          };
        MakeRequest();
 `;
    let response: any = await page.evaluate(call);

    let config: any = await page.evaluate('config');
    expect(response).toBeDefined();
    expect(config).toBeDefined();
    expect(config.accessToken).toEqual(response.data);
  });
  it('throw error if username or password is not provided when logging in ', async () => {
    let call = `(async () => {
            let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
             return await client.user.login({});
    })()`;

    expect(async () => await page.evaluate(call)).rejects.toThrowError(
      new Error(
        'username and password  or dartroomToken is required are  required',
      ),
    );
  });

  it("be able to update a user's info ", async () => {
    let call = ` 
    
          async function updateRequest () {
        let client = new Fileroom.Client({accessToken: '${testDevApiKEY}', env: '${fileroomEvn}'});
        let user = await client.user.update({showAll: true,restrictDomains:true});
          return  user;
          };
        updateRequest();
 `;

    let response: any = await page.evaluate(call);
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(response.data.updated).toBeDefined();
    expect(response.data.updated).toEqual(
      expect.objectContaining({
        showAll: true,
        restrictDomains: true,
      }),
    );
  });

  it('throw an error if any of the right update options are passed, or any empty is passed ', async () => {
    let call = ` 
    
          async function updateRequest () {
        let client = new Fileroom.Client({accessToken: '${testDevApiKEY}', env: '${fileroomEvn}'});
        let user = await client.user.update({});
          return  user;
          };
        updateRequest();
 `;

    expect(async () => await page.evaluate(call)).rejects.toThrowError();
  });
});
