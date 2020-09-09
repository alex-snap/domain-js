import { BaseResource } from './interfaces/BaseResource';

export class BaseRestResource {

  protected Constructor = BaseRestResource;

  constructor(private resource: BaseResource,
              private resourceUrl: string,
              private options?: any) {
  }

  public create(body: any, options?: any): Promise<any> {
    return this.resource.post(this.resourceUrl, body, this.createOptions(options));
  }

  public update(body: any, options?: any): Promise<any> {
    return this.resource.put(this.resourceUrl, body, this.createOptions(options));
  }

  public patch(body: any, options?: any): Promise<any> {
    return this.resource.patch(this.resourceUrl, body, this.createOptions(options));
  }

  public get(body?: any, options?: any): Promise<any> {
    return this.resource.get(this.resourceUrl, body, this.createOptions(options));
  }

  public delete(body?: any, options?: any): Promise<any> {
    return this.resource.delete(this.resourceUrl, body, this.createOptions(options));
  }

  public child(...routeParts: Array<number | string>): BaseRestResource {
    const baseUrl = this.resource.resolveDestination(routeParts, this.resourceUrl);
    return new this.Constructor(this.resource, baseUrl, this.options);
  }

  public getRequestResource(): BaseResource {
    return this.resource;
  }

  private createOptions(options: any): any {
    return Object.assign({}, this.options, options);
  }
}
