export default function traverseRenderedChildren(internalInstance, callback, argument) {
  callback(internalInstance, argument);

  if (internalInstance._renderedComponent) {
    traverseRenderedChildren(
      internalInstance._renderedComponent,
      callback,
      argument
    );
  } else {
    for (let key in internalInstance._renderedChildren) {
      traverseRenderedChildren(
        internalInstance._renderedChildren[key],
        callback,
        argument
      );
    }
  }
}