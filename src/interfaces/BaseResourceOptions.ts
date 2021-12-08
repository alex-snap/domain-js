export interface BaseResourceOptions {
  trailingSlash?: boolean
  timeOffset?: boolean
  queryParamsDecodeMode?: 'comma' | 'array';
  handleError?: (payload: { response: any; parsedBody: any }) => any;
}
