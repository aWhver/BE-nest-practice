
/** 接口：可配置项 */
export interface IOPtions {
  isUseLocalStorage: boolean;
  clearPrevStore: boolean;
}

/** 接口：订阅的对象 */
export interface ISubscribe<T> {
  fn: () => void;
  keys: T;
}