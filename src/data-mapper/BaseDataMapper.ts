import { BaseMapType } from "./BaseMapType";

export class BaseDataMapper<EncodedForUse extends object = {}, DecodedForSend extends object = {}> {
  constructor(private mappingStrategy: any) {}

  public encode(a: any): EncodedForUse {
    return BaseMapType.encode<EncodedForUse>(a, this.mappingStrategy);
  }

  public decode(a: any): DecodedForSend {
    return BaseMapType.decode<DecodedForSend>(a, this.mappingStrategy);
  }
}