import { ContentTypes } from "../enums/ContentTypes";

export interface FetchResourceOptions {
  rawResponse?: boolean;
  isFormData?: boolean;
  trailingSlash?: boolean;
  headers?: HeadersInit;
  responseType?: string;
  contentType?: ContentTypes;
  accessType?: string;
  mode?: RequestMode;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  redirect?: RequestRedirect;
  referrer?: 'no-referrer' | 'client';
  timeOffset?: boolean;
  handleError?: (payload: { response: Response; parsedBody: any }) => any;
  queryParamsDecodeMode?: 'comma' | 'array';
  queryParams?: any;
  canSendRequest?: () => Promise<{ can: boolean; error: Error }>;
  // params?: any
  // todo
  // Добавить проверку перед тем как отправить запрос
  // можно ли его слать (пример, если нет интернета или любое другое условие)
  // то есть перехватить и вернуть другую ошибку
}
