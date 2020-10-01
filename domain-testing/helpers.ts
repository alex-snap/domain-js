export const createMock = <T>(value?: Partial<T>): T => {
  return <T>(<unknown>value);
};
