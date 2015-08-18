import React from 'react';
import createProxy from './createProxy';

/**
 * Force-updates an instance regardless of whether
 * it descends from React.Component or not.
 */
function forceUpdate(instance) {
  React.Component.prototype.forceUpdate.call(instance);
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

function bindAutoBindMethod(component, method) {
  var boundMethod = method.bind(component);

  boundMethod.__reactBoundContext = component;
  boundMethod.__reactBoundMethod = method;
  boundMethod.__reactBoundArguments = null;

  var componentName = component.constructor.displayName,
      _bind = boundMethod.bind;

  boundMethod.bind = function (newThis) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (newThis !== component && newThis !== null) {
      console.warn(
        'bind(): React component methods may only be bound to the ' +
        'component instance. See ' + componentName
      );
    } else if (!args.length) {
      console.warn(
        'bind(): You are binding a component method to the component. ' +
        'React does this for you automatically in a high-performance ' +
        'way, so you can safely remove this call. See ' + componentName
      );
      return boundMethod;
    }

    var reboundMethod = _bind.apply(boundMethod, arguments);
    reboundMethod.__reactBoundContext = component;
    reboundMethod.__reactBoundMethod = method;
    reboundMethod.__reactBoundArguments = args;

    return reboundMethod;
  };

  return boundMethod;
}

function bindAutoBindMethods(component) {
  for (var autoBindKey in component.__reactAutoBindMap) {
    if (!component.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
      continue;
    }

    var method = component.__reactAutoBindMap[autoBindKey];
    component[autoBindKey] = bindAutoBindMethod(component, method);
  }
}

export default function createPatch() {
  const proxyTo = createProxy({
    __reactAutoBindMap: undefined
  });
  const mountedInstances = [];
  let CurrentClass = null;

  function HotClass() {
    CurrentClass.apply(this, arguments);
  }

  return function patch(NextClass) {
    CurrentClass = NextClass;

    // Wow, this is dense!
    // I have no idea what's going on here, but it works.
    HotClass.prototype = trackMount(proxyTo(NextClass.prototype), mountedInstances);
    HotClass.prototype.__proto__ = NextClass.prototype;
    HotClass.prototype.constructor = HotClass;
    HotClass.prototype.constructor.__proto__ = NextClass;

    mountedInstances.forEach(bindAutoBindMethods);
    mountedInstances.forEach(forceUpdate);

    return HotClass;
  };
}