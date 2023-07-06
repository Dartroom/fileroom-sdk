import { Client, ConfigOptions } from '../../src';
import * as matchers from 'jest-extended';
expect.extend(matchers);
import dotenv from 'dotenv';

dotenv.config();

let testDevApiKEY = process.env.TEST_DEV_API_KEY as string;
let fileroomEvn = process.env.FILEROOM_ENV as ConfigOptions['env'];
let testFilecid = process.env.TEST_FILECID as string;

describe('filesAPi in nodejs should', () => {
  it(' be imported with client', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });

    await expect(client.files).toBeDefined();
  });

  it("list a user's files", async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });
    let response: any = await client.files.list();

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
});
