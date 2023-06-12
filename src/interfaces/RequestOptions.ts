/** defined Request */
export interface RequestOptions {
  host: string; // The host nam
  port?: number | string;
  path: string;
  protocol: string;
  timeout: number;
}
