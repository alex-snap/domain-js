import { get, set, isString, isObject, isFunction } from "../helpers";
import { BaseMappingMethod } from "./interfaces/BaseMappingMethod";
import { BaseAttrMapConfig } from "./interfaces/BaseAttrMapConfig";

export class BaseMapType {

  static number = BaseMapType.decorateWithAsAttrMap({
    encode: (value) => value != null ? Number(value) : value,
    decode: (value) => value != null ? Number(value) : value,
  });

  static string = BaseMapType.decorateWithAsAttrMap({
    encode: (value) => value != null ? String(value) : value,
    decode: (value) => value != null ? String(value) : value,
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
    encode: (value: string): Date | any => {
      if (value != null) return new Date(value);
      return value;
    },
    decode: (value: Date | any) => {
      if (value instanceof Date) return value.toString();
      return value;
    }
  });

  static arrayOf(mappingStrategy?: object): BaseMappingMethod {
    return BaseMapType.decorateWithAsAttrMap({
      encode: (values) => {
        if (values && values.length && mappingStrategy) {
          return values.map((value: any) => BaseMapType.map(value, mappingStrategy));
        }
        return values;
      },
      decode: (values) => {
        if (values && values.length && mappingStrategy) {
          return values.map((value: any) => BaseMapType.reverseMap(value, mappingStrategy));
        }
        return values;
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

  static resolveDecodedValuePath(BaseAttrMapConfig: object | string) {
    if (isString(BaseAttrMapConfig)) {
      return BaseAttrMapConfig;
    }
    if (isObject(BaseAttrMapConfig) && isString((BaseAttrMapConfig as any).map)) {
      return (BaseAttrMapConfig as any).map;
    }
    return null;
  }

  static encodeAttribute(decodedObject: object,
    BaseAttrMapConfig: BaseAttrMapConfig,
    decodedAttributePath: string) {

    const decodedValue = get(decodedObject, decodedAttributePath);
    if (isFunction(BaseAttrMapConfig.encode)) {
      return BaseAttrMapConfig.encode(decodedValue, decodedObject)
    }

    return decodedValue;
  }

  static decodeAttribute(encodedObject: any,
    BaseAttrMapConfig: BaseAttrMapConfig,
    encodedAttributePath: string) {

    const encodedValue = encodedObject[encodedAttributePath];
    if (isFunction(BaseAttrMapConfig.decode)) {
      return BaseAttrMapConfig.decode(encodedValue, encodedObject);
    }

    return encodedValue;
  }

  static reverseMap(encodedObject: object, strategy: any) {
    const strategyKeys = Object.keys(strategy);
    let strategyKeysCount = strategyKeys.length;
    const result = {};

    while (strategyKeysCount--) {
      const encodedAttributePath = strategyKeys[strategyKeysCount];
      const BaseAttrMapConfig = strategy[encodedAttributePath];
      const decodedAttributePath = this.resolveDecodedValuePath(BaseAttrMapConfig);

      if (decodedAttributePath) {
        const decodedValue = this.decodeAttribute(
          encodedObject,
          BaseAttrMapConfig,
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
      const BaseAttrMapConfig = strategy[resultAttributePath];
      const decodedAttributePath = this.resolveDecodedValuePath(BaseAttrMapConfig);

      if (resultAttributePath) {
        const encodedValue = this.encodeAttribute(
          decodedObject,
          BaseAttrMapConfig,
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
