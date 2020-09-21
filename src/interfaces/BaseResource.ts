export type ResourceResponse =
  | {
      [key: string]: any;
      _status: number;
    }
  | string;

export interface BaseResource {
  post(path: string, body: any, options?: any): Promise<ResourceResponse>;

  put(path: string, body: any, options?: any): Promise<ResourceResponse>;

  patch(path: string, body: any, options?: any): Promise<ResourceResponse>;

  get(path: string, body: any, options?: any): Promise<ResourceResponse>;

  delete(path: string, body?: any, options?: any): Promise<ResourceResponse>;

  setHeaders(headers: object): void;

  clearHeaders(): void;

  setBasePath(basePath: string): void;

  resolveDestination(pathParts: Array<number | string>, basePath: string): string;

  getAllEntities(): Promise<any>;

  getQueryString(): string;
}
