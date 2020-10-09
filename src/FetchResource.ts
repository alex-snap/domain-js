import { ResourceResponse, BaseResource } from './interfaces/BaseResource';
import { ContentTypes } from './enums/ContentTypes';
import 'whatwg-fetch';
import { extractBlobContent, extractFormData } from './helpers';

export type FetchRequestMethod = 'POST' | 'PUT' | 'GET' | 'DELETE' | 'PATCH';

export interface FetchOptions {
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

export const DefaultFetchOptions: FetchOptions = {
  headers: {},
  trailingSlash: true,
  responseType: 'json',
  contentType: ContentTypes.JSON,
  accessType: 'json',
  mode: 'same-origin',
  cache: 'default',
  credentials: 'same-origin',
  redirect: 'follow',
  referrer: 'client',
  timeOffset: true,
  handleError: undefined,
  queryParamsDecodeMode: 'comma',
};

export class FetchResource implements BaseResource {
  protected defaultOptions: FetchOptions;

  constructor(
    protected baseUrl: string,
    defaultOptions?: FetchOptions,
    protected fetchClient = fetch
  ) {
    this.defaultOptions = { ...DefaultFetchOptions, ...defaultOptions };
    this.fetchClient = this.fetchClient.bind(this);
  }

  public post(
    url: string,
    body?: Record<string, any>,
    options?: FetchOptions
  ): Promise<ResourceResponse> {
    const { requestUrl, requestOptions } = this.createRequest({
      method: 'POST',
      url,
      options,
      body,
    });
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public put(
    url: string,
    body?: Record<string, any>,
    options?: FetchOptions
  ): Promise<ResourceResponse> {
    const { requestUrl, requestOptions } = this.createRequest({
      method: 'PUT',
      url,
      options,
      body,
    });
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public patch(
    url: string,
    body?: Record<string, any>,
    options?: FetchOptions
  ): Promise<ResourceResponse> {
    const { requestUrl, requestOptions } = this.createRequest({
      method: 'PATCH',
      url,
      options,
      body,
    });
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public get(
    url: string,
    queryParams?: Record<string, any>,
    options?: FetchOptions
  ): Promise<ResourceResponse> {
    const { requestUrl, requestOptions } = this.createRequest({
      method: 'GET',
      url,
      options: { ...options, queryParams },
    });
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public delete(
    url: string,
    body?: Record<string, any>,
    options?: FetchOptions
  ): Promise<ResourceResponse> {
    const { requestUrl, requestOptions } = this.createRequest({
      method: 'DELETE',
      url,
      options,
      body,
    });
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public setHeaders(headers: Record<string, string>) {
    this.defaultOptions.headers = Object.assign({}, this.defaultOptions.headers, headers);
  }

  public clearHeaders() {
    delete this.defaultOptions.headers;
  }

  public setBasePath(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public resolveDestination(pathParts: Array<number | string>, basePath: string): string {
    return (pathParts.reduce(
      (resultUrl, routePart) => `${resultUrl}/${routePart}`,
      basePath
    ) as string).replace(/([^:]\/)\/+/g, '$1');
  }

  public getAllEntities(): Promise<any> {
    return new Promise((_, reject) => {
      reject(new Error('BaseHttpResource #getAllEntities(): need to provide method'));
    });
  }

  private async extractResponseContent(
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

  private fetchHandleCode(url: string, options: RequestInit): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.defaultOptions.canSendRequest !== undefined) {
        const { error, can } = await this.defaultOptions.canSendRequest();
        if (!can) {
          throw error;
        }
      }
      this.fetchClient(url, options)
        .then(async (response: Response) => {
          const data = await this.extractResponseContent(response.clone());
          if (typeof data === 'object') {
            Object.assign(data, { ['_status']: response.status });
          }
          if (response.ok) {
            resolve(data);
          } else {
            if (this.defaultOptions?.handleError) {
              this.defaultOptions.handleError({ response, parsedBody: data });
            }
            reject(data);
          }
        })
        .catch(async (error: TypeError) => {
          return reject(error);
        });
    });
  }

  private resolveRequestBody(
    body: Record<string, any> | null,
    options?: FetchOptions
  ): Record<string, any> | string | FormData | null {
    if (options) {
      if (body != null) {
        if (options.contentType === ContentTypes.FORM_DATA) {
          return this.transformToFormData(body);
        } else if (options.contentType === ContentTypes.JSON) {
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

  private transformToFormData(
    body: Record<string, any>,
    form?: FormData,
    namespace?: string
  ): FormData {
    const formData = form || new FormData();
    for (const property in body) {
      const value = body[property];
      if (!body.hasOwnProperty(property) || !value) {
        continue;
      }
      const formKey = namespace
        ? Array.isArray(body)
          ? `${namespace}[]`
          : `${namespace}[${property}]`
        : property;
      if (value instanceof Date) {
        formData.append(formKey, (value as Date).toISOString());
      } else if (this.isFile(value)) {
        this.transformToFormData(value, formData, formKey);
      } else {
        formData.append(formKey, value);
      }
    }
    return formData;
  }

  private isFile(value: any): boolean {
    // todo realize for React Native
    return typeof value === 'object'; //&& !(value instanceof File)
  }

  private createRequest(data: {
    method: FetchRequestMethod;
    url: string;
    options?: FetchOptions;
    body?: any;
  }): { requestUrl: string; requestOptions: RequestInit } {
    const { method, url, options, body } = data;
    const mergedOptions = this.resolveRequestOptions(options);
    let requestUrl = this.resolveRequestUrl(url, mergedOptions);
    const decodedBody = this.resolveRequestBody(body, options);
    const requestOptions = this.createRequestOptions(method, mergedOptions, decodedBody);
    const query = this.getQueryString(options?.queryParams, options);
    requestUrl = [requestUrl, query].filter(Boolean).join('?');
    return { requestUrl, requestOptions };
  }

  private resolveRequestUrl(url: string, o?: FetchOptions): string {
    if (this.baseUrl == null) {
      throw new Error('BaseHttpResource#resolveRequestUrl: baseUrl is not defined');
    }
    const urlPart = `/${url}${o.trailingSlash ? '/' : ''}`;
    let result = (this.baseUrl + urlPart).replace(/([^:]\/)\/+/g, '$1');
    return result;
  }

  private resolveRequestOptions(options: FetchOptions) {
    return { ...this.defaultOptions, ...options };
  }

  private createRequestOptions(
    method: FetchRequestMethod,
    options: FetchOptions,
    body?: any
  ): RequestInit {
    return {
      method,
      body: body ?? undefined,
      headers: this.resolveHeaders(options),
      mode: options.mode,
      cache: options.cache,
      credentials: options.credentials,
      redirect: options.redirect,
      referrer: options.referrer,
    };
  }

  private resolveHeaders(options: FetchOptions) {
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

  public getQueryString(
    params: Record<string, string | number | boolean | (string | number | boolean)[]> = {},
    options?: FetchOptions
  ): string {
    const { timeOffset, queryParamsDecodeMode } = { ...this.defaultOptions, ...options };

    if (timeOffset) {
      params['timeoffset'] = new Date().getTimezoneOffset() * -1;
    }

    return Object.keys(params)
      .map((k) => {
        const value = params[k];
        if (Array.isArray(value)) {
          switch (queryParamsDecodeMode) {
            case 'array':
              return value
                .map((val) => `${encodeURIComponent(k)}[]=${encodeURIComponent(val)}`)
                .join('&');
            case 'comma':
            default:
              return `${encodeURIComponent(k)}=${value.join(',')}`;
          }
        } else if (value !== null && value !== undefined) {
          return `${encodeURIComponent(k)}=${encodeURIComponent(value)}`;
        }
      })
      .filter(Boolean)
      .join('&');
  }
}
