import { BaseResource } from '../../interfaces/BaseResource';
import { decodeQueryString, resolveHeaders } from '../../utils/helpers';

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AxiosResourceOptions } from './AxiosResourceOptions';
import { DefaultAxiosResourceOptions } from './DefaultAxiosResourceOptions';
import { ResourceResponse } from '../../interfaces/ResourceResponse';
import { resolveAxiosRequestBody } from "./helpers";

export class AxiosResource implements BaseResource {

  constructor(
    protected baseUrl: string,
    private defaultOptions: AxiosResourceOptions = DefaultAxiosResourceOptions) {
  }

  public post(path: string, body?: Record<string, any>, options?: AxiosResourceOptions): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    const decodedBody = resolveAxiosRequestBody(body, options);
    return this.decorateRequest(axios.post(targetUrl, decodedBody, requestOptions));
  }

  public put(path: string, body?: Record<string, any>, options?: AxiosResourceOptions): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    const decodedBody = resolveAxiosRequestBody(body, options);
    return this.decorateRequest(axios.put(targetUrl, decodedBody, requestOptions));
  }

  public patch(path: string, body?: Record<string, any>, options?: AxiosResourceOptions): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    const decodedBody = resolveAxiosRequestBody(body, options);
    return this.decorateRequest(axios.patch(targetUrl, decodedBody, requestOptions));
  }

  public get(path: string, body?: Record<string, any>, options?: AxiosResourceOptions): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: true };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return this.decorateRequest(axios.get(targetUrl, requestOptions));
  }

  public delete(path: string, body?: Record<string, any>, options?: AxiosResourceOptions): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: true };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return this.decorateRequest(axios.delete(targetUrl, requestOptions));
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
    options?: AxiosResourceOptions
  ): string {
    const { queryParamsDecodeMode } = { ...this.defaultOptions, ...options };
    return decodeQueryString(params, queryParamsDecodeMode);
  }

  private handleResponse(response: AxiosResponse<any>): ResourceResponse {
    const data = response.data;
    if (typeof data === 'object') {
      return Object.assign(data, { ['_status']: response.status });
    }
    return data;
  }

  private decorateRequest(request: Promise<any>): Promise<ResourceResponse> {
    return request
      .then((res) => this.handleResponse(res))
      .catch((error: AxiosError) => {
        throw { _status: error.code, data: error };
      })
  }

  private resolveRequestParams(settings: {
    path: string,
    options: AxiosResourceOptions,
    useBodyAsQueryParams: boolean,
    body?: Record<string, any>
  }): { targetUrl: string, requestOptions: AxiosRequestConfig } {
    const { path, options, useBodyAsQueryParams, body } = settings;

    const resourceConfig = { ...this.defaultOptions, ...options };
    let requestOptions = this.getRequestOptions(resourceConfig);
    if (useBodyAsQueryParams) {
      const params = { ...options?.params || {}, ...(body || {}) };
      requestOptions = { ...requestOptions, params };
    }

    // add timeoffset
    if (resourceConfig?.timeOffset) {
      if (!requestOptions?.params) {
        requestOptions.params = {};
      }
      requestOptions.params['timeoffset'] = new Date().getTimezoneOffset() * -1;
    }

    // add params serializer
    if (!resourceConfig?.paramsSerializer) {
      requestOptions.paramsSerializer = function(params) {
        return decodeQueryString(params, resourceConfig.queryParamsDecodeMode);
      }
    }

    // if form data, use headers
    requestOptions.headers = resolveHeaders(requestOptions);

    const targetUrl = this.resolveRequestUrl(path, resourceConfig);

    return { targetUrl, requestOptions };
  }

  private getRequestOptions(options?: AxiosResourceOptions): AxiosRequestConfig {
    const { trailingSlash, queryParamsDecodeMode, timeOffset, ...other } = options;
    return other;
  }

  private resolveRequestUrl(url: string, o?: AxiosResourceOptions): string {
    if (this.baseUrl == null) {
      throw new Error('AxiosResource#resolveRequestUrl: baseUrl is not defined');
    }

    const urlPart = `/${url}${o?.trailingSlash ? '/' : ''}`;
    return (this.baseUrl + urlPart).replace(/([^:]\/)\/+/g, '$1');
  }

}
