import { RepositorySettings } from './RepositorySettings';
import { ResourceResponse } from '../interfaces/ResourceResponse';

export const DefaultRepositorySettings: RepositorySettings = {
  extractResponseData: (response: ResourceResponse) => {
    return typeof response === 'object' ? response.data : null;
  },
  extractResponseMeta: (response: ResourceResponse) => {
    return typeof response === 'object' ? response.meta : null;
  },
  decodeSearchParams: (params: Record<string, any>) => {
    const { page, per_page, sort, response, ...search } = params;
    return {
      search,
      page,
      per_page,
      order: sort,
      response,
    };
  }
};
