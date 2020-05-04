import { BaseResource } from "./interfaces/BaseResource";

export type FetchRequestMethod = 'post' | 'put' | 'get' | 'delete' | 'patch';

export interface FetchOptions {
  isFormData?: boolean
  headers?: HeadersInit
  responseType?: string
  contentType?: string
  accessType?: string
  mode?: RequestMode
  cache?: RequestCache
  credentials?: RequestCredentials
  redirect?: RequestRedirect
  referrer?: 'no-referrer' | 'client'
  timeOffset?: boolean
  handleError?: () => any
  queryParamsDecodeMode?: 'comma' | 'array'
  params?: any
  // todo 
  // Добавить проверку перед тем как отправить запрос
  // можно ли его слать (пример, если нет интернета или любое другое условие)
  // то есть перехватить и вернуть другую ошибку
}

export interface FetchRequestOptions {
  method: FetchRequestMethod
  headers?: HeadersInit
  mode?: RequestMode
  cache?: RequestCache
  credentials?: RequestCredentials
  redirect?: RequestRedirect
  referrer?: string
  body?: any
}

export const DefaultFetchOptions: FetchOptions = {
  headers: {},
  responseType: 'json',
  contentType: 'json',
  accessType: 'json',
  mode: 'same-origin',
  cache: 'default',
  credentials: 'same-origin',
  redirect: 'follow',
  referrer: 'client',
  timeOffset: true,
  handleError: null,
  queryParamsDecodeMode: 'comma'
};

export class FetchResource implements BaseResource {
  protected defaultOptions: FetchOptions;

  constructor(protected baseUrl: string,
              defaultOptions?: FetchOptions,
              protected fetchClient = fetch) {
    this.defaultOptions = { ...DefaultFetchOptions, ...defaultOptions };
  }

  public post(url: string, body: any, options?: FetchOptions): Promise<object> {
    const { requestUrl, requestOptions } = this.resolveRequestData('post', url, options, body);
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public put(url: string, body: any, options?: FetchOptions): Promise<object> {
    const { requestUrl, requestOptions } = this.resolveRequestData('put', url, options, body);
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public patch(url: string, body: any, options?: FetchOptions): Promise<object> {
    const { requestUrl, requestOptions } = this.resolveRequestData('patch', url, options, body);
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public get(url: string, options?: FetchOptions): Promise<object> {
    const query = (options && options.params) ? this.getQueryString(options.params, options) : '';
    const { requestUrl, requestOptions } = this.resolveRequestData('get', url, options);
    const targetRequestUrl = `${requestUrl}&${query}`;
    return this.fetchHandleCode(targetRequestUrl, requestOptions);
  }

  public delete(url: string, options?: FetchOptions): Promise<void> {
    const { requestUrl, requestOptions } = this.resolveRequestData('delete', url, options);
    return this.fetchHandleCode(requestUrl, requestOptions);
  }

  public setHeaders(headers: object) {
    this.defaultOptions.headers = Object.assign({}, this.defaultOptions.headers, headers);
  }

  public clearHeaders() {
    delete this.defaultOptions.headers;
  }

  public setBasePath(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public resolveDestination(pathParts: Array<number | string>, basePath: string): string {
    return (pathParts.reduce((resultUrl, routePart) =>
      `${resultUrl}/${routePart}`, basePath) as string).replace(/([^:]\/)\/+/g, "$1");
  }

  public getAllEntities(): Promise<any> {
    return new Promise((_, reject) => {
      reject(new Error('BaseHttpResource #getAllEntities(): need to provide method'));
    });
  }

  private fetchHandleCode(url: string, options: FetchRequestOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fetchClient(url, options)
        .then((response: Response) => {
          if (response && response.status <= 208) {
            response.json().then((data: any) => {
              const result = { ...data };
              result['_status'] = response.status;
              resolve(result);
            });
          } else {
            reject(response);
          }
        })
        .catch((error: any) => reject(error));
    });
  }

  private resolveRequestBody(body: any, options?: FetchOptions): any {
    if (options) {
      if (options.isFormData) {
        return this.transformToFormData(body);
      } else if (options.contentType === 'json') {
        return JSON.stringify(body);
      }
    }
    return body;
  }

  private transformToFormData(body: any, form?: FormData, namespace?: string) {
    const formData = form || new FormData();
    for (const property in body) {
      const value = body[property];
      if (!body.hasOwnProperty(property) || !value) {
        continue;
      }
      const formKey = namespace ?
        (Array.isArray(body) ? `${namespace}[]` : `${namespace}[${property}]`) :
        property;
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

  private resolveRequestData(method: FetchRequestMethod, url: string, options?: FetchOptions, body?: any) {
    const requestUrl = this.resolveRequestUrl(url);
    const mergedOptions = this.resolveRequestOptions(options);
    const decodedBody = this.resolveRequestBody(body, options);
    const requestOptions = this.createRequestOptions(method, mergedOptions, decodedBody);
    return { requestUrl, requestOptions };
  }

  private resolveRequestUrl(url: string): string {
    if (this.baseUrl == null) {
      throw new Error('BaseHttpResource#resolveRequestUrl: baseUrl is not defined');
    }
    const urlPart = `/${url}`;
    let result = (this.baseUrl + urlPart).replace(/([^:]\/)\/+/g, "$1");
    if (this.defaultOptions.timeOffset) {
      const timeOffset = (new Date()).getTimezoneOffset() * -1;
      result += `?timeoffset=${timeOffset}`;
    }
    return result;
  }

  private resolveRequestOptions(options: any) {
    return { ...this.defaultOptions, ...options };
  }

  private createRequestOptions(method: FetchRequestMethod, options: FetchOptions, body?: any): FetchRequestOptions {
    const result: FetchRequestOptions = {
      method,
      headers: this.resolveHeaders(options),
      mode: options.mode,
      cache: options.cache,
      credentials: options.credentials,
      redirect: options.redirect,
      referrer: options.referrer
    };

    if (body) {
      result['body'] = body;
    }

    return result;
  }

  private resolveHeaders(options: FetchOptions) {
    const additionalHeaders = {} as any;
    if (options.contentType === 'json') {
      additionalHeaders['Content-Type'] = 'application/json';
    } else if (options.contentType === 'form-data') {
      additionalHeaders['Content-Type'] = 'multipart/form-data';
    }
    if (options.responseType === 'json') {
      additionalHeaders['Accept'] = 'application/json';
    }

    return { ...options.headers, ...additionalHeaders };
  }

  private getQueryString(params: any, o: FetchOptions): string {
    const options = { ...this.defaultOptions, ...o };
    return Object
      .keys(params)
      .map(k => {
        if (params[k] === null || params[k] === undefined) {
          return '';
        } else if (Array.isArray(params[k])) {
          switch (options.queryParamsDecodeMode) {
            case 'array':
              return params[k]
                .map((val: any) => `${encodeURIComponent(k)}[]=${encodeURIComponent(val)}`)
                .join('&');
            case 'comma':
            default:
              return `${encodeURIComponent(k)}=${params[k].join(',')}`;
          }
        } else {
          return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
        }
      })
      .filter(Boolean)
      .join('&');
  }

}