import { BaseResource } from './interfaces/BaseResource';
import { Storage } from './interfaces/Storage';
import { uuid } from "./helpers";

export class StorageResource implements BaseResource {
  constructor(private storageKey: string,
              protected storage: Storage,
              private defaultOptions: any = {}) {
  }

  public post(path: string, body: any, options?: any): Promise<any> {
    if (options?.entityIdName != null) {
      const id = uuid();
      const resultPath = `${path}/${id}`;
      const resultBody = { ...body, [options.entityIdName]: id };

      return this.storage.setItem(resultPath, resultBody)
        .then((data) => this.processExtractedData(data))
        .then((data) => this.addEntityIdPath(resultPath).then(() => data))
    }

    return this.storage.setItem(path, body)
      .then((data) => this.processExtractedData(data))
  }

  public put(path: string, body: any, options?: any): Promise<any> {
    return this.storage.setItem(path, body).then((data) => this.processExtractedData(data));
  }

  public patch(path: string, body: any, options?: any): Promise<any> {
    return this.get(path)
      .then(((savedBody = {}) => {
        const newBody = { ...savedBody, ...body };
        return this.put(path, newBody);
      }));
  }

  public get(path: string, body?: any, options?: any): Promise<any> {
    return this.storage.getItem(path)
      .then((data) => this.processExtractedData(data))
  }

  public delete(path: string, options?: any): Promise<void> {

    if (options?.entityIdName != null) {
      return this.storage.removeItem(path)
        .then((response) => this.removeEntityIdPath(path).then(() => response));
    }

    return this.storage.removeItem(path);
  }

  public setHeaders(headers: object) {
    this.defaultOptions.headers = Object.assign({}, this.defaultOptions.headers, headers);
  }

  public clearHeaders() {
    delete this.defaultOptions.headers;
  }

  public setBasePath(basePath: string) {
    this.storageKey = basePath;
  }

  public resolveDestination(pathParts: Array<number | string>, basePath: string): string {
    return pathParts.reduce((resultUrl, routePart) =>
      `${resultUrl}/${routePart}`, basePath) as string;
  }

  public getAllEntities(): Promise<any[]> {
    return this.storage.getItem(this.idsStorageKey)
      .then((pathsMap = {}) => {
        if (pathsMap) {
          return Object.keys(pathsMap);
        }
        return [];
      })
      .then((paths) => {
        if (paths && paths.length) {
          const promises: Array<Promise<any>> = paths.map((path) => this.get(path));
          return Promise.all(promises);
        }
        return [];
      })
  }

  private processExtractedData(data: any): any {
    return data;
  }

  private addEntityIdPath(id: number | string): Promise<any> {
    return this.storage.getItem(this.idsStorageKey)
      .then((idsMap: any) => {
        idsMap = idsMap || {};
        idsMap[id] = true;
        return this.storage.setItem(this.idsStorageKey, idsMap);
      });
  }

  private removeEntityIdPath(id: number | string): Promise<any> {
    return this.storage.getItem(this.idsStorageKey)
      .then((idsMap: any) => {
        idsMap = idsMap || {};
        delete idsMap[id];
        return this.storage.setItem(this.idsStorageKey, idsMap);
      });
  }

  private get idsStorageKey(): string {
    return `${this.storageKey}/entities_ids`;
  }

  public getQueryString(): string {
    return 'not supported';
  }

}
