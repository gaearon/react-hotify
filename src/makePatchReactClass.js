import makeAssimilatePrototype from './makeAssimilatePrototype';
import requestForceUpdateAll from './requestForceUpdateAll';

/**
 * Returns a function that will patch React class with new versions of itself
 * on subsequent invocations. Both legacy and ES6 style classes are supported.
 */
export default function makePatchReactClass(mountedInstances, React) {
  const assimilatePrototype = makeAssimilatePrototype();
  let FirstClass = null;

  return function patchReactClass(NextClass) {
    const nextPrototype = getPrototype(NextClass);
    assimilatePrototype(nextPrototype);

    if (FirstClass) {
      requestForceUpdateAll(mountedInstances, React);
    }

    return FirstClass || (FirstClass = NextClass);
  };
};

function hasNonStubTypeProperty(ReactClass) {
  if (!ReactClass.hasOwnProperty('type')) {
    return false;
  }

  const descriptor = Object.getOwnPropertyDescriptor(ReactClass, 'type');
  if (typeof descriptor.get === 'function') {
    return false;
  }

  return true;
}

function getPrototype(ReactClass) {
  let prototype = ReactClass.prototype;
  const seemsLegit = prototype && typeof prototype.render === 'function';

  if (!seemsLegit && hasNonStubTypeProperty(ReactClass)) {
    prototype = ReactClass.type.prototype;
  }

  return prototype;
}