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

export interface getResponse {
  errors?: FileroomError;
  stream?: ReadableStream<Uint8Array> | null;
  metatdata?: meta;
}

interface meta {
  contentType: string;
  contentLength: number;
}

export interface browserRawResponse {
  _bodyBlob: Blob;
  _bodyInit: Blob;
  type: string;
  url: string;
  statusText: string;
  ok: boolean;
  headers: Headers;
}
