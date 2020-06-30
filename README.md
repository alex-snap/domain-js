# Domain-js

Domain-js is a library contains generic classes that helps make CRUD operations easy with Domain-Driven Design principles.

  - Typescript support
  - Rest API approach
  - No dependencies

### Installation

Domain-js requires [Node.js](https://nodejs.org/) v8.12.0+ to run.

Install the library with npm.

```sh
$ npm install --save @snap-alex/domain-js
```

Or yarn.

```sh
$ yarn add @snap-alex/domain-js
```

### Usage FetchResource
First, create a core resource based on url. Example with cross-fetch library;
```javascript
import { FetchResource } from "@snap-alex/domain-js";
import fetch from "cross-fetch";

const httpResource = new FetchResource('https://www.my-base-url.com', fetch);
export default httpResource;
```

Use httpResource instance for create endpoint Rest resources with BaseRestResource class.
```javascript
import { BaseRestResource } from "@snap-alex/domain-js";
import httpResource './core/infrastructure/httpResource';

const userResource = new BaseRestResource(httpResource, 'users');
export default userResource;
```

Already you can use your rest resource for requests
```javascript
import { BaseRestResource } from "@snap-alex/domain-js";
import userResource './users/userResource';

// GET on https://www.my-base-url.com/users?query=Tom
userResource.get({ query: 'Tom' });
// etc.
```

But we have a model User and now we have to create Repository
```javascript
import { BaseRepository } from "@snap-alex/domain-js";
import userResource './users/userResource';

const userRepository = new BaseRepository(userResource);

// Usage
// PUT on https://www.my-base-url.com/users/1 with body
userRepository.update({ id: 1, first_name: 'Tom' })
    .then((updatedTom) => console.log('Hello Tom!'));
```

### Todos

 - Implement GraphQL resource
 - Write README for features BaseRestResource, StorageResource, BaseRepository, BaseRepositoryBuilder, BaseDataMapper, BaseMapType

License
----

MIT

