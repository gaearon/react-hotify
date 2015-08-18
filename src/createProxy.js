import assign from 'lodash/object/assign';
import difference from 'lodash/array/difference';

const SPECIAL_KEYS = ['constructor'];

export default function createProxy(proxy) {
  let current = null;

  function createProxyMethod(key) {
    return function () {
      if (typeof current[key] === 'function') {
        return current[key].apply(this, arguments);
      }
    };
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
      if (typeof proxy[key] === 'function' || typeof current[key] === 'function') {
        proxy[key] = createProxyMethod(key);
        proxy[key].isReactClassApproved = current[key].isReactClassApproved;
      }
    });
    removedKeys.forEach(key => {
      delete proxy[key];
    })

    // The caller will use the proxy from now on
    return proxy;
  };
};