# Domain-js

Domain-js is a library contains generic classes that helps make CRUD operations easy with Domain-Driven Design principles.

  - Typescript support
  - Rest API approach
  - No dependencies

## Installation

Domain-js requires [Node.js](https://nodejs.org/) v8.12.0+ to run.

Install the library with npm.

```sh
$ npm install --save @snap-alex/domain-js
```

Or yarn.

```sh
$ yarn add @snap-alex/domain-js
```

## Basic Usage
Create a core resource based on url. Example with cross-fetch library;
```typescript
import { FetchResource } from "@snap-alex/domain-js";
import fetch from "cross-fetch";

const httpResource = new FetchResource('https://www.books.com/api/v0', fetch);
export default httpResource;
```

### Create Entity interface
The collection interface we want to manage
```typescript
export interface Book {
  id?: number
  title: string
  created_at: string
  updated_at: string
}
```

### Create entity rest resoyrce
Use BaseRestResource class for create Entity resource endpoint. Based on previosly created httpResource instance.
```typescript
import { BaseRestResource } from "@snap-alex/domain-js";
import httpResource from './core/infrastructure/httpResource';

const bookResource = new BaseRestResource(httpResource, 'books');
export default bookResource;
```

Already you can use your rest resource for requests
```typescript
import { BaseRestResource } from "@snap-alex/domain-js";
import bookResource './books/bookResource';

// CREATE on https://www.books.com/api/v0/books
bookResource.create({ title: 'Tom' }) as Promise<any>;

// PUT on https://www.books.com/api/v0/books
bookResource.update({ title: 'Tom' }) as Promise<any>;

// PATCH on https://www.books.com/api/v0/books
bookResource.patch({ title: 'Tom' }) as Promise<any>;

// GET on https://www.books.com/api/v0/books?title=Tom
bookResource.get({ title: 'Tom' }) as Promise<any>;

// DELETE on https://www.books.com/api/v0/books
bookResource.delete({ title: 'Tom' }) as Promise<any>;

// Create child resource with uri - https://www.books.com/api/v0/books/additional
const newChildResource1: BaseRestResource = bookResource.child('additional');

// Create child resource with uri strings - https://www.books.com/api/v0/books/additional/path
const newChildResource2: BaseRestResource = bookResource.child('additional', 'path');

```

### Let's start manage our collection through Repository!

But we have a model User and now we have to create Repository
```typescript
import { BaseRepository } from "@snap-alex/domain-js";
import bookResource from './books/bookResource';
import { Book } from './books/Book';

const bookRepository = new BaseRepository<Book>(bookResource)

// Check Entity is new (by id existence)
userRepository.isEntityNew({ id: 1, title: 'Tom' }) as boolean;

// Create Book 
// POST on https://www.books.com/api/v0/books 
userRepository.create({ title: 'Tom' }) as Promise<Book>;

// Update Book 
// PUT on https://www.books.com/api/v0/books/1 
userRepository.update({ id: 1, title: 'Tom' }) as Promise<Book>;

// Patch Book 
// PATCH on https://www.books.com/api/v0/books/1 
userRepository.patch({ id: 1, title: 'Tom' }) as Promise<Book>;

// Load Books
// GET on https://www.books.com/api/v0/books
cosnt books = await userRepository.load() as Promise<ArrayMeta<Book>>;
books.forEach((book) => console.log(book.title))
books.meta // containts meta server information

// Load Book by ID
// GET on https://www.books.com/api/v0/books/1
userRepository.loadById(1) as Promise<Book>;

// Delete Book
// DELETE on https://www.books.com/api/v0/books/1
userRepository.delete({ id: 1, title: 'Tom' }) as Promise<void>;

// Search Books
// todo describe search pagination params in Readme
```

### We can setup another Entity Id
```typescript
import { BaseRepository } from "@snap-alex/domain-js";
import bookResource from './books/bookResource';
import { Book } from './books/Book';

class BookRepository extends BaseRepository {
  entityIdName = 'uuid';
}

const bookRepository = new BookRepository<Book>(bookResource)

// Update Book 
// PUT on https://www.books.com/api/v0/books/101js1mx12jkej
userRepository.update({ uuid: '101js1mx12jkej', title: 'Tom' }) as Promise<Book>;
```

## Advanced

### Using DataMappers
Date mappers are used to encode response from the server to format we need and reverse the conversion before sending Entity to server.

### Mapping strategy
Let's define strategy for encode / decode our data
```typescript
import { BaseMapType } from "@snap-alex/domain-js";

const mappingStrategy = {
  id: BaseMapType.number,
  nickname: BaseMapType.string,
  isOnline: BaseMapType.bool.asAttrMap('is_online'),
  createdAt: BaseMapType.dateTime.asAttrMap('created_at'),
  states: BaseMapType.arrayOf(BaseMapType.string),
  avatar: BaseMapType.shapeOf({
    id: BaseMapType.number,
    url: BaseMapType.string
  }),
  city: BaseMapType.decodeEntityKey()({
    id: BaseMapType.number,
    title: BaseMapType.string
  }),
  ticket: BaseMapType.decodeEntityKey('uuid')({
    uuid: BaseMapType.string,
    cinema: BaseMapType.string
  }),
  roleId: BaseMapType.encodeEntityKey()({
    id: BaseMapType.number,
    title: BaseMapType.string,
  }).asAttrMap('role'),
  customMap: {
    map: 'custom_map',
    encode: (value: any) => value && value.custom_map,
    decode: (value: any) => {
      return value && `${value.customMap.id}.${value.customMap.title}`;
    }
  }
}
```

We can define encoded / decoded interfaces (optional)
```typescript
interface Encoded {
  id: number
  nickname: string
  isOnline: boolean
  createdAt: string
  states: string[]
  avatar: {
    id: number
    url: string
  }
  city: {
    id: number
    title: string
  }
  ticket: {
    uuid: string
    cinema: string
  }
  roleId: number
  customMap: {
    id: number
    title: string
  }
}

interface Decoded {
  id: number | string
  nickname: string
  is_online: boolean
  created_at: string
  states: string[]
  avatar: {
    id: number | string
    url: string
  }
  city: {
    id: number | string
    title: string
  }
  ticket: {
    uuid: string
    cinema: string
  }
  role: {
    id: number | string
    title: string
  }
  custom_map: {
    id: number | string
    title: string
  }
}
```

Create our DataMapper
```typescript
const testDataMapper = new BaseDataMapper<Encoded, Decoded>(mappingStrategy)
```

Use it for decode / encode data
```typescript
const encodedTest = testDataMapper.encode({
  id: '1',
  nickname: 'Bob',
  is_online: false,
  created_at: '2018-02-08',
  states: ['new'],
  avatar: {
    id: 1,
    url: 'url'
  }
})

// return an object
{
  id: 1
  nickname: 'Bob',
  isOnline: false,
  createdAt: '2018-02-08'
  states: ['new']
  avatar: {
    id: 1,
    url: 'url'
  }
}
```

### Use DataMapper with Repository!
bookRepository will automatically use bookDataMapper for encode and decode data before receive / send data.
```typescript
import { BaseRepository } from "@snap-alex/domain-js";
import bookResource from './books/bookResource';
import bookDataMapper from './boooks/bookDataMapper';
import { Book } from './books/Book';

const bookRepository = new BaseRepository<Book>(bookResource, bookDataMapper)
```

### Todos

 - Implement GraphQL resource

License
----

MIT

