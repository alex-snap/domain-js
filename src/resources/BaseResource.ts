import { isFunction } from "../utils";
import { PromiseUrlResolver } from "../types/PromiseUrlResolver";
import { BaseResourceErrorHandler } from "../types/BaseResourceErrorHandler";

export class BaseResource {
  protected errorHandlers: BaseResourceErrorHandler[] = [];
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

  public addErrorHandler(handler: BaseResourceErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const handlerIndex = this.errorHandlers.findIndex((h) => h === handler);
      if (handlerIndex > -1) {
        this.errorHandlers.splice(handlerIndex, 1);
      }
    }
  }

  protected notifyErrorHandlers(payload: any): void {
    if (this.errorHandlers?.length) {
      for (let i = 0; i < this.errorHandlers?.length; i++) {
        this.errorHandlers[i](payload);
      }
    }
  }
}
