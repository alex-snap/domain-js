import { AxiosResourceOptions } from './AxiosResourceOptions';

export const DefaultAxiosResourceOptions: AxiosResourceOptions = {
  responseType: 'json',
  trailingSlash: true,
  timeOffset: true,
  queryParamsDecodeMode: 'comma',
};
