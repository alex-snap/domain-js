export interface BaseResource {

  post(path: string, body: any, options?: any): Promise<object>

  put(path: string, body: any, options?: any): Promise<object>

  patch(path: string, body: any, options?: any): Promise<object>

  get(path: string, body: any, options?: any): Promise<object>

  delete(path: string, body?: any, options?: any): Promise<void>

  setHeaders(headers: object): void

  clearHeaders(): void

  setBasePath(basePath: string): void

  resolveDestination(pathParts: Array<number | string>, basePath: string): string

  getAllEntities(): Promise<any>

  getQueryString(): string

}
