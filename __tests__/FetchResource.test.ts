import { FetchResource, DefaultFetchOptions } from '../src/FetchResource';
import 'whatwg-fetch';

// global;
declare var global: any;
let fetchResource: TestingFetchResource;
const timeOffset = new Date().getTimezoneOffset() * -1;
const baseUrl = 'https://www.google.com/';
const successResponseData = { data: 'success', _status: 200 };

const successResponse = new Response(JSON.stringify(successResponseData), {
  status: 200,
  headers: {
    'content-type': 'application/json',
  },
});

const failedResponse = new Response(JSON.stringify(successResponseData), {
  status: 404,
  headers: {
    'content-type': 'application/json',
  },
});

class TestingFetchResource extends FetchResource {
  public _getBaseUrl() {
    return this.baseUrl;
  }
  public _getDefaultOptions() {
    return this.defaultOptions;
  }
}

beforeEach(() => {
  const mockSuccessFetchPromise = Promise.resolve(successResponse.clone());

  const mockFailedFetchPromise = Promise.resolve(failedResponse.clone());

  global.fetch = jest
    .fn()
    .mockImplementationOnce(() => mockSuccessFetchPromise)
    .mockImplementationOnce(() => mockFailedFetchPromise);

  fetchResource = new TestingFetchResource(baseUrl);
});

afterEach(() => {
  global.fetch.mockClear();
  delete global.fetch;
});

describe('FetchResource options', () => {
  it('trailing slash', async () => {
    try {
      const testFetchResource = new TestingFetchResource(baseUrl, {
        trailingSlash: false,
      });
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url`);
      const response = await testFetchResource.post('test_url', { data: 1 });
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'post',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
});

describe('FetchResource instance', () => {
  it('fetchResource instance of FetchResource', async () => {
    expect(fetchResource).toBeInstanceOf(FetchResource);
  });

  it('should store base url', () => {
    expect(fetchResource._getBaseUrl()).toBe(baseUrl);
  });

  it('should contain default options', () => {
    expect(fetchResource._getDefaultOptions()).toEqual(DefaultFetchOptions);
  });
});

describe('Post request', () => {
  it('method should be defined', () => {
    expect(fetchResource.post).toBeInstanceOf(Function);
  });
  it('should receive success response', async () => {
    try {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url/`);
      const response = await fetchResource.post('test_url', { data: 1 });
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'post',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
  it('should catch error response', async () => {
    try {
      await fetchResource.post('test_url', { data: '1' });
      await fetchResource.post('test_url', { data: '1' });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.status).toEqual(404);
    }
  });
});

describe('Put request', () => {
  it('method should be defined', () => {
    expect(fetchResource.put).toBeInstanceOf(Function);
  });
  it('should receive success response', async () => {
    try {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url/`);
      const response = await fetchResource.put('test_url', { data: 1 });
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'put',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
  it('should catch error response', async () => {
    try {
      await fetchResource.put('test_url', { data: '1' });
      await fetchResource.put('test_url', { data: '1' });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.status).toEqual(404);
    }
  });
});

describe('Patch request', () => {
  it('method should be defined', () => {
    expect(fetchResource.patch).toBeInstanceOf(Function);
  });
  it('should receive success response', async () => {
    try {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url/`);
      const response = await fetchResource.patch('test_url', { data: 1 });
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'patch',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
  it('should catch error response', async () => {
    try {
      await fetchResource.patch('test_url', { data: '1' });
      await fetchResource.patch('test_url', { data: '1' });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.status).toEqual(404);
    }
  });
});

describe('Get request', () => {
  it('method should be defined', () => {
    expect(fetchResource.get).toBeInstanceOf(Function);
  });
  it('should receive success response', async () => {
    try {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url/`);
      const response = await fetchResource.get('test_url');
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: 'get' })
      );
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
  it('should catch error response', async () => {
    try {
      await fetchResource.get('test_url');
      await fetchResource.get('test_url');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.status).toEqual(404);
    }
  });
  it('should pass query params in request', async () => {
    const queryString = `${baseUrl}test_url/?page=1&per_page=10&array=1,2,3&timeoffset=${timeOffset}`;
    const expectedUrl = expect.stringContaining(queryString);
    await fetchResource.get('test_url', {
      page: 1,
      per_page: 10,
      array: [1, 2, 3],
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({ method: 'get' })
    );
  });
  it('should pass query params array as array in request', async () => {
    const queryTestfetchResource = new TestingFetchResource(baseUrl, {
      queryParamsDecodeMode: 'array',
    });
    const queryString = `${baseUrl}test_url/?page=1&per_page=10&array[]=1&array[]=2&array[]=3&timeoffset=${timeOffset}`;
    const expectedUrl = expect.stringContaining(queryString);
    await queryTestfetchResource.get('test_url', {
      page: 1,
      per_page: 10,
      array: [1, 2, 3],
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({ method: 'get' })
    );
  });
});

describe('Delete request', () => {
  it('method should be defined', () => {
    expect(fetchResource.delete).toBeInstanceOf(Function);
  });
  it('should receive success response', async () => {
    try {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url/`);
      const response = await fetchResource.delete('test_url');
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: 'delete' })
      );
      expect(response).toBeDefined();
      expect(response).toEqual(successResponseData);
    } catch (error) {
      expect(error).toBeNull();
    }
  });
  it('should catch error response', async () => {
    try {
      await fetchResource.delete('test_url');
      await fetchResource.delete('test_url');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.status).toEqual(404);
    }
  });
});

describe('Set headers', () => {
  it('method should be defined', () => {
    expect(fetchResource.setHeaders).toBeInstanceOf(Function);
  });

  it('should store headers', () => {
    const headers = { Authorization: 'X' };
    fetchResource.setHeaders(headers);
    const savedHeaders = fetchResource._getDefaultOptions().headers;
    expect(savedHeaders).toEqual(headers);
  });

  it('should send headers on each request', async () => {
    const headers = { Authorization: 'X' };
    fetchResource.setHeaders(headers);
    const expectedUrl = expect.stringContaining(`${baseUrl}test_url/`);
    await fetchResource.get('test_url');
    expect(global.fetch).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({ headers: expect.objectContaining(headers) })
    );
  });
});

describe('Clear headers', () => {
  it('method should be defined', () => {
    expect(fetchResource.clearHeaders).toBeInstanceOf(Function);
  });
  it('should clear headers', () => {
    const headers = { Authorization: 'X' };
    fetchResource.setHeaders(headers);
    fetchResource.clearHeaders();
    const savedHeaders = fetchResource._getDefaultOptions().headers;
    expect(savedHeaders).toBeUndefined();
  });
});

describe('Set base path dynamically', () => {
  it('method should be defined', () => {
    expect(fetchResource.setBasePath).toBeInstanceOf(Function);
  });

  it('should change base path', async () => {
    const newBasePath = 'https://www.newBasePath.ru/';
    const expectedUrl = expect.stringContaining(`${newBasePath}test_url`);
    fetchResource.setBasePath(newBasePath);
    await fetchResource.get('test_url');
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
  });
});

describe('Resolve destination', () => {
  it('method should be defined', () => {
    expect(fetchResource.resolveDestination).toBeInstanceOf(Function);
  });

  it('should create path from parts', () => {
    const relativePath = 'users';
    const additionalParts = ['part1', 'part2', 'part3'];
    const path = fetchResource.resolveDestination(additionalParts, relativePath);
    expect(path).toEqual('users/part1/part2/part3');
  });
});

describe('Get query string', () => {
  it('method should be defined', () => {
    expect(fetchResource.getQueryString).toBeInstanceOf(Function);
  });

  it('should create query string from object', () => {
    const result1 = fetchResource.getQueryString({
      coupons: ['SL-6TXY0-QB524OT'],
    });
    const result2 = fetchResource.getQueryString(
      { coupons: ['SL-6TXY0-QB524OT'] },
      { queryParamsDecodeMode: 'array' }
    );
    const result3 = fetchResource.getQueryString(
      { coupons: ['SL-6TXY0-QB524OT'] },
      {
        queryParamsDecodeMode: 'array',
        timeOffset: false,
      }
    );
    const result4 = fetchResource.getQueryString(
      { coupons: [] },
      { queryParamsDecodeMode: 'array' }
    );
    expect(result1).toEqual('coupons=SL-6TXY0-QB524OT&timeoffset=180');
    expect(result2).toEqual('coupons[]=SL-6TXY0-QB524OT&timeoffset=180');
    expect(result3).toEqual('coupons[]=SL-6TXY0-QB524OT');
    expect(result4).toEqual('timeoffset=180');
  });
});
