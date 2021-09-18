import { FetchResourceOptions } from './FetchResourceOptions';
import { ContentTypes } from '../../enums/ContentTypes';

export const DefaultFetchResourceOptions: FetchResourceOptions = {
  headers: {},
  trailingSlash: true,
  responseType: 'json',
  contentType: ContentTypes.JSON,
  accessType: 'json',
  mode: 'same-origin',
  cache: 'default',
  credentials: 'same-origin',
  redirect: 'follow',
  referrer: 'client',
  timeOffset: true,
  handleError: undefined,
  queryParamsDecodeMode: 'comma',
};
