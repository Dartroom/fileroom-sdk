import { FileDoc, UserDoc } from '../types';

/**Input Options for client.user.create
 * @param userId - the userId can be provided without other fields to create a fileroom Account only for dartroomUsers.
 *@params {email,password}The remaining fields should be provided to create an External User (Dev User) for fileroom.
 *
 */
export interface createUserOptions {
  userId?: string;
  email?: string;
  password?: string;
  name?: string;
}

/**Input Options for client.user.update */

export interface updateUserOptions {
  addIP?: string;
  removeIP?: string;
  addDomain?: string;
  removeDomain?: string;
  restrictIPs?: string;
  restrictDomains?: boolean;
  showAll?: boolean;
  addApiKey?: string;
  removeApiKey?: string;
}

/**Input Options for client.user.login */
export interface loginOptions {
  username?: string;
  password?: string;
  dartroomToken?: string;
}

/** Return Object from client.user.create */
export interface createUserResponse {
  data:
    | string
    | {
        id: string;
        token: string;
      };
}

/** Return Object from client.user.update */
export interface updateUserResponse {
  data: {
    updated: UserDoc; // update the document
  };
}

/** Return Object from client.user.login */
export interface loginResponse {
  data: string; // the accessToken
}

/** Return Object from client.user.validatedToken */
export interface validatedTokenResponse {
  data: {
    isValid: boolean;
  };
}

