import { FetchResourceOptions } from './FetchResourceOptions';
import { ContentTypeEnum } from '../../enums/ContentTypeEnum';
import { FetchRequestMethod } from './FetchRequestMethod';
import { extractBlobContent, extractFormData, resolveHeaders, transformToFormData } from '../../utils/helpers';

export function resolveFetchRequestBody(
  body: Record<string, any> | null,
  options?: FetchResourceOptions
): Record<string, any> | string | FormData | null {
  if (options) {
    if (body != null) {
      if (options.contentType === ContentTypeEnum.FORM_DATA) {
        return transformToFormData(body);
      } else if (options.contentType === ContentTypeEnum.JSON) {
        return JSON.stringify(body);
      } else if (!!options.contentType) {
        return body;
      }
    } else {
      return body;
    }
  }
  return JSON.stringify(body);
}

export function createRequestOptions(
  method: FetchRequestMethod,
  options: FetchResourceOptions,
  body?: any
): RequestInit {
  return {
    method,
    body: body ?? undefined,
    headers: resolveHeaders(options),
    mode: options.mode,
    cache: options.cache,
    credentials: options.credentials,
    redirect: options.redirect,
    referrer: options.referrer,
  };
}

export async function extractResponseContent(
  response: Response
): Promise<{ [key: string]: any } | string> {
  const responseContentType = response.headers.get('content-type') || '';
  if (responseContentType.indexOf('application/json') > -1) {
    return response.json<Record<string | number | symbol, any>>();
  } else if (responseContentType.indexOf('application/octet-stream') > -1) {
    return extractBlobContent(await response.blob());
  } else if (responseContentType.indexOf('multipart/form-data') > -1) {
    return extractFormData(await response.formData());
  } else {
    return response.text();
  }
}
