import { AccountType } from '../enums';

export type UserDoc = {
  _id: string;
  userId: string;
  accountType: AccountType;
  bandwidthUsage: number;
  totalStorageUsage: number;
  uploadLimit: number;
  storageLimit: number;
  Filesuploaded: number;
  FilesRecentStored: number;
  apiToken: Array<{ name: string; key: string }>;
  restrictIPs: boolean;
  restrictDomains: boolean;
  ipWhitelist: Array<String>;
  domainWhitelist: Array<String>;
  showAll: boolean;
};
