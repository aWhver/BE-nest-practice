import { parseJSON } from 'utils/tools/parseJSON';
import { IOPtions, ISubscribe } from './types';

/**
 * mini store
 * 微型数据管理的仓库库
 *
 * 必要的说明：
 * - 1. 订阅 subscribe： 只有先订阅后，set或update才能触发订阅函数，未订阅前的set和update是不会触发订阅函数的。
 *
 * @class Store
 * @template S
 */
class Store<S> {
  private store: S;
  private defaultState: S;
  private options: IOPtions;
  private subscribes: ISubscribe<Array<keyof S>>[];
  private storeKey: string;

  /**
   * Creates an instance of Store.
   * @param {string} storeKey 必须传 store的唯一key
   * @param {S} [defaultState={} as S] store默认数据
   * @param {IOPtions} [options={} as IOPtions] 配置项
   * @memberof Store
   */
  constructor(storeKey: string, defaultState: S = {} as S, options: IOPtions = {} as IOPtions) {
    this.storeKey = storeKey;
    this.store = defaultState;
    this.options = options;
    this.subscribes = [];
    this.defaultState = parseJSON(JSON.stringify(defaultState));
    if (this.options.clearPrevStore) {
      localStorage.removeItem(this.storeKey);
    }
    if (this.options.isUseLocalStorage) {
      const localStoreStr = localStorage.getItem(this.storeKey);
      if (localStoreStr) {
        this.store = parseJSON(localStoreStr);
      } else {
        localStorage.setItem(this.storeKey, JSON.stringify(defaultState));
      }
    }
  }

  /**
   * 设值
   *
   * @template K
   * @param {K} key  键
   * @param {S[K]} val  值
   * @memberof Store
   */
  set<K extends keyof S>(key: K, val: S[K]): void {
    this.store[key] = val;

    if (this.options.isUseLocalStorage) {
      const storeData = this.getStore();
      storeData[key] = val;

      localStorage.setItem(this.storeKey, JSON.stringify(storeData));
    }

    this.fire(key);
  }

  /**
   * 取值
   * @param key 获取值的key
   */
  get<K extends keyof S>(key: K): S[K] | undefined | null {
    const localStoreStr = localStorage.getItem(this.storeKey);

    if (this.options.isUseLocalStorage && localStoreStr) {
      const localStore = parseJSON(localStoreStr);
      return localStore[key];
    }
    return this.store[key];
  }

  /**
   * 返回整个store的数据
   *
   * @returns {S}
   * @memberof Store
   */
  getStore(): S {
    const localStoreStr = localStorage.getItem(this.storeKey);

    if (this.options.isUseLocalStorage && localStoreStr) {
      return parseJSON(localStoreStr);
    }

    return this.store;
  }

  /**
   * 更新store
   * @param storeFn 类似setState
   * @param callback 更新回调
   */
  update(storeFn: (store: S) => S, callback?: (store: S) => void): S {
    this.store = storeFn(this.store);
    // localStorage.store = this.store;
    callback && callback(this.store);
    if (this.options.isUseLocalStorage) {
      localStorage.setItem(this.storeKey, JSON.stringify(this.store));
    }
    this.fire(null);
    return this.store;
  }

  /**
   *  订阅值改变，类似useEffect
   *
   * @param {() => void} callback
   * @param {Array<keyof S>} keys 订阅的key，如果为空数组，则监听所有改变
   * @memberof Store
   */
  subscribe(callback: () => void, keys: Array<keyof S>) {
    const _this = this;
    this.subscribes.push({
      fn: callback,
      keys,
    });
    return function unSubscribe() {
      let idx = -1;
      _this.subscribes.find((cb, index) => {
        if (cb.fn === callback) {
          idx = index;
          return true;
        }
        return false;
      });
      if (idx > -1) {
        _this.subscribes.splice(idx, 1);
      }
    };
  }

  // 遍历触发订阅函数
  fire(key: keyof S | null) {
    this.subscribes.forEach(cbs => {
      const { fn, keys } = cbs;
      if (key === null) {
        fn();
        return;
      }
      if (keys.length === 0) {
        fn();
        return;
      }
      if (keys.includes(key)) {
        fn();
      }
    });
  }

  /** 清除store */
  clear(): void {
    this.store = {} as S;
    localStorage.removeItem(this.storeKey);
  }

  /** 将数据重置为初始状态 */
  reset(): void {
    this.store = parseJSON(JSON.stringify(this.defaultState));
    if (this.options.isUseLocalStorage) {
      localStorage.setItem(this.storeKey, JSON.stringify(this.store));
    }
  }
}

export default Store;
