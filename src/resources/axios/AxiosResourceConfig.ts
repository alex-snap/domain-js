import { AxiosRequestConfig } from 'axios';

export type AxiosResourceConfig = AxiosRequestConfig & {
  trailingSlash?: boolean
  timeOffset?: boolean
  queryParamsDecodeMode?: 'comma' | 'array';
};
