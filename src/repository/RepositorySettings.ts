import { ResourceResponse } from '../types/ResourceResponse';

export interface RepositorySettings {
  extractResponseData?: (response: ResourceResponse) => any;
  extractResponseMeta?: (response: ResourceResponse) => any | null;
  decodeSearchParams?: (params: Record<string, any>) => any | null;
}
