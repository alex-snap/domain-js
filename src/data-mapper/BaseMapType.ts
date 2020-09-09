import { get, set, isString, isObject, isFunction } from "../helpers";
import { BaseMappingMethod } from "./interfaces/BaseMappingMethod";
import { BaseAttrMapConfig } from "./interfaces/BaseAttrMapConfig";

export class BaseMapType {

  static number = BaseMapType.decorateWithAsAttrMap({
    encode: (value) => {
      if (value != null) {
        if (typeof value === 'string' || typeof value === 'number') {
          return Number(value);
        }
        return Number.NaN;
      }
      return value;
    },
    decode: (value) => {
      if (value != null) {
        if (typeof value === 'string' || typeof value === 'number') {
          return Number(value);
        }
        return null;
      }
      return value;
    },
  });

  static string = BaseMapType.decorateWithAsAttrMap({
    encode: (value) => {
      if (value != null) {
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (isObject(value) || Array.isArray(value)) {
          return JSON.stringify(value);
        }
        return String(value);
      }
      return value;
    },
    decode: (value) => {
      if (value != null) {
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (isObject(value) || Array.isArray(value)) {
          return JSON.stringify(value);
        }
        return String(value);
      }
      return value;
    },
  });

  static bool = BaseMapType.decorateWithAsAttrMap({
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

  static dateTime = BaseMapType.decorateWithAsAttrMap({
    encode: (value: any): Date | any => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'boolean' || isObject(value)) {
        return null;
      }
      if (value != null) {
        return new Date(value).toISOString();
      }
      return value;
    },
    decode: (value: Date | any) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'boolean' || isObject(value)) {
        return null;
      }
      if (value != null) {
        return new Date(value).toISOString();
      }
      return value;
    }
  });

  static arrayOf(mappingStrategy?: any|BaseMappingMethod): BaseMappingMethod {
    return BaseMapType.decorateWithAsAttrMap({
      encode: (values) => {
        if (values && values.length && mappingStrategy) {
          return values.map((value: any) => {
            if (mappingStrategy && mappingStrategy.hasOwnProperty('encode')) {
              return mappingStrategy.encode(value);
            }
            if (isObject(value)) {
              return BaseMapType.map(value, mappingStrategy);
            }
            return null;
          });
        }
        if (values == null) {
          return values;
        }
        return [values];
      },
      decode: (values) => {
        if (values && values.length && mappingStrategy) {
          return values.map((value: any) => {
            if (mappingStrategy && mappingStrategy.hasOwnProperty('encode')) {
              return mappingStrategy.encode(value);
            }
            if (isObject(value)) {
              return BaseMapType.reverseMap(value, mappingStrategy);
            }
            return null;
          });
        }
        if (values == null) {
          return values;
        }
        return [values];
      }
    });
  }

  static shapeOf(mappingStrategy?: object): BaseMappingMethod {
    return BaseMapType.decorateWithAsAttrMap({
      encode: (value) => value && mappingStrategy
        ? BaseMapType.map(value, mappingStrategy)
        : value,
      decode: (value) => value && mappingStrategy
        ? BaseMapType.reverseMap(value, mappingStrategy)
        : value
    });
  }

  static decodeEntityKey(key: string = 'id'): (s?: object) => BaseMappingMethod {
    return (mappingStrategy?: object) => {
      return BaseMapType.decorateWithAsAttrMap({
        encode: (value) => value && mappingStrategy
          ? BaseMapType.map(value, mappingStrategy)
          : value,
        decode: (value) => value != null
          ? value[key]
          : value
      });
    };
  }

  static encodeEntityKey(key: string = 'id'): (s?: object) => BaseMappingMethod {
    return (mappingStrategy?: object) => {
      return BaseMapType.decorateWithAsAttrMap({
        encode: (value) => value != null
          ? value[key]
          : value,
        decode: (value) => value && mappingStrategy
          ? BaseMapType.reverseMap(value, mappingStrategy)
          : value
      });
    };
  }

  static encode<T>(source: any, mappingStrategy: any): T {
    return BaseMapType.map(source, mappingStrategy) as T;
  }

  static decode<T>(source: any, mappingStrategy: any): T {
    return BaseMapType.reverseMap(source, mappingStrategy) as T;
  }

  static resolveDecodedValuePath(attrMapConfig: object | string, resultAttributePath: string) {
    if (isString(attrMapConfig)) {
      return attrMapConfig;
    }
    if (isObject(attrMapConfig) && isString((attrMapConfig as any).map)) {
      return (attrMapConfig as any).map;
    }
    return resultAttributePath;
  }

  static encodeAttribute(
    decodedObject: object,
    attrMapConfig: BaseAttrMapConfig,
    decodedAttributePath: string) {
    const decodedValue = get(decodedObject, decodedAttributePath);
    if (isFunction(attrMapConfig.encode)) {
      return attrMapConfig.encode(decodedValue, decodedObject)
    }

    return decodedValue;
  }

  static decodeAttribute(encodedObject: any,
    attrMapConfig: BaseAttrMapConfig,
    encodedAttributePath: string) {

    const encodedValue = encodedObject[encodedAttributePath];
    if (isFunction(attrMapConfig.decode)) {
      return attrMapConfig.decode(encodedValue, encodedObject);
    }

    return encodedValue;
  }

  static reverseMap(encodedObject: object, strategy: any) {
    const strategyKeys = Object.keys(strategy);
    let strategyKeysCount = strategyKeys.length;
    const result = {};

    while (strategyKeysCount--) {
      const encodedAttributePath = strategyKeys[strategyKeysCount];
      const attrMapConfig = strategy[encodedAttributePath];
      const decodedAttributePath = BaseMapType.resolveDecodedValuePath(attrMapConfig, encodedAttributePath);

      if (decodedAttributePath) {
        const decodedValue = BaseMapType.decodeAttribute(
          encodedObject,
          attrMapConfig,
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
      const attrMapConfig = strategy[resultAttributePath];
      const decodedAttributePath = BaseMapType.resolveDecodedValuePath(attrMapConfig, resultAttributePath);
      if (resultAttributePath) {
        const encodedValue = BaseMapType.encodeAttribute(
          decodedObject,
          attrMapConfig,
          decodedAttributePath
        );

        if (encodedValue != null) {
          set(result, resultAttributePath, encodedValue);
        }
      }
    }

    return result;
  }

  static decorateWithAsAttrMap(dataMapper: BaseMappingMethod): BaseMappingMethod {
    dataMapper.asAttrMap = (decodeKey: string) => {
      return {
        map: decodeKey,
        encode: (value) => dataMapper.encode(value),
        decode: (value) => dataMapper.decode(value)
      };
    };

    return dataMapper;
  }

}
