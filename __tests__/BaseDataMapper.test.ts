import 'jest';
import { BaseMapType, BaseDataMapper } from '../src/data-mapper/index';

interface Encoded {
  id: number
  nickname: string
  isOnline: boolean
  createdAt: string
  states: string[]
  avatar: {
    id: number
    url: string
  }
  city: {
    id: number
    title: string
  }
  ticket: {
    uuid: string
    cinema: string
  }
  roleId: number
  customMap: {
    id: number
    title: string
  }
}

interface Decoded {
  id: number | string
  nickname: string
  is_online: boolean
  created_at: string
  states: string[]
  avatar: {
    id: number | string
    url: string
  }
  city: {
    id: number | string
    title: string
  }
  ticket: {
    uuid: string
    cinema: string
  }
  role: {
    id: number | string
    title: string
  }
  custom_map: {
    id: number | string
    title: string
  }
}

let testDataMapper: BaseDataMapper<Encoded, Decoded>;

beforeEach(() => {

  const mappingStrategy = {
    id: BaseMapType.number,
    nickname: BaseMapType.string,
    isOnline: BaseMapType.bool.asAttrMap('is_online'),
    createdAt: BaseMapType.dateTime.asAttrMap('created_at'),
    states: BaseMapType.arrayOf(BaseMapType.string),
    avatar: BaseMapType.shapeOf({
      id: BaseMapType.number,
      url: BaseMapType.string
    }),
    city: BaseMapType.decodeEntityKey()({
      id: BaseMapType.number,
      title: BaseMapType.string
    }),
    ticket: BaseMapType.decodeEntityKey('uuid')({
      uuid: BaseMapType.string,
      cinema: BaseMapType.string
    }),
    roleId: BaseMapType.encodeEntityKey()({
      id: BaseMapType.number,
      title: BaseMapType.string,
    }).asAttrMap('role'),
    customMap: {
      map: 'custom_map',
      encode: (value: any) => value && value.custom_map,
      decode: (value: any) => {
        return value && `${value.customMap.id}.${value.customMap.title}`;
      }
    }
  }

  testDataMapper = new BaseDataMapper<Encoded, Decoded>(mappingStrategy)
});

afterEach(() => {

});

describe('Instance', () => {
  it('should instance of BaseDataMapper', async () => {
    expect(testDataMapper).toBeInstanceOf(BaseDataMapper);
  });
  it('method encode should be defined', async () => {
    expect(testDataMapper.encode).toBeInstanceOf(Function);
  });
  it('method decode should be defined', async () => {
    expect(testDataMapper.decode).toBeInstanceOf(Function);
  });
});