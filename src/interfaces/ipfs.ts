import { FileroomError } from '../types';

export interface statusResponse {
  peername: string;
  status: string;
  ipfs_peer_id: string;
  ipfs_peer_addresses: string[];
  timestamp: string;
  error: string;
  attempt_count: number;
  priority_pin: boolean;
  metadata: any | null;
  created: string;
}

/**Options for getResponse */

export interface getOptions {
  origin?: string;
  size?: string;
}


/** Fetch polyfill response for legacy browsers

 */
export interface LegacybrowserRawResponse {
  _bodyBlob: Blob;
  _bodyInit: Blob;
  type: string;
  url: string;
  statusText: string;
  ok: boolean;
  headers: Headers;
}

/** Pinning options for import a file by cid */
export interface pinOptions {
  resize: string[]; // array of sizes to create previews for given file(image or video)
}

/** Return Object from pin/cid */

export interface pinResponse {
  data: {
    message: string;
    result?: Record<string, any>; // current awating pinning status and preview generation;
    listenTo?: {
      wsUrl: string;
      event: string;
    };
  };
}
