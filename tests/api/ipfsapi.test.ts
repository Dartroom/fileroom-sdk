import { Config } from 'jest';
import { Client, ConfigOptions } from '../../src/';
import { streamToBuff } from '../../src/functions';
import dotenv from 'dotenv';
import { Stream } from 'stream';
import * as matchers from 'jest-extended';
expect.extend(matchers);
dotenv.config();

let testDevApiKEY = process.env.TEST_DEV_API_KEY as string;
let fileroomEvn = process.env.FILEROOM_ENV as ConfigOptions['env'];
let testFilecid = process.env.TEST_FILECID as string;

describe('ipfsApi in nodejs should', () => {
  it(' be imported with client', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });

    await expect(client.ipfs).toBeDefined();
  });

  it('check pinning status of the given cid', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.ipfs.status(testFilecid);
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

  it('fetch a file from gateway with origin set', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.ipfs.get(testFilecid, {
      origin: 'https://v2.dartroom.xyz',
    });
    expect(response).toBeDefined();
    expect(response).toEqual(expect.any(Stream));
  });

  it('fetch a preview from gateway with sizes set if it exists', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    try {
      let response = await client.ipfs.get(testFilecid, {
        origin: 'https://v2.dartroom.xyz',
        size: '130',
      });
      let Previewcid = String(client.ipfs.returnedHeaders['etag']);

      expect(response).toBeDefined();
    } catch (error:any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('API_ERROR: NOT_FOUND 404');
    }
  });

  it('throw error if cid is incorrect or file is not found when fetching a file', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    expect(
      async () => await client.ipfs.get('fasfdsafsdaf'),
    ).rejects.toThrowError('API_ERROR: NOT_FOUND 404');

    expect(async () => await client.ipfs.get('')).rejects.toThrowError(
      'cid is required',
    );
  });

  it('return a complete stream of the file when fetching it', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.ipfs.get(testFilecid, {
      origin: 'https://v2.dartroom.xyz',
    });
    expect(response).toBeDefined();

    if (response) {
      let contentLength = client.ipfs.returnedHeaders['content-length'];
      let buff = await streamToBuff(response as Stream);
      expect(buff).toBeDefined();
      expect(buff.length.toString()).toEqual(contentLength);
    }
  });
  it("import a file by cid and pin it's cid", async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });
    let response = await client.ipfs.pin(testFilecid, {
      resize: [],
    });
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(response.data).toContainAnyKeys(['message', 'result', 'totalSize']);
    await client.files.deleteOne({ cid: testFilecid });
  });

  it('throw error if cid is incorrect or file is not found when pinning a file', async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });
    expect(async () => await client.ipfs.pin('fasfdsafsdaf')).rejects.toThrow(
      'API_ERROR: NOT_FOUND 404',
    );
  });
});
