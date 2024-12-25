// Record<subId, depId>
type Target = Record<string, string>;

interface ISub {
  subscribeId: string;
  subscribe: () => (depId: string) => void;
}

export default class ActionSubscriber {
  constructor() {
    this.init();
  }

  private subscribesMap: Record<string, Array<ISub>> = {};
  // depId 依赖于当前被删掉的这个节点的objectId
  private unSubscribesMap: Record<string, Array<(depId: string) => void>> = {};

  private proxy: Target;

  private init() {
    const _that = this;
    this.proxy = new Proxy({}, {
      set(target: Target, property: string, value: string, receiver: Target) {
        if (_that.subscribesMap[property]) {
          _that.unSubscribesMap[property] =  _that.subscribesMap[property].map(sub => sub.subscribe());
        }
        return Reflect.set(target, property, value, receiver);
      },
      deleteProperty(target: Target, property: string) {
        // 是否有被依赖
        const hasSub = Object.values(target).includes(property);
        // 是否有依赖
        const hasDep = !!target[property];
        if (!hasSub && !hasDep) {
          return true;
        }
        if (_that.subscribesMap[property]) {
          _that.unSubscribesMap[property] = _that.subscribesMap[property].map(sub => sub.subscribe());
          _that.unSubscribesMap[property].forEach(unSubscribe => unSubscribe(property));
        }
        const unSubscribes: ISub[] = [];
        if (hasDep) {
          // 把自己加入到解绑订阅列表中
          unSubscribes.push({
            subscribeId: property,
            subscribe: () => () => void 0,
          });
        }
        if (hasSub) {
          unSubscribes.push(..._that.subscribesMap[property]);
        }
        _that.unRelationSubscribe(property, unSubscribes);
        delete _that.subscribesMap[property];
        delete _that.unSubscribesMap[property];
        delete target[property];
        // 将所有依赖property（depId）的节点映射删掉
        Object.keys(target).forEach(key => {
          if (target[key] === property) {
            delete target[key];
          }
        });
        return true; // 表示删除成功
      },
      defineProperty(target: Target, property: string, attribute: PropertyDescriptor) {
        return Reflect.defineProperty(target, property, attribute);
      }
    });
  }


  setValue(depId: string, subId: string) {
    this.proxy[subId] = depId;
  }

  getValue(subId: string) {
    return this.proxy[subId];
  }

  removeValue(subId: string) {
    delete this.proxy[subId];
  }

  // 删掉上级依赖和依赖自身的订阅函数的关系（祖与儿、孙关系的解除）
  unRelationSubscribe(depId: string, subs: ISub[]) {
    const depParentId = this.proxy[depId];
    if (depParentId) {
      subs.forEach(sub => {
        this.unSubscribe(depParentId, sub.subscribeId);
      });
      this.unRelationSubscribe(this.proxy[depParentId], subs);
    }
  }

  subscribe(dep: string, sub: ISub){
    if (!dep) {
      return;
    }
    if (this.subscribesMap[dep]) {
      this.subscribesMap[dep].push(sub);
    } else {
      this.subscribesMap[dep] = [sub];
    }
  }

  unSubscribe(depId: string, subId: string) {
    // 当切换依赖节点时，如果之前有依赖节点存在，则清除之前节点的依赖
    if (this.getSubscribes(depId).length) {
      this.subscribesMap[depId] = this.subscribesMap[depId].filter(sub => sub.subscribeId !== subId);
    }
  }

  getSubscribes(depId: string) {
    return this.subscribesMap[depId] || [];
  }

  clear() {
    this.subscribesMap = {};
    this.unSubscribesMap = {};
    this.init();
  }
}

