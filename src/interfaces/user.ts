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
  addIP?:string;
  removeIP?:string;
  addDomain?:string;
  removeDomain?:string;
  restrictIPs?:string;
  restrictDomains?:boolean;
  showAll?:boolean;
}