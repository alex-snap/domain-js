import { BaseRestResource } from "./BaseRestResource";
import { BaseDataMapper } from "./data-mapper/index";

import { isObject } from "./helpers";

export interface RepositorySettings {
  pageKey: string
  perPageKey: string
  sortKey: string
  searchKey: string
}

export interface ArrayMeta<Entity extends object = {}, Meta extends any = {}> extends Array<Entity> {
  meta?: Meta
}

const DefaultRepositorySettings = {
  pageKey: 'page',
  perPageKey: 'per_page',
  sortKey: 'order',
  searchKey: 'search'
};

export class BaseRepository<Entity extends {} = {}, EntityMeta extends {} = {}> {
  protected requestEntityWrap = (decodedData: any) => decodedData;
  protected entityIdName: string = 'id';
  protected settings: RepositorySettings = DefaultRepositorySettings;
  protected defaultQueryParams: any;

  constructor(
    private restResource: BaseRestResource,
    private dataMapper?: BaseDataMapper<any, any>) {
  }

  public save(entity: Entity): Promise<Entity> {
    return this[this.isEntityNew(entity) ? 'create' : 'update'](entity) as Promise<Entity>;
  }

  public create(entity: Entity): Promise<Entity> {
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource().create(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public update(entity: Entity): Promise<Entity> {
    if (this.isEntityNew(entity)) {
      throw (new Error('BaseRepository#update(): you can not update a new entity'))
    }
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource(entity).update(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public patch(entity: Entity): Promise<Entity> {
    if (this.isEntityNew(entity)) {
      throw (new Error('BaseRepository#update(): you can not patch a new entity'));
    }
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource(entity).patch(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public load(params?: object): Promise<ArrayMeta<Entity, EntityMeta>> {
    let query;
    if (this.defaultQueryParams != null) {
      query = Object.assign({}, { params: this.defaultQueryParams }, params);
    } else {
      query = params;
    }
    return this.resource().get(query)
      .then((res) => this.processResponse(res)) as Promise<ArrayMeta<Entity, EntityMeta>>;
  }

  public loadById(id: string | number, params?: object): Promise<Entity> {
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
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public massDelete(entities: Entity[]): Promise<any> {
    const promisesBatch = [] as Array<Promise<any>>;
    entities.forEach((entity) => {
      const promise = this.delete(entity);
      promisesBatch.push(promise);
    });
    return Promise.all(promisesBatch);
  }

  public delete(entity: Entity): Promise<void> {
    if (this.isEntityNew(entity)) {
      throw (new Error('BaseRepository#delete(): you can not update a new entity'));
    }
    return this.resource(entity).delete()
      .then((res) => this.processResponse(res)) as Promise<void>;
  }

  public search(params?: any): Promise<ArrayMeta<Entity, EntityMeta>> {
    const searchParams = this.resolveSearchParams(params);
    const requestBody = Object.assign({}, searchParams, this.defaultQueryParams);
    return this.resource().get(requestBody)
      .then((res) => this.processResponse(res)) as Promise<ArrayMeta<Entity, EntityMeta>>;
  }

  public isEntityNew(entity: Entity): boolean {
    return entity && (entity as any)[this.entityIdName] == null;
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

  protected prepareEntityForRequest(entity: Entity): Entity {
    let result = entity;
    if (this.dataMapper) {
      result = this.dataMapper.decode(entity);
    }
    if (this.requestEntityWrap) {
      result = this.requestEntityWrap(entity);
    }
    return result;
  }

  protected async processResponse(response: any): Promise<Entity | ArrayMeta<Entity, EntityMeta>> {
    let result = { meta: null } as any;
    
    let responseJson;
    try {
      responseJson = response && await response.json();
    } catch (e) { 
      responseJson = response;
    }
    if (!responseJson) {
      return;
    }

    let data;
    let meta = { responseStatus: response._status };

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

  private encodeEntity(entityData: any): Entity {
    if (this.dataMapper) {
      return this.dataMapper.encode(entityData);
    }

    return entityData;
  }
}
