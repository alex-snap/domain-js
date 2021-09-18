import { BaseRepository } from "./repository/BaseRepository";
import { BaseRestResource } from "./BaseRestResource";
import { BaseDataMapper } from "./data-mapper/index";
import { Constructor } from "./utils/Constructor";
import { BaseEntity } from "./interfaces/BaseEntity";
import { BaseMeta } from "./interfaces/BaseMeta";

export class BaseRepositoryBuilder<
  Entity extends BaseEntity = BaseEntity,
  Meta extends BaseMeta = BaseMeta
  > {
  constructor(
    private Repository: Constructor<BaseRepository<Entity, Meta>>,
    private dataMapper?: BaseDataMapper<any, any>
    ) {
  }

  public build(resource: BaseRestResource) {
    if (!resource) {
      throw new TypeError('BaseRepositoryBuilder#build(): Resource should be defined');
    }

    return new (this.Repository)(resource, this.dataMapper);
  }
}
