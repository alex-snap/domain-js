import { AxiosResponse } from "axios";

export function createSuccessAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'success',
    headers: {},
    config: {}
  }
}
