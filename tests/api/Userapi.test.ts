// write tests for the fetchHttpClient class
import { Config } from 'jest';
import { Client, ConfigOptions } from '../../src/';
import dotenv from 'dotenv';
dotenv.config();
let testDevApiKEY = process.env.TEST_DEV_API_KEY as string;
let testDevPassword = process.env.TEST_DEV_PASSWORD;
let testDevUsername = process.env.TEST_DEV_USERNAME;
let testUserDartroomID = process.env.TEST_USER_DARTROOMID;
let testUserFileRoomID = process.env.TEST_USER_FILEROOMID;
let fileroomEvn = process.env.FILEROOM_ENV as ConfigOptions['env'];

describe('UserApi in nodejs should', () => {
  it(' be imported with client', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });

    await expect(client.user).toBeDefined();
  });

  it('login a Dev user with his password and username', async () => {
    let client = new Client({
      accessToken: '',
      env: fileroomEvn,
    });
    let response = await client.user.login({
      username: testDevUsername,
      password: testDevPassword,
    });
    expect(response).toEqual(
      expect.objectContaining({
        data: expect.any(String),
      }),
    );
  });
  it('login a dartroom artist with their dartroomID and fileroomID', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.user.login({
      dartroomID: testUserDartroomID,
      fileroomID: testUserFileRoomID,
    });

    expect(response).toEqual(
      expect.objectContaining({
        data: expect.any(String),
      }),
    );
  });

  it('update the config.acessToken on login', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.user.login({
      dartroomID: testUserDartroomID,
      fileroomID: testUserFileRoomID,
    });

    expect(client._config.accessToken).toEqual(response.data);
  });
  it('throw error if username or password is not provided', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });

    expect(async () => await client.user.login({})).rejects.toThrowError(
      new Error(
        'username and password  or the dartroomID & fileroomID are  required',
      ),
    );
  });

  it("be able to update user's info", async () => {
    let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });
    let response = await client.user.update({
      showAll: true,
      restrictDomains: true,
    });

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
});
