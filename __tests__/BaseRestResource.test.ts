import { BaseRestResource } from '../src/BaseRestResource';
import { BaseResource } from '../src/interfaces/BaseResource';

let testRestResource: BaseRestResource;
let fakeFetchResource: BaseResource;
const successResponseData = { data: 'success', _status: 200 };
const resourceRelativePath = 'test';
const resourceChildPath = 'test/child/';

const createResourceMockResponse = (response?: any) => {
  return jest.fn()
    .mockImplementation(() => Promise.resolve(response))
};

beforeEach(() => {

  fakeFetchResource = {
    post: createResourceMockResponse(successResponseData),
    put: createResourceMockResponse(successResponseData),
    patch: createResourceMockResponse(successResponseData),
    get: createResourceMockResponse(successResponseData),
    delete: createResourceMockResponse(),
    setHeaders: () => { },
    clearHeaders: () => { },
    setBasePath: () => { },
    resolveDestination: () => resourceChildPath,
    getAllEntities: createResourceMockResponse([])
  };

  testRestResource = new BaseRestResource(fakeFetchResource, resourceRelativePath);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('BaseRestResource instance', () => {
  it('testRestResource instance of BaseRestResource', async () => {
    expect(testRestResource).toBeInstanceOf(BaseRestResource);
  });
});

describe('Create method', () => {
  it('method should be defined', () => {
    expect(testRestResource.create).toBeInstanceOf(Function);
  });
  it('should called with expected params', async () => {
    try {
      const expectedUrl = expect.stringMatching(resourceRelativePath);
      const expectedBody = expect.objectContaining({ data: 1 });
      const response = await testRestResource.create({ data: 1 });
      expect(fakeFetchResource.post)
        .toHaveBeenCalledWith(expectedUrl, expectedBody, expect.any(Object));
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
});

describe('Update method', () => {
  it('method should be defined', () => {
    expect(testRestResource.update).toBeInstanceOf(Function);
  });
  it('should called with expected params', async () => {
    try {
      const expectedUrl = expect.stringMatching(resourceRelativePath);
      const expectedBody = expect.objectContaining({ data: 1 });
      const response = await testRestResource.update({ data: 1 });
      expect(fakeFetchResource.put)
        .toHaveBeenCalledWith(expectedUrl, expectedBody, expect.any(Object));
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
});

describe('Patch method', () => {
  it('method should be defined', () => {
    expect(testRestResource.patch).toBeInstanceOf(Function);
  });
  it('should called with expected params', async () => {
    try {
      const expectedUrl = expect.stringMatching(resourceRelativePath);
      const expectedBody = expect.objectContaining({ data: 1 });
      const response = await testRestResource.patch({ data: 1 });
      expect(fakeFetchResource.patch)
        .toHaveBeenCalledWith(expectedUrl, expectedBody, expect.any(Object));
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
});

describe('Get method', () => {
  it('method should be defined', () => {
    expect(testRestResource.get).toBeInstanceOf(Function);
  });
  it('should called with expected params', async () => {
    try {
      const expectedUrl = expect.stringMatching(resourceRelativePath);
      const expectedBody = expect.objectContaining({ data: 1 });
      const response = await testRestResource.get({ data: 1 });
      expect(fakeFetchResource.get)
        .toHaveBeenCalledWith(expectedUrl, expectedBody, expect.any(Object));
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
});

describe('Delete method', () => {
  it('method should be defined', () => {
    expect(testRestResource.delete).toBeInstanceOf(Function);
  });
  it('should called with expected params', async () => {
    try {
      const expectedUrl = expect.stringMatching(resourceRelativePath);
      const expectedBody = expect.objectContaining({ data: 1 });
      const response = await testRestResource.delete({ data: 1 });
      expect(fakeFetchResource.delete)
        .toHaveBeenCalledWith(expectedUrl, expectedBody, expect.any(Object));
      expect(response).toBeUndefined();
    } catch (error) {
      expect(error).toBeNull();
    }
  });
});

describe('Child method', () => {
  it('method should be defined', () => {
    expect(testRestResource.child).toBeInstanceOf(Function);
  });
  it('should create new BaseRestResource instance', () => {
    const newRestResource = testRestResource.child('child');
    expect(newRestResource).toBeInstanceOf(BaseRestResource);
    const isSameResource = newRestResource === testRestResource;
    expect(isSameResource).toBe(false);
  });
  it('should construct new relative path', async () => {
    try {
      const newRestResource = testRestResource.child('pass any string because mocked');
      const expectedUrl = expect.stringMatching(resourceChildPath);
      const expectedBody = expect.objectContaining({ data: 1 });
      await newRestResource.create({ data: 1 });
      expect(fakeFetchResource.post)
        .toHaveBeenCalledWith(expectedUrl, expectedBody, expect.any(Object));
    } catch (error) {
      expect(error).toBeNull();
    }
  });
});

describe('GetRequestResource method', () => {
  it('method should be defined', () => {
    expect(testRestResource.getRequestResource).toBeInstanceOf(Function);
  });
  it('should return base resource', () => {
    const baseResource = testRestResource.getRequestResource();
    expect(baseResource).toEqual(fakeFetchResource);
  });
});

