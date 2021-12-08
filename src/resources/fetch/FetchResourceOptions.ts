import { ContentTypeEnum } from '../../enums/ContentTypeEnum';
import { BaseResourceOptions } from '../../interfaces/BaseResourceOptions';

export interface FetchResourceOptions extends BaseResourceOptions {
  headers?: HeadersInit;
  responseType?: string;
  contentType?: ContentTypeEnum;
  accessType?: string;
  mode?: RequestMode;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  redirect?: RequestRedirect;
  referrer?: 'no-referrer' | 'client';
  queryParams?: any;
  canSendRequest?: () => Promise<{ can: boolean; error: Error }>;
}
