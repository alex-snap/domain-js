import { BaseEntity } from "./BaseEntity";
import { BaseMeta } from "./BaseMeta";

export interface ArrayMeta<Entity = BaseEntity, Meta = BaseMeta>
  extends Array<Entity> {
  meta?: Meta;
}
