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

describe('instance', () => {
  it('should instance of BaseDataMapper', () => {
    expect(testDataMapper).toBeInstanceOf(BaseDataMapper);
  });
  it('method encode should be defined', () => {
    expect(testDataMapper.encode).toBeInstanceOf(Function);
  });
  it('method decode should be defined', () => {
    expect(testDataMapper.decode).toBeInstanceOf(Function);
  });
});

describe('number', () => {

  // Encode
  // -----------------
  it('should encode string to number', () => {
    const result = testDataMapper.encode({ id: '123' });
    expect(result.id).toBe(123);
  })

  it('should encode number to number', () => {
    const result = testDataMapper.encode({ id: 123 });
    expect(result.id).toBe(123);
  })

  it('on encode null should delete property', () => {
    const result = testDataMapper.encode({ id: null });
    expect(result.hasOwnProperty('id')).toBeFalsy();
  })

  it('on encode undefined should delete property', () => {
    const result = testDataMapper.encode({ id: void 0 });
    expect(result.hasOwnProperty('id')).toBeFalsy();
  })

  it('should encode object to NaN', () => {
    const result = testDataMapper.encode({ id: {} });
    expect(result.id).toBeNaN();
  })

  it('should encode array to NaN', () => {
    const result = testDataMapper.encode({ id: [] });
    expect(result.id).toBeNaN();
  })

  it('should encode Date to NaN', () => {
    const result = testDataMapper.encode({ id: new Date() });
    expect(result.id).toBeNaN();
  })

  // Decode
  // -----------------

  it('should decode string to number', () => {
    const result = testDataMapper.decode({ id: '123' });
    expect(result.id).toBe(123);
  })

  it('should decode number to number', () => {
    const result = testDataMapper.decode({ id: 123 });
    expect(result.id).toBe(123);
  })

  it('on decode null should delete property', () => {
    const result = testDataMapper.decode({ id: null });
    expect(result.hasOwnProperty('id')).toBeFalsy();
  })

  it('on decode undefined should delete property', () => {
    const result = testDataMapper.decode({ id: void 0 });
    expect(result.hasOwnProperty('id')).toBeFalsy();
  })

  it('on decode object should delete property', () => {
    const result = testDataMapper.decode({ id: {} });
    expect(result.hasOwnProperty('id')).toBeFalsy();
  })

  it('on decode array should delete property', () => {
    const result = testDataMapper.decode({ id: [] });
    expect(result.hasOwnProperty('id')).toBeFalsy();
  })

  it('on decode Date should delete property', () => {
    const result = testDataMapper.decode({ id: new Date });
    expect(result.hasOwnProperty('id')).toBeFalsy();
  })
});

describe('string', () => {

  // Encode
  // -----------------
  it('should encode string to string', () => {
    const result = testDataMapper.encode({ nickname: 'nickname' });
    expect(result.nickname).toBe('nickname');
  })

  it('should encode number to string', () => {
    const result = testDataMapper.encode({ nickname: 123 });
    expect(result.nickname).toBe('123');
  })

  it('on encode null should delete property', () => {
    const result = testDataMapper.encode({ nickname: null });
    expect(result.hasOwnProperty('nickname')).toBeFalsy();
  })

  it('on encode undefined should delete property', () => {
    const result = testDataMapper.encode({ nickname: void 0 });
    expect(result.hasOwnProperty('nickname')).toBeFalsy();
  })

  it('should encode object to json string', () => {
    const result = testDataMapper.encode({ nickname: { a: 123 } });
    expect(result.nickname).toBe(JSON.stringify({ a: 123 }));
  })

  it('should encode array to json string', () => {
    const result = testDataMapper.encode({ nickname: [123] });
    expect(result.nickname).toBe(JSON.stringify([123]));
  })

  it('should encode Date to ISO date string', () => {
    const date = new Date();
    const result = testDataMapper.encode({ nickname: date });
    expect(result.nickname).toBe(date.toISOString());
  })

  // Decode
  // -----------------

  it('should decode string to string', () => {
    const result = testDataMapper.decode({ nickname: '123' });
    expect(result.nickname).toBe('123');
  })

  it('should decode number to string', () => {
    const result = testDataMapper.decode({ nickname: 123 });
    expect(result.nickname).toBe('123');
  })

  it('on decode null should delete property', () => {
    const result = testDataMapper.decode({ nickname: null });
    expect(result.hasOwnProperty('nickname')).toBeFalsy();
  })

  it('on decode undefined should delete property', () => {
    const result = testDataMapper.decode({ nickname: void 0 });
    expect(result.hasOwnProperty('nickname')).toBeFalsy();
  })

  it('should decode object to json string', () => {
    const result = testDataMapper.decode({ nickname: { a: 123 } });
    expect(result.nickname).toBe(JSON.stringify({ a: 123 }));
  })

  it('should decode array to json string', () => {
    const result = testDataMapper.decode({ nickname: [123] });
    expect(result.nickname).toBe(JSON.stringify([123]));
  })

  it('should decode Date to ISO date string', () => {
    const date = new Date();
    const result = testDataMapper.decode({ nickname: date });
    expect(result.nickname).toBe(date.toISOString());
  })
});

describe('bool', () => {

  // Encode
  // -----------------
  it('should encode boolean to boolean', () => {
    const result = testDataMapper.encode({ is_online: true });
    expect(result.isOnline).toBeTruthy();
  })

  it('should encode number > 0 to true', () => {
    const result = testDataMapper.encode({ is_online: 123 });
    expect(result.isOnline).toBeTruthy();
  })

  it('should encode number == 0 to false', () => {
    const result = testDataMapper.encode({ is_online: 0 });
    expect(result.isOnline).toBeFalsy();
  })

  it('on encode null should delete property', () => {
    const result = testDataMapper.encode({ is_online: null });
    expect(result.hasOwnProperty('isOnline')).toBeFalsy();
  })

  it('on encode undefined should delete property', () => {
    const result = testDataMapper.encode({ is_online: void 0 });
    expect(result.hasOwnProperty('isOnline')).toBeFalsy();
  })

  it('should encode object to boolean', () => {
    const result = testDataMapper.encode({ is_online: { a: 123 } });
    expect(result.isOnline).toBeTruthy();
  })

  it('should encode any array to true', () => {
    const result = testDataMapper.encode({ is_online: [123] });
    expect(result.isOnline).toBeTruthy();
    const result2 = testDataMapper.encode({ is_online: [] });
    expect(result2.isOnline).toBeTruthy();
    const result3 = testDataMapper.encode({ is_online: [''] });
    expect(result3.isOnline).toBeTruthy();
    const result4 = testDataMapper.encode({ is_online: [false] });
    expect(result4.isOnline).toBeTruthy();
  })

  it('should encode Date to true', () => {
    const date = new Date();
    const result = testDataMapper.encode({ is_online: date });
    expect(result.isOnline).toBeTruthy();
  })

  it('should encode string \'true\' to boolean true', () => {
    const result = testDataMapper.encode({ is_online: 'true' });
    expect(result.isOnline).toBeTruthy();
  })

  it('should encode string \'false\' to boolean false', () => {
    const result = testDataMapper.encode({ is_online: 'false' });
    expect(result.isOnline).toBeFalsy();
  })

  // Decode
  // -----------------
  it('should decode boolean to boolean', () => {
    const result = testDataMapper.decode({ isOnline: true });
    expect(result.is_online).toBeTruthy();
  })

  it('should decode number > 0 to true', () => {
    const result = testDataMapper.decode({ isOnline: 123 });
    expect(result.is_online).toBeTruthy();
  })

  it('should decode number == 0 to false', () => {
    const result = testDataMapper.decode({ isOnline: 0 });
    expect(result.is_online).toBeFalsy();
  })

  it('on decode null should delete property', () => {
    const result = testDataMapper.decode({ isOnline: null });
    expect(result.hasOwnProperty('is_online')).toBeFalsy();
  })

  it('on decode undefined should delete property', () => {
    const result = testDataMapper.decode({ isOnline: void 0 });
    expect(result.hasOwnProperty('is_online')).toBeFalsy();
  })

  it('should decode object to boolean', () => {
    const result = testDataMapper.decode({ isOnline: { a: 123 } });
    expect(result.is_online).toBeTruthy();
  })

  it('should decode any array to true', () => {
    const result = testDataMapper.decode({ isOnline: [123] });
    expect(result.is_online).toBeTruthy();
    const result2 = testDataMapper.decode({ isOnline: [] });
    expect(result2.is_online).toBeTruthy();
    const result3 = testDataMapper.decode({ isOnline: [''] });
    expect(result3.is_online).toBeTruthy();
    const result4 = testDataMapper.decode({ isOnline: [false] });
    expect(result4.is_online).toBeTruthy();
  })

  it('should decode Date to true', () => {
    const date = new Date();
    const result = testDataMapper.decode({ isOnline: date });
    expect(result.is_online).toBeTruthy();
  })

  it('should decode string \'true\' to boolean true', () => {
    const result = testDataMapper.decode({ isOnline: 'true' });
    expect(result.is_online).toBeTruthy();
  })

  it('should decode string \'false\' to boolean false', () => {
    const result = testDataMapper.decode({ isOnline: 'false' });
    expect(result.is_online).toBeFalsy();
  })
});

describe('datetime', () => {

  // Encode
  // -----------------
  it('on encode boolean should delete property', () => {
    const result = testDataMapper.encode({ created_at: true });
    expect(result.hasOwnProperty('createdAt')).toBeFalsy();
  })

  it('should encode number to date', () => {
    const num = 1223123;
    const result = testDataMapper.encode({ created_at: num });
    expect(result.createdAt).toBe((new Date(num)).toISOString());
  })

  it('on encode null should delete property', () => {
    const result = testDataMapper.encode({ created_at: null });
    expect(result.hasOwnProperty('createdAt')).toBeFalsy();
  })

  it('on encode undefined should delete property', () => {
    const result = testDataMapper.encode({ created_at: void 0 });
    expect(result.hasOwnProperty('createdAt')).toBeFalsy();
  })

  it('on encode object should delete property', () => {
    const result = testDataMapper.encode({ created_at: { a: 123 } });
    expect(result.hasOwnProperty('createdAt')).toBeFalsy();
  })

  it('should encode array should delete property', () => {
    const result = testDataMapper.encode({ created_at: [123] });
    expect(result.hasOwnProperty('createdAt')).toBeFalsy();
  })

  it('should encode Date to ISO string', () => {
    const date = new Date();
    const result = testDataMapper.encode({ created_at: date });
    expect(result.createdAt).toBe(date.toISOString());
  })

  // Decode
  // -----------------
  it('on decode boolean should delete property', () => {
    const result = testDataMapper.decode({ createdAt: true });
    expect(result.hasOwnProperty('created_at')).toBeFalsy();
  })

  it('should decode number to date', () => {
    const num = 1223123;
    const result = testDataMapper.decode({ createdAt: num });
    expect(result.created_at).toBe((new Date(num)).toISOString());
  })

  it('on decode null should delete property', () => {
    const result = testDataMapper.decode({ createdAt: null });
    expect(result.hasOwnProperty('created_at')).toBeFalsy();
  })

  it('on decode undefined should delete property', () => {
    const result = testDataMapper.decode({ createdAt: void 0 });
    expect(result.hasOwnProperty('created_at')).toBeFalsy();
  })

  it('on decode object should delete property', () => {
    const result = testDataMapper.decode({ createdAt: { a: 123 } });
    expect(result.hasOwnProperty('created_at')).toBeFalsy();
  })

  it('should decode array should delete property', () => {
    const result = testDataMapper.decode({ createdAt: [123] });
    expect(result.hasOwnProperty('created_at')).toBeFalsy();
  })

  it('should decode Date to ISO string', () => {
    const date = new Date();
    const result = testDataMapper.decode({ createdAt: date });
    expect(result.created_at).toBe(date.toISOString());
  })
});

describe('arrayOf', () => {

  // Encode
  // -----------------
  it('encode boolean should create array of boolean', () => {
    const result = testDataMapper.encode({ states: true });
    expect(result.states).toStrictEqual([true]);
  })

  it('encode number should create array of number', () => {
    const result = testDataMapper.encode({ states: 123 });
    expect(result.states).toStrictEqual([123]);
  })

  it('on encode null should delete property', () => {
    const result = testDataMapper.encode({ states: null });
    expect(result.hasOwnProperty('states')).toBeFalsy();
  })

  it('on encode undefined should delete property', () => {
    const result = testDataMapper.encode({ states: void 0 });
    expect(result.hasOwnProperty('states')).toBeFalsy();
  })

  it('encode object should create array of object', () => {
    const result = testDataMapper.encode({ states: { a: 123 } });
    expect(result.states).toStrictEqual([{ a: 123 }]);
  })

  it('should encode array of primitive types', () => {
    const result = testDataMapper.encode({ states: [123, 2] });
    expect(result.states).toStrictEqual(['123', '2']);
  })

  it('should encode Date to array of dates', () => {
    const date = new Date();
    const result = testDataMapper.encode({ states: date });
    expect(result.states).toStrictEqual([date]);
  })

  // Decode
  // -----------------
  it('decode boolean should create array of boolean', () => {
    const result = testDataMapper.decode({ states: true });
    expect(result.states).toStrictEqual([true]);
  })

  it('decode number should create array of number', () => {
    const result = testDataMapper.decode({ states: 123 });
    expect(result.states).toStrictEqual([123]);
  })

  it('on decode null should delete property', () => {
    const result = testDataMapper.decode({ states: null });
    expect(result.hasOwnProperty('states')).toBeFalsy();
  })

  it('on decode undefined should delete property', () => {
    const result = testDataMapper.decode({ states: void 0 });
    expect(result.hasOwnProperty('states')).toBeFalsy();
  })

  it('decode object should create array of object', () => {
    const result = testDataMapper.decode({ states: { a: 123 } });
    expect(result.states).toStrictEqual([{ a: 123 }]);
  })

  it('should decode array of primitive types', () => {
    const result = testDataMapper.decode({ states: [123, 2] });
    expect(result.states).toStrictEqual(['123', '2']);
  })

  it('should decode Date to array of dates', () => {
    const date = new Date();
    const result = testDataMapper.decode({ states: date });
    expect(result.states).toStrictEqual([date]);
  })
});

// todo shapeOf, encodeEntityKey, decodeEntityKey