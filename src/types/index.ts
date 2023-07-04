export type RequestData = Record<string, any>;
export type RequestHeaders =
  | Record<string, string | number | string[]>
  | typeof Request;
export type ResponseHeaderValue = string | string[];
export type ResponseHeaders =
  | Record<string, ResponseHeaderValue>
  | typeof Headers;
export type TimeoutError = TypeError & { code?: string };

export type FileroomError = Array<{
  data?: {
    message: string;
  };
  message: string;
  source?: string;
  status?: number;
}>;

