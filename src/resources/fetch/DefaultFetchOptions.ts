import { FetchOptions } from "./FetchOptions";
import { ContentTypes } from "../../enums/ContentTypes";

export const DefaultFetchOptions: FetchOptions = {
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
