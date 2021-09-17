import { AxiosResource } from "../../src/resources/axios/AxiosResource";


document.addEventListener('DOMContentLoaded', () => {
  function component(): any {
    const element = document.createElement('div');

    element.innerHTML = ['Hello', 'webpack'].join(' ');

    return element;
  }

  document.body.appendChild(component());

  // ---------------
  const httpResource = new AxiosResource('https://www.books.com/api/v0');
  httpResource.get('test');
});
