import assign from 'lodash/assign';
import React, { Component } from 'react';
import shallowEqual from 'shallowequal';

export default function mergeState(component, NextComponent) {
  if (component instanceof React.Component) {
    // Modern components
    const nextComponentInstance = new NextComponent(component.props);
    const mergedState = assign({}, nextComponentInstance.state, component.state);
    if (!shallowEqual(component.state || {}, mergedState)) {
      component.setState(mergedState);
    }
  } else if (component.getInitialState) {
    // Classic components
    const mergedState = assign({}, component.getInitialState(), component.state);
    if (!shallowEqual(component.state || {}, mergedState)) {
      component.setState(mergedState);
    }
  }
}

