import { UploadApi } from '../../';
import { Client, ConfigOptions } from '../../';
import dotenv from 'dotenv';
import fs, { ReadStream } from 'fs';
import * as matchers from 'jest-extended';

expect.extend(matchers);
dotenv.config();

let testDevApiKEY = process.env.TEST_DEV_API_KEY as string;
let fileroomEvn = process.env.FILEROOM_ENV as ConfigOptions['env'];
let testFilecid = process.env.TEST_FILECID as string;

describe('UploadApi', () => {
  let uploadApi: UploadApi;
  let client: Client;
  let files: any;
  afterAll(done => {
    done();
  });

  beforeEach(() => {
    // mock dependencies
    client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });
  });

  it('should set file metadata if file is a NodeStream', async () => {
    // mock NodeStream
    let path = process.cwd() + '/tests/sampleF.gif';
    const stream: any = fs.createReadStream(path);
    let httpClient = client.__HttpClient;
    uploadApi = new UploadApi(httpClient);

    await uploadApi.setfileMeta(stream);

    expect(uploadApi._uploadOptions).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        size: expect.any(String),
        filetype: expect.any(String),
        checksum: expect.any(String),
      }),
    );
  });
  
});
