import { BaseResource } from './interfaces/BaseResource';
import { BaseResourceOptions } from "./interfaces/BaseResourceOptions";
import { ResourceResponse } from "./interfaces/ResourceResponse";

type Body = Record<string, any> | null;

export class BaseRestResource {
  protected Constructor = BaseRestResource;

  constructor(
    private resource: BaseResource,
    private resourceUrl: string,
    private options?: BaseResourceOptions
  ) {}

  public create(body: Body = null, options?: BaseResourceOptions): Promise<ResourceResponse> {
    return this.resource.post(this.resourceUrl, body, this.createOptions(options));
  }

  public update(body: Body = null, options?: BaseResourceOptions): Promise<ResourceResponse> {
    return this.resource.put(this.resourceUrl, body, this.createOptions(options));
  }

  public patch(body: Body = null, options?: BaseResourceOptions): Promise<ResourceResponse> {
    return this.resource.patch(this.resourceUrl, body, this.createOptions(options));
  }

  public get(body?: Body, options?: BaseResourceOptions): Promise<ResourceResponse> {
    return this.resource.get(this.resourceUrl, body, this.createOptions(options));
  }

  public delete(body?: Body, options?: BaseResourceOptions): Promise<ResourceResponse> {
    return this.resource.delete(this.resourceUrl, body, this.createOptions(options));
  }

  public child(...routeParts: Array<number | string>): BaseRestResource {
    const baseUrl = this.resource.resolveDestination(routeParts, this.resourceUrl);
    return new this.Constructor(this.resource, baseUrl, this.options);
  }

  public getRequestResource(): BaseResource {
    return this.resource;
  }

  private createOptions(options: BaseResourceOptions): BaseResourceOptions {
    return Object.assign({}, this.options, options);
  }
}
