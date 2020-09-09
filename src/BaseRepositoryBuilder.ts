import { BaseRepository } from "./BaseRepository";
import { BaseRestResource } from "./BaseRestResource";
import { BaseDataMapper } from "./data-mapper/index";

export class BaseRepositoryBuilder {
  constructor(
    private Repository: typeof BaseRepository,
    private dataMapper?: BaseDataMapper<any, any>,
    private resource: BaseRestResource = null,
    ) {
  }

  public build(Resource = this.resource) {
    if (!Resource) {
      throw new TypeError('BaseRepositoryBuilder#build(): Resource should be defined');
    }

    return new (this.Repository)(Resource, this.dataMapper);
  }
}
