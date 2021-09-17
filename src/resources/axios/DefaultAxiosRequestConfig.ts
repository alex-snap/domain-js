import { AxiosResourceConfig } from './AxiosResourceConfig';

export const DefaultAxiosRequestConfig: AxiosResourceConfig = {
  responseType: 'json',
  trailingSlash: true,
  timeOffset: true,
  queryParamsDecodeMode: 'comma',
};
