import { Config } from 'jest';
import { Client, ConfigOptions } from '../../src/';
import dotenv from 'dotenv';

dotenv.config();

let testDevApiKEY = process.env.TEST_DEV_API_KEY as string;
let fileroomEvn = process.env.FILEROOM_ENV as ConfigOptions['env'];

describe('ipfsApi in nodejs should', () => {
  it(' be imported with client', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });

    await expect(client.ipfs).toBeDefined();
  });

  it('check pinning status of the given cid', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.ipfs.status(
      'QmaNxbQNrJdLzzd8CKRutBjMZ6GXRjvuPepLuNSsfdeJRJ',
    );
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
