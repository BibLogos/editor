export function cache() {
    const cache: { [k: string]: any } = {};
    
    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        const cacheKey = `__cacheKey__${args.toString()}`;
        if (!cache.hasOwnProperty(cacheKey)) {
          cache[cacheKey] = originalMethod.apply(this, args);
        }
        return cache[cacheKey];
      }
    }
  }