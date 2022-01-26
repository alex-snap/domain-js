import {isPromise} from "../utils";

export class BaseResource {
  constructor(protected urlSource: string | Promise<String>) {
  }

  public getBaseUrl(): Promise<string> {
    if (isPromise(this.urlSource)) {
      return this.urlSource as Promise<string>;
    } else if (typeof this.urlSource === 'string') {
      return new Promise<string>(resolve => resolve(this.urlSource as string));
    } else {
      throw new Error('BaseResource#resolveBaseUrl(): urlSource must be string or Promise<string>');
    }
  }

  public setUrlSource(urlSource: string | Promise<String>): void {
    this.urlSource = urlSource;
  }
}
