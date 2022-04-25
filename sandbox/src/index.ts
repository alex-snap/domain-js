import { AxiosResource } from "../../src/resources/axios/AxiosResource";
import { BaseRepository, BaseRestResource, FetchResource } from "../../src";

// const bindedFetch = fetch.bind(window);

document.addEventListener('DOMContentLoaded', () => {
  function component(): any {
    const element = document.createElement('div');

    element.innerHTML = ['Hello', 'webpack'].join(' ');

    return element;
  }

  document.body.appendChild(component());

  // ---------------
  // const httpResource = new AxiosResource('https://run.mocky.io/v3', { timeOffset: false });
  // const httpResource = new FetchResource(() => new Promise(resolve => resolve('https://run.mocky.io/v3')), { timeOffset: false, mode: 'cors' }, bindedFetch);

  const httpResource = new FetchResource(
    () => new Promise(resolve => resolve('https://run.mocky.io/v3')),
    {
      timeOffset: false,
      handleError: (e) => {
        console.log('e', e);
        debugger;
      }
    },
    // bindedFetch
  );
  // httpResource.get('test');
  // with data 82349c9e-4d84-4f9b-8d71-eb3afddd38e6
  // without data da25e601-c5a8-457f-8165-5257fc441a40

  const bookRestResource = new BaseRestResource(httpResource, 'da25e601-c5a8-457f-8165-5257fc441a40');

  const bookRepository = new BaseRepository(bookRestResource);

  bookRepository.load().then((response) => {
    console.log('books', response);
  });
});
