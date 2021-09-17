import { BaseRepository } from '../src/BaseRepository';
import { BaseRestResource } from '../src/BaseRestResource';

export const createMock = <T>(value?: Partial<T>): T => {
  return <T>(<unknown>value);
};

export type SetupOptions = {
  jestResourceCreateMock?: jest.Mock<any, any>;
  jestResourceUpdateMock?: jest.Mock<any, any>;
  jestResourcePatchMock?: jest.Mock<any, any>;
  jestResourceDeleteMock?: jest.Mock<any, any>;
  jestResourceGetMock?: jest.Mock<any, any>;
  jestChildResourceCreateMock?: jest.Mock<any, any>;
  jestChildResourceUpdateMock?: jest.Mock<any, any>;
  jestChildResourcePatchMock?: jest.Mock<any, any>;
  jestChildResourceDeleteMock?: jest.Mock<any, any>;
  jestChildResourceGetMock?: jest.Mock<any, any>;
};

export const createInstances = (successResourceResponse: any, setupOptions: SetupOptions = {}) => {
  const {
    jestResourceCreateMock = jest.fn().mockResolvedValue(successResourceResponse),
    jestResourceUpdateMock = jest.fn().mockResolvedValue(successResourceResponse),
    jestResourcePatchMock = jest.fn().mockResolvedValue(successResourceResponse),
    jestResourceDeleteMock = jest.fn().mockResolvedValue(undefined),
    jestResourceGetMock = jest.fn().mockResolvedValue(successResourceResponse),

    jestChildResourceCreateMock = jest.fn().mockResolvedValue(successResourceResponse),
    jestChildResourceUpdateMock = jest.fn().mockResolvedValue(successResourceResponse),
    jestChildResourcePatchMock = jest.fn().mockResolvedValue(successResourceResponse),
    jestChildResourceDeleteMock = jest.fn().mockResolvedValue(undefined),
    jestChildResourceGetMock = jest.fn().mockResolvedValue(successResourceResponse),
  } = setupOptions;

  const fakeChildRestResource = createMock<BaseRestResource>({
    create: jestChildResourceCreateMock,
    update: jestChildResourceUpdateMock,
    patch: jestChildResourcePatchMock,
    get: jestChildResourceGetMock,
    delete: jestChildResourceDeleteMock,
    child() {
      return this;
    },
    getRequestResource() {
      return null;
    },
  });
  const fakeRestResource = createMock<BaseRestResource>({
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
  const testRepository = new BaseRepository(fakeRestResource);
  return { fakeChildRestResource, fakeRestResource, testRepository };
};
