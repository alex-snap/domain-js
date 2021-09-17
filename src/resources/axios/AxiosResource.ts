import { ResourceResponse, BaseResource } from '../../interfaces/BaseResource';
import { decodeQueryString } from "../../utils/helpers";

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AxiosResourceConfig } from './AxiosResourceConfig';
import { DefaultAxiosRequestConfig } from './DefaultAxiosRequestConfig';

export class AxiosResource implements BaseResource {

  constructor(
    protected baseUrl: string,
    private defaultOptions: AxiosResourceConfig = DefaultAxiosRequestConfig) {
  }

  public post(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return this.decorateRequest(axios.post(targetUrl, body, requestOptions));
  }

  public put(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return this.decorateRequest(axios.put(targetUrl, body, requestOptions));
  }

  public patch(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: false };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return this.decorateRequest(axios.patch(targetUrl, body, requestOptions));
  }

  public get(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
    const resolverSettings = { path, options, body, useBodyAsQueryParams: true };
    const { targetUrl, requestOptions } = this.resolveRequestParams(resolverSettings);
    return this.decorateRequest(axios.get(targetUrl, requestOptions));
  }

  public delete(path: string, body?: Record<string, any>, options?: AxiosResourceConfig): Promise<ResourceResponse> {
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
    options?: AxiosResourceConfig
  ): string {
    const { queryParamsDecodeMode } = { ...this.defaultOptions, ...options };
    return decodeQueryString(params, queryParamsDecodeMode);
  }

  private handleResponse(response: AxiosResponse<any>): ResourceResponse {
    return { _status: response.status, data: response.data };
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
    options: AxiosResourceConfig,
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

    const targetUrl = this.resolveRequestUrl(path, resourceConfig);

    return { targetUrl, requestOptions };
  }


  private getRequestOptions(config?: AxiosResourceConfig): AxiosRequestConfig {
    const { trailingSlash, queryParamsDecodeMode, timeOffset, ...other } = config;
    return other;
  }

  private resolveRequestUrl(url: string, o?: AxiosResourceConfig): string {
    if (this.baseUrl == null) {
      throw new Error('AxiosResource#resolveRequestUrl: baseUrl is not defined');
    }

    const urlPart = `/${url}${o?.trailingSlash ? '/' : ''}`;
    return (this.baseUrl + urlPart).replace(/([^:]\/)\/+/g, '$1');
  }

}
