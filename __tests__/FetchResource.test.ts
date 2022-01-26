import { FetchResource } from '../src/resources/fetch/FetchResource';
import { DefaultFetchResourceOptions } from '../src/resources/fetch/DefaultFetchResourceOptions';
import 'whatwg-fetch';

const timeOffset = new Date().getTimezoneOffset() * -1;
const baseUrlString = 'https://www.google.com/';
const baseUrlPromise = new Promise<string>(resolve => resolve(baseUrlString));

const successResponse = new Response(JSON.stringify({ data: 'success' }), {
  status: 200,
  headers: {
    'content-type': 'application/json',
  },
});

const failedResponse = new Response(JSON.stringify({ data: 'failed' }), {
  status: 404,
  headers: {
    'content-type': 'application/json',
  },
});

describe('FetchResource', () => {
  let fetchResource: FetchResource;
  let fetchResourceWithPromiseUrl: FetchResource;
  let fetchMock: jest.Mock;
  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValueOnce(successResponse).mockResolvedValue(failedResponse);
    fetchResource = new FetchResource(baseUrlString, undefined, fetchMock);
    fetchResourceWithPromiseUrl = new FetchResource(baseUrlPromise, undefined, fetchMock);
  });

  describe('FetchResource options', () => {
    it('trailing slash', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url`);
      const response = await fetchResource.post('test_url', { data: 1 }, { trailingSlash: false });
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toEqual(expect.objectContaining({ data: expect.anything() }));
    });
  });

  describe('FetchResource base url', () => {
    it('can be string', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url`);
      const response = await fetchResource.post('test_url', { data: 1 }, { trailingSlash: false });
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toEqual(expect.objectContaining({ data: expect.anything() }));
    });
    it('can be Promise<string>', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url`);
      const response = await fetchResourceWithPromiseUrl.post('test_url', { data: 1 }, { trailingSlash: false });
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toEqual(expect.objectContaining({ data: expect.anything() }));
    });
  });

  describe('FetchResource instance', () => {
    it('fetchResource instance of FetchResource', async () => {
      expect(fetchResource).toBeInstanceOf(FetchResource);
    });

    it('should store base url', async () => {
      const baseUrl = await fetchResource.getBaseUrl();
      expect(baseUrl).toBe(baseUrlString);
    });

    it('should contain default options', () => {
      expect((fetchResource as any).defaultOptions).toEqual(DefaultFetchResourceOptions);
    });
  });

  describe('Post request', () => {
    it('method should be defined', () => {
      expect(fetchResource.post).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url/`);
      const response = await fetchResource.post('test_url', { data: 1 });
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toEqual(
        expect.objectContaining({ _status: expect.any(Number), data: expect.anything() })
      );
    });
    it('should catch error response', async () => {
      await fetchResource.post('test_url', { data: '1' });
      expect(fetchResource.post('test_url', { data: '1' })).rejects.toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
  });

  describe('Put request', () => {
    it('method should be defined', () => {
      expect(fetchResource.put).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url/`);
      const response = await fetchResource.put('test_url', { data: 1 });
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should catch error response', async () => {
      await fetchResource.put('test_url', { data: '1' });
      expect(fetchResource.put('test_url', { data: '1' })).rejects.toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
  });

  describe('Patch request', () => {
    it('method should be defined', () => {
      expect(fetchResource.patch).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url/`);
      const response = await fetchResource.patch('test_url', { data: 1 });
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ data: 1 }),
        })
      );
      expect(response).toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should catch error response', async () => {
      await fetchResource.patch('test_url', { data: '1' });
      expect(fetchResource.patch('test_url', { data: '1' })).rejects.toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
  });

  describe('Get request', () => {
    it('method should be defined', () => {
      expect(fetchResource.get).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url/`);
      const response = await fetchResource.get('test_url');
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: 'GET' })
      );
      expect(response).toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should catch error response', async () => {
      await fetchResource.get('test_url');
      expect(fetchResource.get('test_url')).rejects.toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should pass query params in request', async () => {
      const queryString = `${baseUrlString}test_url/?page=1&per_page=10&array=1,2,3&timeoffset=${timeOffset}`;
      const expectedUrl = expect.stringContaining(queryString);
      await fetchResource.get('test_url', {
        page: 1,
        per_page: 10,
        array: [1, 2, 3],
      });
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: 'GET' })
      );
    });
    it('should pass query params array as array in request', async () => {
      const queryString = `${baseUrlString}test_url/?page=1&per_page=10&array[]=1&array[]=2&array[]=3&timeoffset=${timeOffset}`;
      const expectedUrl = expect.stringContaining(queryString);
      await fetchResource.get(
        'test_url',
        {
          page: 1,
          per_page: 10,
          array: [1, 2, 3],
        },
        { queryParamsDecodeMode: 'array' }
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('Delete request', () => {
    it('method should be defined', () => {
      expect(fetchResource.delete).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url/`);
      const response = await fetchResource.delete('test_url');
      expect(fetchMock).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(response).toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should catch error response', async () => {
      await fetchResource.delete('test_url');
      expect(fetchResource.delete('test_url')).rejects.toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
  });

  describe('Set headers', () => {
    it('method should be defined', () => {
      expect(fetchResource.setHeaders).toBeInstanceOf(Function);
    });

    it('should store headers', () => {
      const headers = { Authorization: 'X' };
      fetchResource.setHeaders(headers);
      const savedHeaders = (fetchResource as any).defaultOptions.headers;
      expect(savedHeaders).toEqual(headers);
    });

    it('should send headers on each request', async () => {
      const headers = { Authorization: 'X' };
      fetchResource.setHeaders(headers);
      const expectedUrl = expect.stringContaining(`${baseUrlString}test_url/`);
      await fetchResource.get('test_url');
      expect(fetchMock).toHaveBeenCalledWith(
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
      const savedHeaders = (fetchResource as any).defaultOptions.headers;
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
      expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
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
      const query = fetchResource.getQueryString({
        coupons: ['SL-6TXY0-QB524OT', '1234'],
      });
      expect(query).toEqual('coupons=SL-6TXY0-QB524OT,1234&timeoffset=180');
    });
    it('should create query string from object. Decode mode - array', () => {
      const query = fetchResource.getQueryString(
        { coupons: ['SL-6TXY0-QB524OT', '1234'] },
        { queryParamsDecodeMode: 'array' }
      );

      expect(query).toEqual('coupons[]=SL-6TXY0-QB524OT&coupons[]=1234&timeoffset=180');
    });
    it('should create query string from object. Decode mode - array. Without timeOffset', () => {
      const query = fetchResource.getQueryString(
        { coupons: ['SL-6TXY0-QB524OT', '1234'] },
        {
          queryParamsDecodeMode: 'array',
          timeOffset: false,
        }
      );
      expect(query).toEqual('coupons[]=SL-6TXY0-QB524OT&coupons[]=1234');
    });
    it('should create query string from object. Decode mode - array', () => {
      const query = fetchResource.getQueryString(
        { coupons: [] },
        { queryParamsDecodeMode: 'array' }
      );
      expect(query).toEqual('timeoffset=180');
    });
  });

  // todo add tests for file upload

});
