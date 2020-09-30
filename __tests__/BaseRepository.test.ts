import { BaseRepository } from '../src/BaseRepository';
import { BaseRestResource } from '../src/BaseRestResource';

const createMock = <T>(value?: Partial<T>): T => {
  return <T>(<unknown>value);
};

// global
declare var global: any;
class FakeFormData {
  public append = jest.fn();
}

(global as any).FormData = FakeFormData;

const successResourceResponse = {
  _status: '200',
  data: 'any',
};

const successRepositoryResponse = {
  data: 'any',
  meta: {
    responseStatus: '200',
  },
};

const jestResourceCreateMock = jest.fn().mockResolvedValue(successResourceResponse);
const jestResourceUpdateMock = jest.fn().mockResolvedValue(successResourceResponse);
const jestResourcePatchMock = jest.fn().mockResolvedValue(successResourceResponse);
const jestResourceDeleteMock = jest.fn().mockResolvedValue(undefined);

const jestResourceGetMock: any = jest
  .fn()
  .mockResolvedValueOnce({ ...successResourceResponse, data: ['123', '123', '123'] })
  .mockResolvedValue(successResourceResponse);

const jestChildResourceCreateMock = jest.fn().mockResolvedValue(successResourceResponse);
const jestChildResourceUpdateMock = jest.fn().mockResolvedValue(successResourceResponse);
const jestChildResourcePatchMock = jest.fn().mockResolvedValue(successResourceResponse);
const jestChildResourceDeleteMock = jest.fn().mockResolvedValue(undefined);

const jestChildResourceGetMock: any = jest.fn().mockResolvedValue(successResourceResponse);

describe('BaseRepository', () => {
  let testRepository: BaseRepository;
  let fakeRestResource: BaseRestResource;
  let fakeChildRestResource: BaseRestResource;

  beforeAll(async () => {
    fakeChildRestResource = createMock<BaseRestResource>({
      create: jestChildResourceCreateMock,
      update: jestChildResourceUpdateMock,
      patch: jestChildResourcePatchMock,
      get: jestChildResourceGetMock,
      delete: jestChildResourceDeleteMock,
      child() {
        return fakeChildRestResource;
      },
      getRequestResource() {
        return null;
      },
    });
    fakeRestResource = createMock<BaseRestResource>({
      create: jestResourceCreateMock,
      update: jestResourceUpdateMock,
      patch: jestResourcePatchMock,
      get: jestResourceGetMock,
      delete: jestResourceDeleteMock,
      child() {
        return fakeChildRestResource;
      },
      getRequestResource() {
        return null;
      },
    });
    testRepository = new BaseRepository(fakeRestResource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('BaseRepository instance', () => {
    it('testRepository instance of BaseRepository', async () => {
      expect(testRepository).toBeInstanceOf(BaseRepository);
    });
  });

  describe('Create method', () => {
    it('method should be defined', () => {
      expect(testRepository.create).toBeInstanceOf(Function);
    });
    it('should called with expected params', async () => {
      try {
        const expectedBody = expect.objectContaining({ data: 1 });
        const response = await testRepository.create({ data: 1 });
        expect(fakeRestResource.create).toHaveBeenCalledWith(expectedBody);
        expect(response).toBeDefined();
        expect(response).toEqual(successRepositoryResponse);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('Update method', () => {
    it('method should be defined', () => {
      expect(testRepository.update).toBeInstanceOf(Function);
    });
    it('should called with expected params', async () => {
      try {
        const expectedBody = expect.objectContaining({ id: 2, data: 1 });
        const response = await testRepository.update({ id: 2, data: 1 });
        expect(fakeChildRestResource.update).toHaveBeenCalledWith(expectedBody);
        expect(response).toBeDefined();
        expect(response).toEqual(successRepositoryResponse);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('Patch method', () => {
    it('method should be defined', () => {
      expect(testRepository.patch).toBeInstanceOf(Function);
    });
    it('should called with expected params', async () => {
      try {
        const expectedBody = expect.objectContaining({ id: 2, data: 1 });
        const response = await testRepository.patch({ id: 2, data: 1 });
        expect(fakeChildRestResource.patch).toHaveBeenCalledWith(expectedBody);
        expect(response).toBeDefined();
        expect(response).toEqual(successRepositoryResponse);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('Load method', () => {
    it('method should be defined', () => {
      expect(testRepository.load).toBeInstanceOf(Function);
    });
    it('should ', async () => {
      try {
        const expectedBody = expect.objectContaining({ id: 2, data: 1 });
        const response = await testRepository.load({ id: 2, data: 1 });
        expect(fakeRestResource.get).toHaveBeenCalledWith(expectedBody);
        expect(response).toBeDefined();
        expect(response).toEqual(expect.any(Array));
      } catch (error) {
        expect(error).toBeNull();
      }
    });
    it('should called with expected params', async () => {
      try {
        const expectedBody = expect.objectContaining({ id: 2, data: 1 });
        const response = await testRepository.load({ id: 2, data: 1 });
        expect(fakeRestResource.get).toHaveBeenCalledWith(expectedBody);
        expect(response).toBeDefined();
        expect(response).toEqual(successRepositoryResponse);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('LoadById method', () => {
    it('method should be defined', () => {
      expect(testRepository.loadById).toBeInstanceOf(Function);
    });
    it('should called with expected params', async () => {
      try {
        const response = await testRepository.loadById(2);
        expect(fakeChildRestResource.get).toHaveBeenCalledWith(undefined);
        expect(response).toBeDefined();
        expect(response).toEqual(successRepositoryResponse);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('Delete method', () => {
    it('method should be defined', () => {
      expect(testRepository.delete).toBeInstanceOf(Function);
    });
    it('should called with expected params', async () => {
      try {
        const response = await testRepository.delete({ id: 2, data: 1 });
        expect(fakeChildRestResource.delete).toHaveBeenCalledWith();
        expect(response).toBeUndefined();
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('Search method', () => {
    it('method should be defined', () => {
      expect(testRepository.search).toBeInstanceOf(Function);
    });
    it('should called with expected params', async () => {
      try {
        const expectedBody = expect.objectContaining({
          search: { id: 2, data: 1 },
          page: 1,
          per_page: 10,
          order: 'asc',
        });
        const response = await testRepository.search({
          id: 2,
          data: 1,
          page: 1,
          per_page: 10,
          sort: 'asc',
        });
        expect(fakeRestResource.get).toHaveBeenCalledWith(expectedBody);
        expect(response).toBeDefined();
        expect(response).toEqual(successRepositoryResponse);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
    it('should called with expected params in another settings', async () => {
      try {
        testRepository.setSettings({
          pageKey: 'p',
          perPageKey: 'pp',
          sortKey: 'sort',
          searchKey: 'filter',
        });
        const expectedBody = expect.objectContaining({
          filter: { id: 2, data: 1 },
          p: 1,
          pp: 10,
          sort: 'asc',
        });
        const response = await testRepository.search({
          id: 2,
          data: 1,
          page: 1,
          per_page: 10,
          sort: 'asc',
        });
        expect(fakeRestResource.get).toHaveBeenCalledWith(expectedBody);
        expect(response).toBeDefined();
        expect(response).toEqual(successRepositoryResponse);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('isEntityNew method', () => {
    it('method should be defined', () => {
      expect(testRepository.isEntityNew).toBeInstanceOf(Function);
    });
    it('should detect is entity new by identificator', async () => {
      try {
        const isNew1 = testRepository.isEntityNew({ data: 1 });
        const isNew2 = testRepository.isEntityNew({ id: 2, data: 1 });
        expect(isNew1).toBeTruthy();
        expect(isNew2).toBeFalsy();

        class TestRepositoryWithUUIDEntityKey extends BaseRepository {
          entityIdName = 'uuid';
        }

        const testRepository2 = new TestRepositoryWithUUIDEntityKey(fakeRestResource);
        const isNew3 = testRepository2.isEntityNew({ data: 1 });
        const isNew4 = testRepository2.isEntityNew({ id: 2, data: 1 });
        const isNew5 = testRepository2.isEntityNew({ uuid: 2, data: 1 });
        expect(isNew3).toBeTruthy();
        expect(isNew4).toBeTruthy();
        expect(isNew5).toBeFalsy();
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('setDefaultQueryParams method', () => {
    it('method should be defined', () => {
      expect(testRepository.setDefaultQueryParams).toBeInstanceOf(Function);
    });
    it('should set default query params', async () => {
      try {
        testRepository.setDefaultQueryParams({ always: 'send with get' });
        const response = await testRepository.load({ id: 2, data: 1 });
        expect(fakeRestResource.get).toHaveBeenCalledWith({
          id: 2,
          data: 1,
          params: { always: 'send with get' },
        });
        expect(response).toEqual(successRepositoryResponse);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('getResource method', () => {
    it('method should be defined', () => {
      expect(testRepository.getResource).toBeInstanceOf(Function);
    });
    it('should set default query params', async () => {
      try {
        const result = testRepository.getResource();
        expect(result).toBe(fakeRestResource);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  // 1) todo processResponse with array / undefined|null
  // 2) catch errors
});
