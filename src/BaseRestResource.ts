import { BaseResource, ResourceResponse } from './interfaces/BaseResource';
import { FetchResourceOptions } from "./interfaces/FetchResourceOptions";

type Body = Record<string, any> | FormData;
type Options = Record<string, FetchResourceOptions>;

export class BaseRestResource {
  protected Constructor = BaseRestResource;

  constructor(
    private resource: BaseResource,
    private resourceUrl: string,
    private options?: Options
  ) {}

  public create(body: Body, options?: Options): Promise<ResourceResponse> {
    return this.resource.post(this.resourceUrl, body, this.createOptions(options));
  }

  public update(body: Body, options?: Options): Promise<ResourceResponse> {
    return this.resource.put(this.resourceUrl, body, this.createOptions(options));
  }

  public patch(body: Body, options?: Options): Promise<ResourceResponse> {
    return this.resource.patch(this.resourceUrl, body, this.createOptions(options));
  }

  public get(body?: Body, options?: Options): Promise<ResourceResponse> {
    return this.resource.get(this.resourceUrl, body, this.createOptions(options));
  }

  public delete(body?: Body, options?: Options): Promise<ResourceResponse> {
    return this.resource.delete(this.resourceUrl, body, this.createOptions(options));
  }

  public child(...routeParts: Array<number | string>): BaseRestResource {
    const baseUrl = this.resource.resolveDestination(routeParts, this.resourceUrl);
    return new this.Constructor(this.resource, baseUrl, this.options);
  }

  public getRequestResource(): BaseResource {
    return this.resource;
  }

  private createOptions(options: Options): Options {
    return Object.assign({}, this.options, options);
  }
}
