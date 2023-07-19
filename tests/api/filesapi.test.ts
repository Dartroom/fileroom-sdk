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
  it('await for an uploaded file or throw error the file is not found ', async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });
    try {
      let response: any = await client.files.awaitUpload(testFilecid);

      expect(response).toBeDefined();
      expect(response).toEqual(
        expect.objectContaining({ data: expect.any(Object) }),
      );
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('File not found');
    }
  });

  it('delete one file if it exists', async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });

    try {
      let response: any = await client.files.deleteOne({
        cid: testFilecid,
      });
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data).toEqual(
        expect.objectContaining({
          deletedItems: expect.any(Array),
          filesDeleted: expect.any(Number),
          storageSaved: expect.any(Number),
        }),
      );
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toBeOneOf([expect.toContain('File not found'),expect.Contain("NOT_FOUND")]);
    }
  });

  it('throws error if  both cid and docID are passed to deleteOne', async () => {
    let client = new Client({
      accessToken: testDevApiKEY,
      env: fileroomEvn,
    });

    expect(
      async () =>
        await client.files.deleteOne({ cid: 'fasdfsaf', docID: 'fadsfsafsa' }),
    ).rejects.toThrowError(new TypeError(' cid or docID is required,not both'));
  });
  it('check if a file exists', async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });

    let response: any = await client.files.exists(testFilecid);

    expect(response).toBeDefined();
    expect(response.data).toBeDefined();

    expect(response.data).toEqual(
      expect.objectContaining({
        exists: expect.any(Boolean),
      }),
    );
  });


  it('delete a list of files  if they exist', async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });

    try {
      let response: any = await client.files.deleteMany([testFilecid]);
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data).toEqual(
        expect.objectContaining({
          deletedItems: expect.any(Array),
          filesDeleted: expect.any(Number),
          storageSaved: expect.any(Number),
        }),
      );
    } catch (error: any) {
      expect(error).toBeDefined();

      expect(error.message).toContain('NOT_FOUND');
    }
  });
});
