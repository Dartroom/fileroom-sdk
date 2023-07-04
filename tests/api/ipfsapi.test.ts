import { Config } from 'jest';
import { Client, ConfigOptions } from '../../src/';
import { streamToBuff } from '../../src/functions';
import dotenv from 'dotenv';
import { Stream } from 'stream';

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
    expect(response).toEqual(
      expect.objectContaining({
        stream: expect.any(Object),
        metadata: expect.any(Object),
      }),
    );
  });

  it('fetch a preview from gateway with sizes set', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.ipfs.get(testFilecid, {
      size: '130',
    });
    let Previewcid = String(client.ipfs.returnedHeaders['etag']);

    expect(response).toBeDefined();
    expect(response).toEqual(
      expect.objectContaining({
        stream: expect.any(Object),
        metadata: expect.any(Object),
      }),
    );
    expect(JSON.parse(Previewcid)).not.toEqual(testFilecid);
  });

  it('throw error if cid is incorrect or file is not found when fetching a file', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    expect(
      async () => await client.ipfs.get('fasfdsafsdaf'),
    ).rejects.toThrowError('API_ERROR: NOT_FOUND 404');
  });

  it('return a complete stream of the file when fetching it', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.ipfs.get(testFilecid);
    expect(response).toBeDefined();

    if (response.stream && response.metadata?.contentLength) {
      let buff = await streamToBuff(response.stream as Stream);
      expect(buff).toBeDefined();
      expect(buff.length.toString()).toEqual(response.metadata.contentLength);
    }
  });
});
