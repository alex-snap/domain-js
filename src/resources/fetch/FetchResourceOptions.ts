import { ContentTypes } from '../../enums/ContentTypes';
import { BaseResourceOptions } from '../../interfaces/BaseResourceOptions';

export interface FetchResourceOptions extends BaseResourceOptions {
  headers?: HeadersInit;
  responseType?: string;
  contentType?: ContentTypes;
  accessType?: string;
  mode?: RequestMode;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  redirect?: RequestRedirect;
  referrer?: 'no-referrer' | 'client';
  handleError?: (payload: { response: Response; parsedBody: any }) => any;
  queryParams?: any;
  canSendRequest?: () => Promise<{ can: boolean; error: Error }>;
}
