import { IBaseResource } from './interfaces/IBaseResource';
import { ResourceResponse } from "./types/ResourceResponse";
import {FetchResourceOptions} from "./resources/fetch/FetchResourceOptions";
import {AxiosResourceOptions} from "./resources/axios/AxiosResourceOptions";

type Body = Record<string, any> | null;

type BaseRestResourceOptions = FetchResourceOptions | AxiosResourceOptions;

export class BaseRestResource {
  protected Constructor = BaseRestResource;

  constructor(
    private resource: IBaseResource,
    private resourceUrl: string,
    private options?: BaseRestResourceOptions
  ) {}

  public create(body: Body = null, options?: BaseRestResourceOptions): Promise<ResourceResponse> {
    return this.resource.post(this.resourceUrl, body, this.createOptions(options));
  }

  public update(body: Body = null, options?: BaseRestResourceOptions): Promise<ResourceResponse> {
    return this.resource.put(this.resourceUrl, body, this.createOptions(options));
  }

  public patch(body: Body = null, options?: BaseRestResourceOptions): Promise<ResourceResponse> {
    return this.resource.patch(this.resourceUrl, body, this.createOptions(options));
  }

  public get(body?: Body, options?: BaseRestResourceOptions): Promise<ResourceResponse> {
    return this.resource.get(this.resourceUrl, body, this.createOptions(options));
  }

  public delete(body?: Body, options?: BaseRestResourceOptions): Promise<ResourceResponse> {
    return this.resource.delete(this.resourceUrl, body, this.createOptions(options));
  }

  public child(...routeParts: Array<number | string>): BaseRestResource {
    const baseUrl = this.resource.resolveDestination(routeParts, this.resourceUrl);
    return new this.Constructor(this.resource, baseUrl, this.options);
  }

  public getRequestResource(): IBaseResource {
    return this.resource;
  }

  private createOptions(options: BaseRestResourceOptions): BaseRestResourceOptions {
    return Object.assign({}, this.options, options);
  }
}
