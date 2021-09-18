import { BaseResourceOptions } from "./BaseResourceOptions";
import { ResourceResponse } from "./ResourceResponse";

export interface BaseResource {
  post(path: string, body: any, options?: BaseResourceOptions): Promise<ResourceResponse>;

  put(path: string, body: any, options?: BaseResourceOptions): Promise<ResourceResponse>;

  patch(path: string, body: any, options?: BaseResourceOptions): Promise<ResourceResponse>;

  get(path: string, body: any, options?: BaseResourceOptions): Promise<ResourceResponse>;

  delete(path: string, body?: any, options?: BaseResourceOptions): Promise<ResourceResponse>;

  setHeaders(headers: Record<string, any>): void;

  clearHeaders(): void;

  setBasePath(basePath: string): void;

  resolveDestination(pathParts: Array<number | string>, basePath: string): string;

  getAllEntities(): Promise<any>;

  getQueryString(): string;
}
