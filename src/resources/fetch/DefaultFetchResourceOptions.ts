import { FetchResourceOptions } from './FetchResourceOptions';
import { ContentTypeEnum } from '../../enums/ContentTypeEnum';

export const DefaultFetchResourceOptions: FetchResourceOptions = {
  headers: {},
  trailingSlash: true,
  responseType: 'json',
  contentType: ContentTypeEnum.JSON,
  accessType: 'json',
  mode: 'same-origin',
  cache: 'default',
  credentials: 'same-origin',
  redirect: 'follow',
  referrer: 'client',
  timeOffset: true,
  queryParamsDecodeMode: 'comma',
};
