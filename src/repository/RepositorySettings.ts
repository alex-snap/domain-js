import { ResourceResponse } from '../interfaces/ResourceResponse';

export interface RepositorySettings {
  extractResponseData?: (response: ResourceResponse) => any;
  extractResponseMeta?: (response: ResourceResponse) => any;
  decodeSearchParams?: (params: Record<string, any>) => any;
}
