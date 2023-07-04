import { FileroomError } from '../types';
import { PassThrough, Stream } from 'stream';
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
export interface getResponse {
  errors?: FileroomError;
  stream?: ReadableStream<Uint8Array> | Stream | null;
  metadata?: meta;
}

interface meta {
  contentType: string;
  contentLength: number;
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
