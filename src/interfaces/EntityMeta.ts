import { BaseEntity } from "./BaseEntity";
import { BaseMeta } from "./BaseMeta";

export interface EntityMeta extends BaseEntity {
  meta: BaseMeta;
}
