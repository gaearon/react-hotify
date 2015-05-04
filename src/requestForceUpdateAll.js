import deepForceUpdate  from './deepForceUpdate';

let isRequestPending = false;

export default function requestForceUpdateAll(mountedInstances, React) {
  if (isRequestPending) {
    return;
  }

  /**
   * Forces deep re-render of all mounted React components.
   * Hat's off to Omar Skalli (@Chetane) for suggesting this approach:
   * https://gist.github.com/Chetane/9a230a9fdcdca21a4e29
   */
  function forceUpdateAll() {
    let instance = null;
    isRequestPending = false;

    mountedInstances.forEach((instance) => {
      // `|| instance` for React 0.12 and earlier
      instance = instance._reactInternalInstance || instance;
      deepForceUpdate(instance, React);
    });
  }

  setTimeout(forceUpdateAll);
};