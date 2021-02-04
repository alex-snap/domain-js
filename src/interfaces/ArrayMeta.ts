import { BaseEntity } from "./BaseEntity";
import { BaseMeta } from "./BaseMeta";

export interface ArrayMeta<Entity extends BaseEntity = BaseEntity, Meta extends BaseMeta = BaseMeta>
  extends Array<Entity> {
  meta?: Meta;
}
