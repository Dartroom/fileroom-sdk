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
let testUserDartroomToken = process.env.TEST_USER_DARTROOM_TOKEN as string;
let fileroomEvn = process.env.FILEROOM_ENV as ConfigOptions['env'];

describe('UserApi in nodejs should', () => {
  it(' be imported with client', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });

    await expect(client.user).toBeDefined();
  });

  it("validate a user's token", async () => {
    try {
      let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });

      let response = await client.user.validateToken();
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.isValid).toBeDefined();
      expect(response.data.isValid).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid access token');
    }
  });

  it('create a Dev user with his password and username', async () => {
    let client = new Client({
      accessToken: '',
      env: fileroomEvn,
    });
     
    try {
      let response = await client.user.create({
        name: testDevUsername,
        password: testDevPassword,
        email: testDevUsername
      });
      expect(response).toEqual(
        expect.objectContaining({
          data: expect.any(String),
        }),
      );
    } catch (error: any) { 
      expect(error).toBeDefined();
      expect(error.message).toContain('User already exists');
    }
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
  it('login a dartroom artist with their dartroom Token', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });
    let response = await client.user.login({
      dartroomToken: testUserDartroomToken,
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
      username: testDevUsername,
      password: testDevPassword,
    });

    expect(client._config.accessToken).toEqual(response.data);
  });
  it('throw error if username or password is not provided', async () => {
    let client = new Client({ accessToken: '', env: fileroomEvn });

    expect(async () => await client.user.login({})).rejects.toThrowError(
      new Error(
        'username and password  or dartroomToken is required are  required',
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
  describe('userAPI.stats', () => { 

    it('get the stats of a user with a given range of dates', async () => { 
      let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });
      let response = await client.user.stats({
        from: new Date('2021-01-01').toLocaleDateString(),
        to: new Date().toLocaleDateString(),
      });

      expect(response).toBeDefined();

      expect(response.data).toBeDefined();
      expect(response.data).toEqual(
        expect.objectContaining({
          storageUsage: expect.any(Number),
          filesUploaded: expect.any(Number),
          uploadLimit: expect.any(Number),
          storageLimit: expect.any(Number),
          filesRecentlyStored: expect.any(Number),
          monthlyStats: expect.any(Array),
        }),
      );
    });
    
    // throws error if the range is not valid

    it('throws error if the range is not valid, from is greater than to', async () => { 

      let client = new Client({ accessToken: testDevApiKEY, env: fileroomEvn });


      expect(async () => await client.user.stats({from: '2023-11-11', to: '2023-01-01'})).rejects.toThrowError(
       
      );

      // use an invalid date
      expect(async () => await client.user.stats({from: '2023-11-11', to: '2023-28-02'})).rejects.toThrowError(
        TypeError("API_ERROR: 400 reason: Invalid date")
      );

      
    });

  });
  
});
