import { BaseRestResource } from '../BaseRestResource';
import { BaseDataMapper } from '../data-mapper';

import { isObject } from '../utils/helpers';
import { BaseEntity } from '../interfaces/BaseEntity';
import { BaseMeta } from '../interfaces/BaseMeta';
import { ArrayMeta } from '../interfaces/ArrayMeta';
import { EntityMeta } from '../interfaces/EntityMeta';
import { RepositorySettings } from './RepositorySettings';
import { DefaultRepositorySettings } from './DefaultRepositorySettings';
import { ResourceResponse } from '../interfaces/ResourceResponse';

export class BaseRepository<
  Entity extends BaseEntity = BaseEntity,
  Meta extends BaseMeta = BaseMeta
> {
  protected requestEntityWrap = (decodedData: any) => decodedData;
  protected entityIdKey: string = 'id';
  protected settings: RepositorySettings = DefaultRepositorySettings;
  protected defaultQueryParams: Record<string, any>;

  constructor(
    private restResource: BaseRestResource,
    private dataMapper?: BaseDataMapper<any, any>
  ) {}

  public save(entity: Partial<Entity> | Entity): Promise<Entity> {
    return this[this.isEntityNew(entity) ? 'create' : 'update'](entity) as Promise<Entity>;
  }

  public create(entity: Partial<Entity> | Entity): Promise<Entity> {
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource()
      .create(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public update(entity: Partial<Entity> | Entity): Promise<Entity> {
    if (this.isEntityNew(entity)) {
      throw new Error('BaseRepository#update(): you can not update a new entity');
    }
    const entityData = this.prepareEntityForRequest(entity);
    const query = this.createQuery(entityData);
    return this.resource(entity)
      .update(query)
      .then((res) => this.processResponse(res)) as Promise<Entity>;
  }

  public patch(entity: Partial<Entity> | Entity): Promise<Entity> {
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

  public delete(entity: Partial<Entity> | Entity): Promise<void> {
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

  public isEntityNew(entity: Partial<Entity> | Entity) {
    return entity[this.entityIdKey] == null;
  }

  public setDefaultQueryParams(params: Record<string, any>) {
    this.defaultQueryParams = params;
  }

  public getResource() {
    return this.restResource;
  }

  protected resource(entity: Partial<Entity> | Entity): BaseRestResource;
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

  protected prepareEntityForRequest(entity: Partial<Entity> | Entity): Partial<Entity> | Entity {
    let result = entity;
    if (this.dataMapper) {
      result = this.dataMapper.decode(entity);
    }
    if (this.requestEntityWrap) {
      result = this.requestEntityWrap(entity);
    }
    return result;
  }

  protected processResponse(
    response: ResourceResponse
  ): EntityMeta | ArrayMeta<Entity, Meta> | string {
    if (!response || typeof response !== 'object') {
      return response as null | undefined | string;
    }

    const meta = { responseStatus: response._status, ...this.settings.extractResponseMeta(response) };
    let result: EntityMeta | ArrayMeta<Entity, Meta>;
    const data = this.settings.extractResponseData(response);
    if (data && Array.isArray(data)) {
      result = Object.assign(data.map(this.encodeEntity, this), { meta });
    } else if (response && Array.isArray(response)) {
      result = Object.assign(response.map(this.encodeEntity, this), { meta });
    } else {
      result = Object.assign(this.encodeEntity(response), { meta });
    }

    // remove _status from origin object
    if ((result as any)._status) {
      delete (result as any)._status;
    }
    return result;
  }

  public setSettings(settings: RepositorySettings): void {
    this.settings = settings;
  }

  public addSettings(settings: RepositorySettings): void {
    this.settings = { ...this.settings, ...settings };
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
      return param[this.entityIdKey];
    }
    return param;
  }

  protected resolveSearchParams(params?: Record<string, any>): object {
    if (params) {
      const searchRequestParams = this.settings.decodeSearchParams(params);
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
