import { BaseAttrMapConfig } from "./BaseAttrMapConfig";

export interface BaseMappingMethod {
  decode: (a: any) => any
  encode: (a: any) => any
  asAttrMap?: (decodeKey: string) => BaseAttrMapConfig
}