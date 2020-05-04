export interface BaseAttrMapConfig {
  map: string,
  encode?: (a: any, b: any) => any,
  decode?: (a: any, b: any) => any
}