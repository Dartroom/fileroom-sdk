export interface listOptions {
  limit?: number;
  skip?: number;
  sortDsc?: boolean;
  sortBy?: string;
}

/**Expected Response from list */

export interface listResponse {
  docs: Record<string, any>[]; // list of available files
  totalDocs: number; // total number of files
  limit: number;
  offest: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

/**Expected Response from awaitUpload */

export interface awaitUploadResponse {
  data: Record<string, any>; // the uploaded file
}

/**deleteOne Options */
export interface deleteOneOptions {
  cid?: string;
  docID?: string;
}

/**Expected Response from deleteOne */

export interface deleteResponse {
  data: {
    deleted?: boolean; // true if the file was delete
    docID?: Record<string, any>; // the updated document (when docID is provided)
    modified?: Record<string, any>; //  modified duplicates (when cid is provided)
    deletedItems?: string[]; // list of cids of deleted files
    filesDeleted?: number; // number of files deleted
    storageSaved?: number; // amount of storage saved
    duplicatesDeleted?: Record<string, any>; // number of duplicates deleted
  };
}
