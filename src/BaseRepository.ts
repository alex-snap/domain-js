import { BaseRestResource } from "./BaseRestResource";
import { BaseDataMapper } from "./data-mapper/index";

import { isObject } from "./helpers";

interface RepositorySettings {
  pageKey: string
  perPageKey: string
  sortKey: string
  searchKey: string
}

const DefaultRepositorySettings = {
  pageKey: 'page',
  perPageKey: 'per_page',
  sortKey: 'order',
  searchKey: 'search'
};

export class BaseRepository {
  protected requestEntityWrap = (decodedData: any) => decodedData;
  protected entityIdName: string = 'id';
  protected settings: RepositorySettings = DefaultRepositorySettings;
  protected defaultQueryParams: any;

  constructor(
    private restResource: BaseRestResource,
    private dataMapper?: BaseDataMapper<any, any>) {
  }

  public save(entity: object): Promise<any> {
    return this[this.isEntityNew(entity) ? 'create' : 'update'](entity);
  }

  public create(entity: object): Promise<any> {
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource().create(query)
      .then((res) => this.processResponse(res));
  }

  public update(entity: object): Promise<any> {
    if (this.isEntityNew(entity)) {
      throw (new Error('BaseRepository#update(): you can not update a new entity'))
    }
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource(entity).update(query)
      .then((res) => this.processResponse(res));
  }

  public patch(entity: object): Promise<any> {
    if (this.isEntityNew(entity)) {
      throw (new Error('BaseRepository#update(): you can not patch a new entity'));
    }
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource(entity).patch(query)
      .then((res) => this.processResponse(res));
  }

  public load(params?: object): Promise<any> {
    let query;
    if (this.defaultQueryParams != null) {
      query = Object.assign({}, { params: this.defaultQueryParams }, params);
    } else {
      query = params;
    }
    return this.resource().get(query)
      .then((res) => this.processResponse(res));
  }

  public loadById(id: string | number, params?: object): Promise<any> {
    if (id == null) {
      throw (new Error('BaseRepository#loadById(): id should not be null or undefined'));
    }
    let query;
    if (this.defaultQueryParams != null) {
      query = Object.assign({}, { params: this.defaultQueryParams }, params);
    } else {
      query = params;
    }
    return this.resource(id).get(query)
      .then((res) => this.processResponse(res));
  }

  public massDelete(entities: object[]): Promise<any> {
    const promisesBatch = [] as Array<Promise<any>>;
    entities.forEach((entity) => {
      const promise = this.delete(entity);
      promisesBatch.push(promise);
    });
    return Promise.all(promisesBatch);
  }

  public delete(entity: object): Promise<any> {
    if (this.isEntityNew(entity)) {
      throw (new Error('BaseRepository#delete(): you can not update a new entity'));
    }
    return this.resource(entity).delete()
      .then((res) => this.processResponse(res));
  }

  public search(params?: any): Promise<any> {
    const searchParams = this.resolveSearchParams(params);
    const requestBody = Object.assign({}, searchParams, this.defaultQueryParams);
    return this.resource().get(requestBody)
      .then((res) => this.processResponse(res));
  }

  public isEntityNew(entity: any): boolean {
    return entity && entity[this.entityIdName] == null;
  }

  public setDefaultQueryParams(params: any) {
    this.defaultQueryParams = params;
  }

  public getResource(): BaseRestResource {
    return this.restResource;
  }

  protected resource(...params: any): BaseRestResource {
    if (!params || params.length === 0) {
      return this.restResource;
    } else if (params.length === 1) {
      return this.restResource.child(this.resolveResourceParamLiteral(params[0]));
    }

    return this.restResource.child(...params);
  }

  protected prepareEntityForRequest(entity: object): object {
    let result = entity;
    if (this.dataMapper) {
      result = this.dataMapper.decode(entity);
    }
    if (this.requestEntityWrap) {
      result = this.requestEntityWrap(entity);
    }
    return result;
  }

  protected async processResponse(response: any): Promise<any> {
    let result = { meta: null } as any;
    
    let responseJson;
    try {
      responseJson = response && await response.json();
    } catch (e) { 
      // nothing
    }
    if (!responseJson) {
      return;
    }

    let data;
    let meta = { responseStatus: response.status };

    if (responseJson.data && Array.isArray(responseJson.data)) {
      data = responseJson.data;
      meta = Object.assign(meta, responseJson.meta);
    } else {
      data = responseJson;
    }

    if (Array.isArray(data)) {
      result = data.map((entityData: any) => this.encodeEntity(entityData)) as any;
    } else {
      result = this.encodeEntity(data) as any;
    }

    result.meta = meta;

    return result;
  }

  public setSettings(settings: RepositorySettings): void {
    this.settings = settings;
  }

  /**
   * Private helpers methods
   */

  private createQuery(entityData: any) {
    if (entityData instanceof FormData) {
      return entityData;
    }

    if (this.defaultQueryParams != null) {
      return { ...entityData, ...this.defaultQueryParams };
    }

    return entityData;
  }

  private resolveResourceParamLiteral(param: any) {
    if (isObject(param)) {
      return param[this.entityIdName];
    }
    return param;
  }

  protected resolveSearchParams(params?: any): object {
    if (params) {
      const { page, per_page, sort, response, ...search } = params;
      const searchRequestParams = {
        [this.settings.searchKey]: search,
        [this.settings.pageKey]: page,
        [this.settings.perPageKey]: per_page,
        [this.settings.sortKey]: sort,
        response
      } as any;
      
      for (const key of Object.keys(searchRequestParams)) {
        if (searchRequestParams[key] == null || Number.isNaN(searchRequestParams[key])) {
          delete searchRequestParams[key];
        }
      }
      return searchRequestParams;
    }
    return {};
  }

  private encodeEntity(entityData: any): object {
    if (this.dataMapper) {
      return this.dataMapper.encode(entityData);
    }

    return entityData;
  }
}
