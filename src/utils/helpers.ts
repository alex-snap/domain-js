import { FetchResourceOptions } from "../resources/fetch/FetchResourceOptions";
import { ContentTypeEnum } from "../enums/ContentTypeEnum";

const hasOwnProp = Object.prototype.hasOwnProperty;

export function get(obj: any, path: string) {
  if (path != null) {
    let keys = Array.isArray(path) ? path : path.split('.');
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (!obj || !hasOwnProp.call(obj, key)) {
        obj = undefined;
        break;
      }
      obj = obj[key];
    }
    return obj;
  }
  return void 0;
}

export function set(obj: any, path: string, value: any) {
  let keys = Array.isArray(path) ? path : path.split('.');
  let i;
  for (i = 0; i < keys.length - 1; i++) {
    let key = keys[i];
    if (!hasOwnProp.call(obj, key)) obj[key] = {};
    obj = obj[key];
  }
  obj[keys[i]] = value;
  return value;
}

export function uuid() {
  // Public Domain/MIT
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// from lodash
const toString = Object.prototype.toString;

function getTag(value: any) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
}

export function isString<T>(
  value: T | string
): value is T extends string ? (unknown extends T ? never : string) : string {
  const type = typeof value;
  return (
    type === 'string' ||
    (type === 'object' &&
      value != null &&
      !Array.isArray(value) &&
      getTag(value) == '[object String]')
  );
}

export function isObject<T>(
  value: T | object
): value is T extends object ? (unknown extends T ? never : object) : object {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

export function isFunction<T>(
  value: T | ((...args: any[]) => any)
): value is T extends (...args: any[]) => any
? unknown extends T
? never
: (...args: any[]) => any
: (...args: any[]) => any {
  return typeof value === 'function';
}

export function extractBlobContent(blob: Blob) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      res(reader.result);
    });
    reader.addEventListener('error', () => {
      rej(reader.error);
    });
    reader.readAsArrayBuffer(blob);
  });
}

export function extractFormData(formData: FormData) {
  return Object.values(formData).reduce(
    (acc, [key, value]) => Object.assign(acc, { [key]: value }),
    {}
  );
}

export function decodeQueryString(
  params: Record<string, string | number | boolean | (string | number | boolean)[]> = {},
  mode: 'array' | 'comma') {
  return Object.keys(params)
    .map((k) => {
      const value = params[k];
      if (Array.isArray(value)) {
        switch (mode) {
          case 'array':
            return value
              .map((val) => `${encodeURIComponent(k)}[]=${encodeURIComponent(val)}`)
              .join('&');
          case 'comma':
          default:
            return `${encodeURIComponent(k)}=${value.join(',')}`;
        }
      } else if (value !== null && value !== undefined) {
        return `${encodeURIComponent(k)}=${encodeURIComponent(value)}`;
      }
    })
    .filter(Boolean)
    .join('&');
}

export function transformToFormData(
  body: Record<string, any>,
  form?: FormData,
  namespace?: string
): FormData {
  const formData = form || new FormData();
  for (const property in body) {
    const value = body[property];
    if (!body.hasOwnProperty(property) || !value) {
      continue;
    }
    const formKey = namespace
      ? Array.isArray(body)
        ? `${namespace}[]`
        : `${namespace}[${property}]`
      : property;
    if (value instanceof Date) {
      formData.append(formKey, (value as Date).toISOString());
    } else if (isFile(value)) {
      transformToFormData(value, formData, formKey);
    } else {
      formData.append(formKey, value);
    }
  }
  return formData;
}

export function isFile(value: any): boolean {
  // todo realize for React Native
  return typeof value === 'object'; //&& !(value instanceof File)
}

export function resolveHeaders(options: FetchResourceOptions): {} {
  const additionalHeaders: Record<string, string> = {};
  if (options.contentType === ContentTypeEnum.JSON) {
    additionalHeaders['Content-Type'] = 'application/json';
  } else if (options.contentType === ContentTypeEnum.FORM_DATA) {
    additionalHeaders['Content-Type'] = 'multipart/form-data';
  }
  if (options.responseType === 'json') {
    additionalHeaders['Accept'] = 'application/json';
  }

  return { ...options.headers, ...additionalHeaders };
}
