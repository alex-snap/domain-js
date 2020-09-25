import { ResourceResponse, BaseResource } from './interfaces/BaseResource';
import { decodeQueryString } from './helpers';

import axios, { AxiosRequestConfig } from 'axios';

export type AxiosResourceConfig = AxiosRequestConfig & {
  trailingSlash?: boolean
  timeOffset?: boolean
  queryParamsDecodeMode?: 'comma' | 'array';
};

export const DefaultAxiosRequestConfig: AxiosResourceConfig = {
  responseType: 'json',
  trailingSlash: true,
  timeOffset: true,
  queryParamsDecodeMode: 'comma',
};

export class AxiosResource implements BaseResource {

  constructor(
    protected baseUrl: string,
    private defaultOptions: AxiosResourceConfig = DefaultAxiosRequestConfig) {
  }

  public post(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return axios.post(targetUrl, body, requestOptions);
  }

  public put(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return axios.put(targetUrl, body, requestOptions);
  }

  public patch(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return axios.patch(targetUrl, body, requestOptions);
  }

  public get(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: true };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return axios.get(targetUrl, requestOptions);
  }

  public delete(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: true };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return axios.delete(targetUrl, requestOptions);
  }

  public setHeaders(headers: Record<string, any>): void {
    this.defaultOptions.headers = { ...this.defaultOptions.headers, ...headers };
  }

  public clearHeaders(): void {
    delete this.defaultOptions.headers;
  }

  public setBasePath(baseUrl: string): void {
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
      reject(new Error('AxiosResource#getAllEntities(): need to provide method'));
    });
  }

  public getQueryString(
    params: Record<string, string | number | boolean | (string | number | boolean)[]> = {},
    options?: AxiosRequestConfig
  ): string {
    const { timeOffset, queryParamsDecodeMode } = { ...this.defaultOptions, ...options };

    if (timeOffset) {
      params['timeoffset'] = new Date().getTimezoneOffset() * -1;
    }

    return decodeQueryString(params, queryParamsDecodeMode);
  }

  private resolveRequestParams(settings: {
    path: string,
    options: AxiosResourceConfig,
    useBodyAsQueryParams: boolean,
    body?: Record<string, any>
  }): { targetUrl: string, requestOptions: AxiosResourceConfig } {
    const { path, options, useBodyAsQueryParams, body } = settings;

    let targetUrl = this.resolveRequestUrl(path, options);

    let optionsToUse = options;
    if (useBodyAsQueryParams) {
      const targetOptionsParams = { ...options?.params || {}, ...(body || {}) };
      optionsToUse = { ...options, params: targetOptionsParams };
    }

    const requestOptions = this.getRequestOptions(optionsToUse);
    const queryParams = this.getQueryString(requestOptions.params, requestOptions);
    targetUrl = [targetUrl, queryParams].filter(Boolean).join('?');

    return { targetUrl, requestOptions };
  }


  private getRequestOptions(config?: AxiosResourceConfig): AxiosResourceConfig {
    return { ...this.defaultOptions, ...config };
  }

  private resolveRequestUrl(url: string, o?: AxiosResourceConfig): string {
    if (this.baseUrl == null) {
      throw new Error('AxiosResource#resolveRequestUrl: baseUrl is not defined');
    }

    const urlPart = `/${url}${o.trailingSlash ? '/' : ''}`;
    let result = (this.baseUrl + urlPart).replace(/([^:]\/)\/+/g, '$1');
    return result;
  }

}
