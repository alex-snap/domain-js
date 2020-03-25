export interface Storage {

  setItem<T>(key: string, value: T): Promise<T>

  getItem<T>(key: string): Promise<T>

  removeItem(key: string): Promise<void>

}
