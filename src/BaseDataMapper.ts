import { get, set, isString, isObject, isFunction } from "./helpers";

export interface IBaseDataMapper<T, M> {
  decode: (a: any) => M
  encode: (a: any) => T
}

export interface IBaseMappingMethod {
  decode: (a: any) => any
  encode: (a: any) => any
  asAttrMap?: (decodeKey: string) => AttributeMapStrategy
}

interface AttributeMapStrategy {
  map: string,
  encode?: (a: any, b: any) => any,
  decode?: (a: any, b: any) => any
}

export class BaseDataMapper<T, M> implements IBaseDataMapper<T, M> {
  constructor(private mappingStrategy: any) {}

  public encode(a: any): T {
    return BaseMappingType.encode<T>(a, this.mappingStrategy);
  }

  public decode(a: any): M {
    return BaseMappingType.decode<M>(a, this.mappingStrategy);
  }
}

export class BaseMappingType {

  static number = BaseMappingType.decorateWithAsAttrMap({
    encode: (value) => value != null ? Number(value) : value,
    decode: (value) => value != null ? Number(value) : value,
  });

  static string = BaseMappingType.decorateWithAsAttrMap({
    encode: (value) => value != null ? String(value) : value,
    decode: (value) => value != null ? String(value) : value,
  });

  static bool = BaseMappingType.decorateWithAsAttrMap({
    encode: (value) => {
      if (value != null) {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return Boolean(value);
      }

      return value;
    },
    decode: (value) => {
      if (value != null) {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return Boolean(value);
      }

      return value;
    }
  });

  static dateTime = BaseMappingType.decorateWithAsAttrMap({
    encode: (value: string): Date | any => {
      if (value != null) return new Date(value);
      return value;
    },
    decode: (value: Date | any) => {
      if (value instanceof Date) return value.toString();
      return value;
    }
  });

  static arrayOf(mappingStrategy?: object): IBaseMappingMethod {
    return BaseMappingType.decorateWithAsAttrMap({
      encode: (values) => {
        if (values && values.length && mappingStrategy) {
          return values.map((value: any) => BaseMappingType.map(value, mappingStrategy));
        }
        return values;
      },
      decode: (values) => {
        if (values && values.length && mappingStrategy) {
          return values.map((value: any) => BaseMappingType.reverseMap(value, mappingStrategy));
        }
        return values;
      }
    });
  }

  static shapeOf(mappingStrategy?: object): IBaseMappingMethod {
    return BaseMappingType.decorateWithAsAttrMap({
      encode: (value) => value && mappingStrategy
        ? BaseMappingType.map(value, mappingStrategy)
        : value,
      decode: (value) => value && mappingStrategy
        ? BaseMappingType.reverseMap(value, mappingStrategy)
        : value
    });
  }

  static decodeEntityKey(key: string = 'id'): (s?: object) => IBaseMappingMethod {
    return (mappingStrategy?: object) => {
      return BaseMappingType.decorateWithAsAttrMap({
        encode: (value) => value && mappingStrategy
          ? BaseMappingType.map(value, mappingStrategy)
          : value,
        decode: (value) => value != null
          ? value[key]
          : value
      });
    };
  }

  static encodeEntityKey(key: string = 'id'): (s?: object) => IBaseMappingMethod {
    return (mappingStrategy?: object) => {
      return BaseMappingType.decorateWithAsAttrMap({
        encode: (value) => value != null
          ? value[key]
          : value,
        decode: (value) => value && mappingStrategy
          ? BaseMappingType.reverseMap(value, mappingStrategy)
          : value
      });
    };
  }

  static encode<T>(source: any, mappingStrategy: any): T {
    return BaseMappingType.map(source, mappingStrategy) as T;
  }

  static decode<T>(source: any, mappingStrategy: any): T {
    return BaseMappingType.reverseMap(source, mappingStrategy) as T;
  }

  static resolveDecodedValuePath(attributeMapStrategy: object | string) {
    if (isString(attributeMapStrategy)) {
      return attributeMapStrategy;
    }
    if (isObject(attributeMapStrategy) && isString((attributeMapStrategy as any).map)) {
      return (attributeMapStrategy as any).map;
    }
    return null;
  }

  static encodeAttribute(decodedObject: object,
                         attributeMapStrategy: AttributeMapStrategy,
                         decodedAttributePath: string) {

    const decodedValue = get(decodedObject, decodedAttributePath);
    if (isFunction(attributeMapStrategy.encode)) {
      return attributeMapStrategy.encode(decodedValue, decodedObject)
    }

    return decodedValue;
  }

  static decodeAttribute(encodedObject: any,
                         attributeMapStrategy: AttributeMapStrategy,
                         encodedAttributePath: string) {

    const encodedValue = encodedObject[encodedAttributePath];
    if (isFunction(attributeMapStrategy.decode)) {
      return attributeMapStrategy.decode(encodedValue, encodedObject);
    }

    return encodedValue;
  }

  static reverseMap(encodedObject: object, strategy: any) {
    const strategyKeys = Object.keys(strategy);
    let strategyKeysCount = strategyKeys.length;
    const result = {};

    while (strategyKeysCount--) {
      const encodedAttributePath = strategyKeys[strategyKeysCount];
      const attributeMapStrategy = strategy[encodedAttributePath];
      const decodedAttributePath = this.resolveDecodedValuePath(attributeMapStrategy);

      if (decodedAttributePath) {
        const decodedValue = this.decodeAttribute(
          encodedObject,
          attributeMapStrategy,
          encodedAttributePath
        );

        if (decodedValue != null) {
          set(result, decodedAttributePath, decodedValue);
        }
      }
    }

    return result;
  }

  static map(decodedObject: object, strategy: any) {
    const strategyKeys = Object.keys(strategy);
    let strategyKeysCount = strategyKeys.length;
    const result = {};

    while (strategyKeysCount--) {
      const resultAttributePath = strategyKeys[strategyKeysCount];
      const attributeMapStrategy = strategy[resultAttributePath];
      const decodedAttributePath = this.resolveDecodedValuePath(attributeMapStrategy);

      if (resultAttributePath) {
        const encodedValue = this.encodeAttribute(
          decodedObject,
          attributeMapStrategy,
          decodedAttributePath
        );

        if (encodedValue != null) {
          set(result, resultAttributePath, encodedValue);
        }
      }
    }

    return result;
  }

  static decorateWithAsAttrMap(dataMapper: IBaseMappingMethod): IBaseMappingMethod {
    dataMapper.asAttrMap = (decodeKey: string) => {
      return {
        map: decodeKey,
        encode: (value) => value && dataMapper.encode(value),
        decode: (value) => value && dataMapper.decode(value)
      };
    };

    return dataMapper;
  }

}


// import { get, set, isString, isObject, isFunction } from "./helpers";

// export interface IBaseDataMapper {
//   decode: (a: any) => any
//   encode: (a: any) => any
//   asAttrMap?: (decodeKey: string) => AttributeMapStrategy
// }

// interface AttributeMapStrategy {
//   map: string,
//   encode?: (a: any, b: any) => any,
//   decode?: (a: any, b: any) => any
// }

// export class BaseDataMapper {

//   static number = BaseDataMapper.decorateWithAsAttrMap({
//     encode: (value) => value != null ? Number(value) : value,
//     decode: (value) => value != null ? Number(value) : value,
//   });

//   static string = BaseDataMapper.decorateWithAsAttrMap({
//     encode: (value) => value != null ? String(value) : value,
//     decode: (value) => value != null ? String(value) : value,
//   });

//   static bool = BaseDataMapper.decorateWithAsAttrMap({
//     encode: (value) => {
//       if (value != null) {
//         if (value === 'true') return true;
//         if (value === 'false') return false;
//         return Boolean(value);
//       }

//       return value;
//     },
//     decode: (value) => {
//       if (value != null) {
//         if (value === 'true') return true;
//         if (value === 'false') return false;
//         return Boolean(value);
//       }

//       return value;
//     }
//   });

//   static dateTime = BaseDataMapper.decorateWithAsAttrMap({
//     encode: (value: string): Date | any => {
//       if (value != null) return new Date(value);
//       return value;
//     },
//     decode: (value: Date | any) => {
//       if (value instanceof Date) return value.toString();
//       return value;
//     }
//   });

//   static arrayOf(mappingStrategy?: object): IBaseDataMapper {
//     return BaseDataMapper.decorateWithAsAttrMap({
//       encode: (values) => {
//         if (values && values.length && mappingStrategy) {
//           return values.map((value: any) => BaseDataMapper.map(value, mappingStrategy));
//         }
//         return values;
//       },
//       decode: (values) => {
//         if (values && values.length && mappingStrategy) {
//           return values.map((value: any) => BaseDataMapper.reverseMap(value, mappingStrategy));
//         }
//         return values;
//       }
//     });
//   }

//   static shapeOf(mappingStrategy?: object): IBaseDataMapper {
//     return BaseDataMapper.decorateWithAsAttrMap({
//       encode: (value) => value && mappingStrategy
//         ? BaseDataMapper.map(value, mappingStrategy)
//         : value,
//       decode: (value) => value && mappingStrategy
//         ? BaseDataMapper.reverseMap(value, mappingStrategy)
//         : value
//     });
//   }

//   static decodeEntityKey(key: string = 'id'): (s?: object) => IBaseDataMapper {
//     return (mappingStrategy?: object) => {
//       return BaseDataMapper.decorateWithAsAttrMap({
//         encode: (value) => value && mappingStrategy
//           ? BaseDataMapper.map(value, mappingStrategy)
//           : value,
//         decode: (value) => value != null
//           ? value[key]
//           : value
//       });
//     };
//   }

//   static encodeEntityKey(key: string = 'id'): (s?: object) => IBaseDataMapper {
//     return (mappingStrategy?: object) => {
//       return BaseDataMapper.decorateWithAsAttrMap({
//         encode: (value) => value != null
//           ? value[key]
//           : value,
//         decode: (value) => value && mappingStrategy
//           ? BaseDataMapper.reverseMap(value, mappingStrategy)
//           : value
//       });
//     };
//   }
  
//   static get mappingStrategy() {
//     return {};
//   }

//   static encode(source: object) {
//     return this.map(source, this.mappingStrategy);
//   }

//   static decode(source: object) {
//     return this.reverseMap(source, this.mappingStrategy);
//   }

//   static resolveDecodedValuePath(attributeMapStrategy: object | string) {
//     if (isString(attributeMapStrategy)) {
//       return attributeMapStrategy;
//     }
//     if (isObject(attributeMapStrategy) && isString((attributeMapStrategy as any).map)) {
//       return (attributeMapStrategy as any).map;
//     }
//     return null;
//   }

//   static encodeAttribute(decodedObject: object,
//                          attributeMapStrategy: AttributeMapStrategy,
//                          decodedAttributePath: string) {

//     const decodedValue = get(decodedObject, decodedAttributePath);
//     if (isFunction(attributeMapStrategy.encode)) {
//       return attributeMapStrategy.encode(decodedValue, decodedObject)
//     }

//     return decodedValue;
//   }

//   static decodeAttribute(encodedObject: any,
//                          attributeMapStrategy: AttributeMapStrategy,
//                          encodedAttributePath: string) {

//     const encodedValue = encodedObject[encodedAttributePath];
//     if (isFunction(attributeMapStrategy.decode)) {
//       return attributeMapStrategy.decode(encodedValue, encodedObject);
//     }

//     return encodedValue;
//   }

//   static reverseMap(encodedObject: object, strategy: any) {
//     const strategyKeys = Object.keys(strategy);
//     let strategyKeysCount = strategyKeys.length;
//     const result = {};

//     while (strategyKeysCount--) {
//       const encodedAttributePath = strategyKeys[strategyKeysCount];
//       const attributeMapStrategy = strategy[encodedAttributePath];
//       const decodedAttributePath = this.resolveDecodedValuePath(attributeMapStrategy);

//       if (decodedAttributePath) {
//         const decodedValue = this.decodeAttribute(
//           encodedObject,
//           attributeMapStrategy,
//           encodedAttributePath
//         );

//         if (decodedValue != null) {
//           set(result, decodedAttributePath, decodedValue);
//         }
//       }
//     }

//     return result;
//   }

//   static map(decodedObject: object, strategy: any) {
//     const strategyKeys = Object.keys(strategy);
//     let strategyKeysCount = strategyKeys.length;
//     const result = {};

//     while (strategyKeysCount--) {
//       const resultAttributePath = strategyKeys[strategyKeysCount];
//       const attributeMapStrategy = strategy[resultAttributePath];
//       const decodedAttributePath = this.resolveDecodedValuePath(attributeMapStrategy);

//       if (resultAttributePath) {
//         const encodedValue = this.encodeAttribute(
//           decodedObject,
//           attributeMapStrategy,
//           decodedAttributePath
//         );

//         if (encodedValue != null) {
//           set(result, resultAttributePath, encodedValue);
//         }
//       }
//     }

//     return result;
//   }

//   static decorateWithAsAttrMap(dataMapper: IBaseDataMapper): IBaseDataMapper {
//     dataMapper.asAttrMap = (decodeKey: string) => {
//       return {
//         map: decodeKey,
//         encode: (value) => value && dataMapper.encode(value),
//         decode: (value) => value && dataMapper.decode(value)
//       };
//     };

//     return dataMapper;
//   }

// }
