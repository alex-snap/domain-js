import { BaseRestResource } from './BaseRestResource';
import { BaseDataMapper } from './data-mapper/index';

import { isObject } from './helpers';
import { ResourceResponse } from './interfaces/BaseResource';

export interface RepositorySettings {
  pageKey: string;
  perPageKey: string;
  sortKey: string;
  searchKey: string;
}

export interface BaseEntity {
  [key: string]: unknown;
}

export interface EntityMeta extends BaseEntity {
  meta: BaseEntity;
}

export interface BaseMeta {
  [key: string]: unknown;
  responseStatus: number;
}

export interface ArrayMeta<Entity extends BaseEntity = BaseEntity, Meta extends BaseMeta = BaseMeta>
  extends Array<Entity> {
  meta?: Meta;
}

const DefaultRepositorySettings = {
  pageKey: 'page',
  perPageKey: 'per_page',
  sortKey: 'order',
  searchKey: 'search',
};

export class BaseRepository<
  Entity extends BaseEntity = BaseEntity,
  Meta extends BaseMeta = BaseMeta
> {
  protected requestEntityWrap = (decodedData: any) => decodedData;
  protected entityIdName: string = 'id';
  protected settings: RepositorySettings = DefaultRepositorySettings;
  protected defaultQueryParams: Record<string, any>;

  constructor(
    private restResource: BaseRestResource,
    private dataMapper?: BaseDataMapper<any, any>
  ) {}

  public save(entity: Entity): Promise<Entity> {
    return this[this.isEntityNew(entity) ? 'create' : 'update'](entity) as Promise<Entity>;
  }

  public create(entity: Entity): Promise<Entity> {
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource()
      .create(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public update(entity: Entity): Promise<Entity> {
    if (this.isEntityNew(entity)) {
      throw new Error('BaseRepository#update(): you can not update a new entity');
    }
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource(entity)
      .update(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public patch(entity: Entity): Promise<Entity> {
    if (this.isEntityNew(entity)) {
      throw new Error('BaseRepository#update(): you can not patch a new entity');
    }
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource(entity)
      .patch(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public load(params?: object): Promise<ArrayMeta<Entity, Meta>> {
    let query;
    if (this.defaultQueryParams != null) {
      query = Object.assign({}, { params: this.defaultQueryParams }, params);
    } else {
      query = params;
    }
    return this.resource()
      .get(query)
      .then((res) => this.processResponse(res)) as Promise<ArrayMeta<Entity, Meta>>;
  }

  public loadById(id: string | number, params?: object): Promise<Entity> {
    if (id == null) {
      throw new Error('BaseRepository#loadById(): id should not be null or undefined');
    }
    let query;
    if (this.defaultQueryParams != null) {
      query = Object.assign({}, { params: this.defaultQueryParams }, params);
    } else {
      query = params;
    }
    return this.resource(id)
      .get(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public massDelete(entities: Entity[]) {
    const promisesBatch = entities.map((entity) => this.delete(entity));
    return Promise.all(promisesBatch);
  }

  public delete(entity: Entity): Promise<void> {
    if (this.isEntityNew(entity)) {
      throw new Error('BaseRepository#delete(): you can not update a new entity');
    }
    return this.resource(entity)
      .delete()
      .then((res) => this.processResponse(res)) as Promise<void>;
  }

  public search(params?: Record<string, any>): Promise<ArrayMeta<Entity, Meta>> {
    const searchParams = this.resolveSearchParams(params);
    const requestBody = Object.assign({}, searchParams, this.defaultQueryParams);
    return this.resource()
      .get(requestBody)
      .then((res) => this.processResponse(res)) as Promise<ArrayMeta<Entity, Meta>>;
  }

  public isEntityNew(entity: Entity) {
    return entity[this.entityIdName] == null;
  }

  public setDefaultQueryParams(params: Record<string, any>) {
    this.defaultQueryParams = params;
  }

  public getResource() {
    return this.restResource;
  }

  protected resource(entity: Entity): BaseRestResource;
  protected resource(...params: (undefined | string | number)[]): BaseRestResource;
  protected resource(...params: never): BaseRestResource;
  protected resource(...params: any[]) {
    if (params.length === 1) {
      return this.restResource.child(this.resolveResourceParamLiteral(params[0]));
    } else if (params.length) {
      return this.restResource.child(...params);
    }
    return this.restResource;
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

  protected async processResponse(
    response: ResourceResponse
  ): Promise<EntityMeta | ArrayMeta<Entity, Meta> | string> {
    if (response == null || typeof response === 'string') {
      return response as null | undefined | string;
    }

    let { _status, ...entity } = response;
    const meta = { meta: { responseStatus: _status, ...entity.meta } };
    let result: EntityMeta | ArrayMeta<Entity, Meta> =
      entity.data && Array.isArray(entity.data)
        ? Object.assign(entity.data.map(this.encodeEntity, this), meta)
        : Object.assign(this.encodeEntity(entity), meta);

    return result;
  }

  public setSettings(settings: RepositorySettings): void {
    this.settings = settings;
  }

  /**
   * Private helpers methods
   */

  private createQuery(entityData: FormData | object) {
    if (entityData instanceof FormData) {
      return entityData;
    }

    return { ...entityData, ...this.defaultQueryParams };
  }

  private resolveResourceParamLiteral(
    param: { [key: string]: string | number } | string
  ): undefined | string | number {
    if (isObject(param)) {
      return param[this.entityIdName];
    }
    return param;
  }

  protected resolveSearchParams(params?: Record<string, any>): object {
    if (params) {
      const { page, per_page, sort, response, ...search } = params;
      const searchRequestParams = {
        [this.settings.searchKey]: search,
        [this.settings.pageKey]: page,
        [this.settings.perPageKey]: per_page,
        [this.settings.sortKey]: sort,
        response,
      };

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
