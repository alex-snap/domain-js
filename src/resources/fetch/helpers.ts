import { FetchOptions } from "./FetchOptions";
import { ContentTypes } from "../../enums/ContentTypes";
import { FetchRequestMethod } from "./FetchRequestMethod";
import { extractBlobContent, extractFormData } from "../../utils/helpers";

export function resolveHeaders(options: FetchOptions): {} {
  const additionalHeaders: Record<string, string> = {};
  if (options.contentType === ContentTypes.JSON) {
    additionalHeaders['Content-Type'] = 'application/json';
  } else if (options.contentType === ContentTypes.FORM_DATA) {
    additionalHeaders['Content-Type'] = 'multipart/form-data';
  }
  if (options.responseType === 'json') {
    additionalHeaders['Accept'] = 'application/json';
  }

  return { ...options.headers, ...additionalHeaders };
}

export function createRequestOptions(
  method: FetchRequestMethod,
  options: FetchOptions,
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
