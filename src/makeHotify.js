import makeProxy from './makeProxy';
import makePatchReactClass from './makePatchReactClass';

export default function makeHotify(React) {
  const proxyTo = makeProxy({});
  const mountedInstances = [];
  let CurrentClass = null;
  let patcher = null;

  function HotClass () {
    CurrentClass.apply(this, arguments);
  }

  function forceUpdate(instance) {
    React.Component.prototype.forceUpdate.call(instance);
  }

  return function hotify(NextClass) {
    CurrentClass = NextClass;

    if (typeof NextClass.prototype.__reactAutoBindMap === 'object') {
      // created by `React.createClass` so let's patch it
      if (!patcher) {
        patcher = makePatchReactClass(mountedInstances, React);
      }

      trackMount(NextClass.prototype, mountedInstances);
      return patcher(NextClass);
    }

    // ES6 class so let's send the methods through proxy
    HotClass.prototype = trackMount(proxyTo(NextClass.prototype), mountedInstances);
    HotClass.prototype.__proto__ = NextClass.prototype;
    HotClass.prototype.constructor = HotClass;
    HotClass.prototype.constructor.__proto__ = NextClass;

    mountedInstances.forEach(forceUpdate);
    return HotClass;
  };
}

/**
 * Wraps componentWillMount and componentWillUnmount to
 * push and remove instances from `mountedInstances`.
 * This lets us `forceUpdate` instances when we need to.
 *
 * We could listen to componentDidMount, but shallow renderer
 * we're using in tests doesn't call it, and we don't really care.
 */
function trackMount(prototype, mountedInstances) {
  const realComponentWillMount = prototype.componentWillMount;
  prototype.componentWillMount = function componentWillMount() {
    mountedInstances.push(this);

    if (realComponentWillMount) {
      realComponentWillMount.apply(this, arguments);
    }
  };

  const realComponentWillUnmount = prototype.componentWillUnmount;
  prototype.componentWillUnmount = function componentWillUnmount() {
    mountedInstances.splice(mountedInstances.indexOf(this), 1);

    if (realComponentWillUnmount) {
      realComponentWillUnmount.apply(this, arguments);
    }
  };

  return prototype;
}