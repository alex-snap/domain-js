type WithStatus = {
  _status?: number;
}

export type ResourceResponse<T = any> = T & WithStatus;

