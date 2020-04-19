import { BaseRepository } from "./BaseRepository";
import { BaseRestResource } from "./BaseRestResource";
import { BaseDataMapper } from "./BaseDataMapper";

export class BaseRepositoryBuilder {
  constructor(
    private Repository: typeof BaseRepository,
    private DataMapper?: typeof BaseDataMapper,
    private resource: BaseRestResource = null,
    ) {
  }

  public build(Resource = this.resource) {
    if (!Resource) {
      throw new TypeError('BaseRepositoryBuilder#build(): Resource should be defined');
    }

    return new (this.Repository)(Resource, this.DataMapper);
  }
}
