import difference from 'lodash/array/difference';

const SPECIAL_KEYS = ['constructor'];

export default function makeProxy(proxy) {
  let current = null;

  function createProxyMethod(key) {
    if (typeof current[key] !== 'function') {
      return current[key];
    }
    return function () {
      return typeof current[key] === 'function'
        ? current[key].apply(this, arguments)
        : current[key];
    }
  }

  return function proxyTo(fresh) {
    // Save current source of truth
    current = fresh;

    const freshKeys = Object.getOwnPropertyNames(fresh);
    const currentKeys = Object.getOwnPropertyNames(proxy);
    const addedKeys = difference(freshKeys, currentKeys, SPECIAL_KEYS);
    const removedKeys = difference(currentKeys, freshKeys, SPECIAL_KEYS);

    // Update proxy method list
    addedKeys.forEach(key => {
      try {
        proxy[key] = createProxyMethod(key);
      } catch (err) {
        // some methods can't be proxied
      }
    });
    removedKeys.forEach(key => {
      try {
        delete proxy[key];
      } catch (err) {
        // some methods can't be removed
      }
    })

    // The caller will use the proxy from now on
    return proxy;
  };
};