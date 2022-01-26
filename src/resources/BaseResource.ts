import { isFunction } from "../utils";
import { PromiseUrlResolver } from "./PromiseUrlResolver";

export class BaseResource {
  constructor(protected urlSource: string | PromiseUrlResolver) {
  }

  public getBaseUrl(): Promise<string> {
    if (isFunction(this.urlSource)) {
      return this.urlSource() as Promise<string>;
    } else if (typeof this.urlSource === 'string') {
      return new Promise<string>(resolve => resolve(this.urlSource as string));
    } else {
      throw new Error('BaseResource#resolveBaseUrl(): urlSource must be string or Promise<string>');
    }
  }

  public setUrlSource(urlSource: string | PromiseUrlResolver): void {
    this.urlSource = urlSource;
  }
}
