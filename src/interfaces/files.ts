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
