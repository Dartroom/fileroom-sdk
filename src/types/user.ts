import { AccountType } from '../enums';

type Long = {
  low: number;
  high: number;
  unsigned: boolean;
}

export type UserDoc = {
  _id: string;
  userId: string;
  accountType: AccountType;
  bandwidthUsage: Long;
  totalStorageUsage: Long;
  uploadLimit: Long;
  storageLimit: Long;
  Filesuploaded: Number;
  FilesRecentStored: Number;
  apiToken: Array<{ name: string; key: string }>;
  restrictIPs: Boolean;
  restrictDomains: Boolean;
  ipWhitelist: Array<String>;
  domainWhitelist: Array<String>;
  showAll: Boolean;
};
