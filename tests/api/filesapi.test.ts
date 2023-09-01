import { Client, ConfigOptions, listOptions } from '../../';
import fs from 'fs';
import * as matchers from 'jest-extended';
expect.extend(matchers);
import dotenv from 'dotenv';
import exp from 'constants';

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
  it('list files with options { limit, skip } etc', async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });
    const options = {
      limit: 1,
      skip: 1,
      sortBy: 'original.cid',
      sortDsc: true,
    } as listOptions;

    let response: any = await client.files.list(options);
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

      expect(error.message).toContain(
        `API_ERROR: 404 reason: File not found: ${testFilecid}`,
      );
    }
  });

  it('upload a single file with resize options with progress', async () => {
    let client = new Client({
      accessToken: testDevApiKEY,
      env: fileroomEvn,
    });
    let path = process.cwd() + '/tests/sampleF.gif';
    let { files } = client;
    const stream = fs.createReadStream(path);

    let response = await files.uploadFiles(stream, {
      resize: ['100x100', '200x200'],
    });

    expect(response).toBeDefined();

    let spy = jest.fn();
    response?.on('progress', progress => {
      expect(progress).toBeDefined();
    });

    response?.on('completed', async data => {
      try {
        let id = data.hasOwnProperty('file') ? data.file._id : data._id;

        await files.deleteOne({ docID: id });
        expect(data).toBeDefined();
        expect(data?.file).toBeDefined();
      } catch (error: any) {
        console.log(error);
        expect(error).toBeDefined();
      }
    });
  });

  it('upload a  multiple files  with  different resize options', async () => {
    let client = new Client({
      accessToken: testDevApiKEY,
      env: fileroomEvn,
    });
    let path = process.cwd() + '/tests/sampleF.gif';
    let path2 = process.cwd() + '/tests/sample2.gif';
    let { files } = client;
    const stream = fs.createReadStream(path);
    const stream2 = fs.createReadStream(path2);
    let opts = [
      {
        resize: ['100x100', '200x200'],
      },
      {
        resize: ['300x300', '400x400'],
      },
    ];
    let response = await files.uploadFiles([stream2, stream], opts);

    expect(response).toBeDefined();

    response?.on('allCompleted', async results => {
      let data = results[0];

      try {
        let ids = results.map(d =>
          d.hasOwnProperty('file') ? d.file._id : d._id,
        );
        for (let id of ids) {
          let done = await files.deleteOne({ docID: id });
        }

        expect(data).toBeDefined();
        expect(data?.file).toBeDefined();

        let d = data && data.hasOwnProperty('file') ? data?.file : data;

        // expect(sizes).toEqual(expect.arrayContaining(opts[0]?.resize));
      } catch (error: any) {
        expect(error).toBeDefined();
      } finally {
        stream.close();
        stream2.close();
      }
    });
  });
});
