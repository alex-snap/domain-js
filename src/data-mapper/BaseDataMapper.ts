import { BaseMapType } from "./BaseMapType";

export class BaseDataMapper<T, M> {
  constructor(private mappingStrategy: any) {}

  public encode(a: any): T {
    return BaseMapType.encode<T>(a, this.mappingStrategy);
  }

  public decode(a: any): M {
    return BaseMapType.decode<M>(a, this.mappingStrategy);
  }
}