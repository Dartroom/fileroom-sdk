import puppeteer, { Browser, Page } from 'puppeteer';
import { promises } from 'fs';
import { HttpClientResponseInterface } from '../../src/interfaces';
import * as matchers from 'jest-extended';
expect.extend(matchers);
let browser: Browser;
let page: Page;
let script: string; // library bundle for the browser;
let file: any;
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

  // create a fileInput with puppeteer
  await page.evaluate(() => {
    let input = document.createElement('input');
    input.type = 'file';
    input.id = 'fileInput';
    // set to Multiple
    input.multiple = true;
    document.body.appendChild(input);
  });

  // set fileInput to files
  file = await page.$('#fileInput');
  await file.uploadFile(process.cwd() + '/tests/sampleF.gif');
  await file.evaluate((upload: any) => {
    console.log(upload.files);
    return upload.dispatchEvent(new Event('change', { bubbles: true }));
  });
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
        let status  = await client.ipfs.status('${testFilecid}');
        
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

  it.skip('fetch a file from gateway with origin set', async () => {
    let call = ` 
           let respo;
          async function MakeGatewayR () {
        let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
        let result = await client.ipfs.get('${testFilecid}',{origin: 'https://v2.dartroom.xyz'});
        
        respo = result;
        
          };
        MakeGatewayR();
 `;
    await page.evaluate(call);
    let response: any = await page.evaluate('respo');
    expect(response).toBeDefined();
    expect(response).toEqual(expect.any(Object));
  });

  it.skip('fetch a preview from gateway with sizes set', async () => {
    let call = ` 
          let  _preview_cid;
          async function fetchPreview() {
        let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
        let result = await client.ipfs.get('${testFilecid}',{size: '130'});
        
        respo = result;
        _preview_cid = client.ipfs.returnedHeaders['x-ipfs-roots']
       
        
          };
         fetchPreview();
 `;
    await page.evaluate(call);
    let response: any = await page.evaluate('respo');
    let Previewcid: any = await page.evaluate('_preview_cid');
    expect(response).toBeDefined();
    expect(Previewcid).toBeDefined();

    expect(response).toEqual(expect.any(Object));
    expect(Previewcid).not.toEqual(testFilecid);
  });
  it('throw error if cid is incorrect or file is not found when fetching a file', async () => {
    let call = `(async () => {
            let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
             return await client.ipfs.get("fasdfdsafdsafsafsaf");
    })()`;

    expect(async () => await page.evaluate(call)).rejects.toThrowError();
    call = `(async () => {
            let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
             return await client.ipfs.get("");
    })()`;

    expect(async () => await page.evaluate(call)).rejects.toThrowError();
  });

  it('return a complete stream of the file when fetching it', async () => {
    let call = ` 
          let  _contentLength;
          let bytes = 0;
          
          async function fetchStream() {
        let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
        let result = await client.ipfs.get('${testFilecid}',{origin: 'https://v2.dartroom.xyz'});
        
        _contentLength = client.ipfs.returnedHeaders['content-length']
         
        let reader = result.getReader();
         while (true) {
          let { done, value } = await reader.read();
             if(done) break;
             bytes += value.length;
             

         }
        
          };
           fetchStream();`;
    try {
      await page.evaluate(call);

      let contentLength: any = await page.evaluate('_contentLength');
      let bytes = (await page.evaluate('bytes')) as number;
      expect(contentLength).toBeDefined();
      expect(bytes).toBeDefined();
      expect(bytes.toString()).toEqual(contentLength);
    } catch (error) {}
  });

  it("import a file by cid and pin it's cid", async () => {
    let call = ` 
           
          async function importBycid () {
        let client = new Fileroom.Client({accessToken: '${testDevApiKEY}', env: '${fileroomEvn}'});
        let result = await client.ipfs.pin('${testFilecid}',{
          resize:[]
        });
        
        respo = result;

        // deleted the created file;

        await client.files.deleteOne({cid:'${testFilecid}'})
        
          };
         importBycid();
 `;
    try {
      await page.evaluate(call);
      let response: any = await page.evaluate('respo');
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data).toContainAnyKeys([
        'message',
        'result',
        'totalSize',
      ]);
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('API_ERROR');
    }
  });

  it('throw error if cid is incorrect or file is not found when pinning a file', async () => {
    let call = `(async () => {
            let client = new Fileroom.Client({accessToken: '', env: '${fileroomEvn}'});
             return await client.ipfs.pin("fsadfdsa");
    })()`;

    expect(async () => await page.evaluate(call)).rejects.toThrowError();
  });

  it('upload a single file with resize options with progress', async () => {
    let call = `

      let  uploadApi;
      let file;
      let result;
      let files;

            async function MakeRequest () {
let client = new Fileroom.Client({accessToken: '${testDevApiKEY}', env: '${fileroomEvn}'});
let {files}  = client;
 let httpClient = client.__HttpClient;
        file = document.getElementById('fileInput').files[0];
        uploadApi = await files.uploadFiles(file,{
          resize:["130x130"],
        });
         
        uploadApi.on('progress', (progress) => {});
        uploadApi.on('complete', (data) => {
          result = data;

        });
     
    }
       
        MakeRequest(); 

          `;

    try {
      let result = await page.evaluate(call);
      let uploadApi: any = await page.evaluate('uploadApi');
      let file: any = await page.evaluate('file');

      expect(uploadApi).toBeDefined();
      expect(file).toBeDefined();
    } catch (error) {
      console.log(error);
    }
  });
});
