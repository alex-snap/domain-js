import { BaseResourceErrorHandler } from "../src/types/BaseResourceErrorHandler";
import { BaseResource } from "../src/resources/BaseResource";

class FakeResource extends BaseResource {
  public testNotifyErrorHandlers(payload: any) {
    this.notifyErrorHandlers(payload);
  }
}

let testFakeResource: FakeResource;

let errorHandler1: BaseResourceErrorHandler;
let errorHandler2: BaseResourceErrorHandler;
const handlerPayload1 = { p: 1 };

beforeEach(() => {
  testFakeResource = new FakeResource('fake source');
  errorHandler1 = jest.fn();
  errorHandler2 = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('BaseResource instance', () => {
  it('testFakeResource instance of BaseResource', async () => {
    expect(testFakeResource).toBeInstanceOf(BaseResource);
  });
});

describe('addErrorHandler()', () => {
  it('should be defined', () => {
    expect(testFakeResource.addErrorHandler).toBeInstanceOf(Function);
  });
});

describe('notifyErrorHandlers()', () => {
  it('should notify single handler with payload', () => {
    testFakeResource.addErrorHandler(errorHandler1);
    testFakeResource.testNotifyErrorHandlers(handlerPayload1);
    expect(errorHandler1).toHaveBeenCalledWith(handlerPayload1);
  });
  it('should notify multiple handlers with payload', () => {
    testFakeResource.addErrorHandler(errorHandler1);
    testFakeResource.addErrorHandler(errorHandler2);
    testFakeResource.testNotifyErrorHandlers(handlerPayload1);
    expect(errorHandler1).toHaveBeenCalledWith(handlerPayload1);
    expect(errorHandler2).toHaveBeenCalledWith(handlerPayload1);
  });
  it('should work without handlers', () => {
    testFakeResource.testNotifyErrorHandlers(handlerPayload1);
    expect(true).toBe(true);
  });

});
