import { FetchRequestMethod } from "./FetchResource";

export interface FetchRequestOptions {
  method: FetchRequestMethod;
  headers?: HeadersInit;
  mode?: RequestMode;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  redirect?: RequestRedirect;
  referrer?: string;
  body?: any;
}
