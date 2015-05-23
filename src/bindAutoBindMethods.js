/**
 * Performs auto-binding similar to how React does it.
 * Skips already auto-bound methods.
 * Based on https://github.com/facebook/react/blob/b264372e2b3ad0b0c0c0cc95a2f383e4a1325c3d/src/classic/class/ReactClass.js#L639-L705
 */
export default function bindAutoBindMethods(internalInstance) {
  const component = typeof internalInstance.getPublicInstance === 'function' ?
    internalInstance.getPublicInstance() :
    internalInstance;

  for (let autoBindKey in component.__reactAutoBindMap) {
    if (!component.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
      continue;
    }

    // Skip already bound methods
    if (component.hasOwnProperty(autoBindKey) &&
        component[autoBindKey].__reactBoundContext === component) {
      continue;
    }

    let method = component.__reactAutoBindMap[autoBindKey];
    component[autoBindKey] = bindAutoBindMethod(component, method);
  }
};

function bindAutoBindMethod(component, method) {
  const boundMethod = method.bind(component);

  boundMethod.__reactBoundContext = component;
  boundMethod.__reactBoundMethod = method;
  boundMethod.__reactBoundArguments = null;

  const componentName = component.constructor.displayName;
  const _bind = boundMethod.bind;

  boundMethod.bind = function (newThis) {
    const args = Array.prototype.slice.call(arguments, 1);
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

    const reboundMethod = _bind.apply(boundMethod, arguments);
    reboundMethod.__reactBoundContext = component;
    reboundMethod.__reactBoundMethod = method;
    reboundMethod.__reactBoundArguments = args;

    return reboundMethod;
  };

  return boundMethod;
}