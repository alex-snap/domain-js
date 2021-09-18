import axios from 'axios';

import { AxiosResource } from "../src/resources/axios/AxiosResource";
import { DefaultAxiosResourceOptions } from "../src/resources/axios/DefaultAxiosResourceOptions";
import { createSuccessAxiosResponse } from "../test-utils/axios";
const baseUrl = 'https://www.google.com/';

jest.mock('axios');

describe('AxiosResource', () => {
  let axiosResource: AxiosResource;
  beforeEach(() => {
    axiosResource = new AxiosResource(baseUrl, undefined);
    (axios.post as jest.Mock).mockClear();
    (axios.get as jest.Mock).mockClear();
    (axios.patch as jest.Mock).mockClear();
    (axios.put as jest.Mock).mockClear();
  });

  describe('Check options', () => {
    it('without trailing slash', async () => {
      const expectedUrl = expect.stringMatching(`${baseUrl}test_url`);
      (axios.post as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      await axiosResource.post('test_url', { data: 1 }, { trailingSlash: false })
      expect(axios.post).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          data: 1,
        }),
        expect.objectContaining({
          responseType: "json",
        })
      );
    });
    it('with trailing slash', async () => {
      const expectedUrl = expect.stringMatching(`${baseUrl}test_url/`);
      (axios.post as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      await axiosResource.post('test_url', { data: 1 }, { trailingSlash: true })
      expect(axios.post).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          data: 1,
        }),
        expect.objectContaining({
          responseType: "json",
        })
      );
    });
  });

  describe('Check instance', () => {
    it('axiosResource should be instance of AxiosResource', async () => {
      expect(axiosResource).toBeInstanceOf(AxiosResource);
    });

    it('should store base url', () => {
      expect((axiosResource as any).baseUrl).toBe(baseUrl);
    });

    it('should contain default options', () => {
      expect((axiosResource as any).defaultOptions).toEqual(DefaultAxiosResourceOptions);
    });
  });

  describe('Post request', () => {
    it('method should be defined', () => {
      expect(axiosResource.post).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringMatching(`${baseUrl}test_url`);
      (axios.post as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      const response = await axiosResource.post('test_url', { data: 1 });
      expect(axios.post).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ data: 1 }),
        expect.objectContaining({ responseType: "json" })
      );
      expect(response).toEqual(
        expect.objectContaining({ _status: expect.any(Number), data: expect.anything() })
      );
    });
    it('should catch error response', async () => {
      (axios.post as jest.Mock).mockReturnValue(Promise.reject({ code: 404, data: '1' }));
      await expect(axiosResource.post('test_url', { data: '1' })).rejects.toEqual(
        expect.objectContaining({
          _status: 404,
          data: expect.anything(),
        })
      );
    });
  });

  describe('Put request', () => {
    it('method should be defined', () => {
      expect(axiosResource.put).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url`);
      (axios.put as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      const response = await axiosResource.put('test_url', { data: 1 });
      expect(axios.put).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ data: 1 }),
        expect.objectContaining({ responseType: "json" })
      );
      expect(response).toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should catch error response', async () => {
      (axios.put as jest.Mock).mockReturnValue(Promise.reject({ code: 404, data: '1' }));
      await expect(axiosResource.put('test_url', { data: '1' })).rejects.toEqual(
        expect.objectContaining({
          _status: 404,
          data: expect.anything(),
        })
      );
    });
  });

  describe('Patch request', () => {
    it('method should be defined', () => {
      expect(axiosResource.patch).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url`);
      (axios.patch as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      const response = await axiosResource.patch('test_url', { data: 1 });
      expect(axios.patch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ data: 1 }),
        expect.objectContaining({ responseType: "json" })
      );
      expect(response).toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should catch error response', async () => {
      (axios.patch as jest.Mock).mockReturnValue(Promise.reject({ code: 404, data: '1' }));
      await expect(axiosResource.patch('test_url', { data: '1' })).rejects.toEqual(
        expect.objectContaining({
          _status: 404,
          data: expect.anything(),
        })
      );
    });
  });

  describe('Get request', () => {
    beforeEach(() => {

    });
    it('method should be defined', () => {
      expect(axiosResource.get).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url`);
      (axios.get as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      const response = await axiosResource.get('test_url');
      expect(axios.get).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ params: expect.any(Object), responseType: "json" })
      );
      expect(response).toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should catch error response', async () => {
      (axios.get as jest.Mock).mockReturnValue(Promise.reject({ code: 404, data: '1' }));
      await expect(axiosResource.get('test_url')).rejects.toEqual(
        expect.objectContaining({
          _status: 404,
          data: expect.anything(),
        })
      );
    });
    it('should pass query params in request', async () => {
      const queryString = `${baseUrl}test_url`;
      const expectedUrl = expect.stringContaining(queryString);
      (axios.get as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      await axiosResource.get('test_url', {
        page: 1,
        per_page: 10,
        array: [1, 2, 3]
      });
      expect(axios.get).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          params: {
            page: 1,
            per_page: 10,
            array: [1, 2, 3],
            timeoffset: 180,
          },
          responseType: 'json',
          paramsSerializer: expect.any(Function),
        })
      );
    });
    it('should pass query params array as array in request', async () => {
      const queryString = `${baseUrl}test_url`;
      // const queryString = `${baseUrl}test_url/?page=1&per_page=10&array[]=1&array[]=2&array[]=3&timeoffset=${timeOffset}`;
      const expectedUrl = expect.stringContaining(queryString);
      (axios.get as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      await axiosResource.get(
        'test_url',
        {
          page: 1,
          per_page: 10,
          array: [1, 2, 3],
        },
        { queryParamsDecodeMode: 'array' }
      );
      expect(axios.get).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          params: {
            page: 1,
            per_page: 10,
            array: [1, 2, 3],
            timeoffset: 180,
          },
          responseType: 'json',
          paramsSerializer: expect.any(Function),
        })
      );
      // todo добавить проверку резолвера параметров
      // expect()
    });
  });

  describe('Delete request', () => {
    it('method should be defined', () => {
      expect(axiosResource.delete).toBeInstanceOf(Function);
    });
    it('should receive success response', async () => {
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url/`);
      (axios.delete as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      const response = await axiosResource.delete('test_url');
      expect(axios.delete).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          params: {
            timeoffset: 180,
          },
          responseType: 'json',
          paramsSerializer: expect.any(Function),
        }),
      );
      expect(response).toEqual(
        expect.objectContaining({
          _status: expect.any(Number),
          data: expect.anything(),
        })
      );
    });
    it('should catch error response', async () => {
      (axios.delete as jest.Mock).mockReturnValue(Promise.reject({ code: 404, data: '1' }));
      await expect(axiosResource.delete('test_url')).rejects.toEqual(
        expect.objectContaining({
          _status: 404,
          data: expect.anything(),
        })
      );
    });
  });

  describe('Set headers', () => {
    it('method should be defined', () => {
      expect(axiosResource.setHeaders).toBeInstanceOf(Function);
    });

    it('should store headers', () => {
      const headers = { Authorization: 'X' };
      axiosResource.setHeaders(headers);
      const savedHeaders = (axiosResource as any).defaultOptions.headers;
      expect(savedHeaders).toEqual(headers);
    });

    it('should send headers on each request', async () => {
      const headers = { Authorization: 'X' };
      axiosResource.setHeaders(headers);
      const expectedUrl = expect.stringContaining(`${baseUrl}test_url/`);
      (axios.get as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      await axiosResource.get('test_url');
      expect(axios.get).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({ headers: expect.objectContaining(headers) })
      );
    });
  });

  describe('Clear headers', () => {
    it('method should be defined', () => {
      expect(axiosResource.clearHeaders).toBeInstanceOf(Function);
    });
    it('should clear headers', () => {
      const headers = { Authorization: 'X' };
      axiosResource.setHeaders(headers);
      axiosResource.clearHeaders();
      const savedHeaders = (axiosResource as any).defaultOptions.headers;
      expect(savedHeaders).toBeUndefined();
    });
  });

  describe('Set base path dynamically', () => {
    it('method should be defined', () => {
      expect(axiosResource.setBasePath).toBeInstanceOf(Function);
    });

    it('should change base path', async () => {
      const newBasePath = 'https://www.newBasePath.ru/';
      const expectedUrl = expect.stringContaining(`${newBasePath}test_url`);
      axiosResource.setBasePath(newBasePath);
      (axios.get as jest.Mock).mockReturnValue(Promise.resolve(createSuccessAxiosResponse({ data: 'any' })));
      await axiosResource.get('test_url');
      expect(axios.get).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
    });
  });

  describe('Resolve destination', () => {
    it('method should be defined', () => {
      expect(axiosResource.resolveDestination).toBeInstanceOf(Function);
    });

    it('should create path from parts', () => {
      const relativePath = 'users';
      const additionalParts = ['part1', 'part2', 'part3'];
      const path = axiosResource.resolveDestination(additionalParts, relativePath);
      expect(path).toEqual('users/part1/part2/part3');
    });
  });

  describe('Get query string', () => {
    it('method should be defined', () => {
      expect(axiosResource.getQueryString).toBeInstanceOf(Function);
    });

    it('should create query string from object', () => {
      const query = axiosResource.getQueryString({
        coupons: ['SL-6TXY0-QB524OT', '1234'],
      });
      expect(query).toEqual('coupons=SL-6TXY0-QB524OT,1234');
    });
    it('should create query string from object. Decode mode - array', () => {
      const query = axiosResource.getQueryString(
        { coupons: ['SL-6TXY0-QB524OT', '1234'] },
        { queryParamsDecodeMode: 'array' }
      );

      expect(query).toEqual('coupons[]=SL-6TXY0-QB524OT&coupons[]=1234');
    });
    it('should create query string from object. Decode mode - array. Without timeOffset', () => {
      const query = axiosResource.getQueryString(
        { coupons: ['SL-6TXY0-QB524OT', '1234'] },
        {
          queryParamsDecodeMode: 'array',
          timeOffset: false,
        }
      );
      expect(query).toEqual('coupons[]=SL-6TXY0-QB524OT&coupons[]=1234');
    });
  });
});
