import Store from './index';
import { IOPtions } from './types';
import { OPEN_ID } from 'routers/history';

export interface CreateStoreOptions extends IOPtions {
  /**
   * storekey是否唯一
   * 跟用户相关的数据必须为true，防止串号
   *
   * @type {boolean}
   * @memberof CreateStoreOptions
   */
  isUniqueKey?: boolean;
}

/**
 * 创建Store
 * 业务调用请用此方法，后续将完善串号等问题
 *
 * @template T
 * @param {string} storeKey
 * @param {T} store
 * @param {IOPtions} options
 * @returns
 */
function createStore<T>(storeKey: string, store: T, options: CreateStoreOptions) {
  // 用户唯一标识符
  let uniqueSymbol = OPEN_ID;

  const { isUniqueKey = true, ...restOpts } = options;
  const uniqueKey = isUniqueKey ? uniqueSymbol : '';
  const uniqueStoreKey = `${storeKey}_${uniqueKey}`;

  return new Store(uniqueStoreKey, store, restOpts);
}

export default createStore;
