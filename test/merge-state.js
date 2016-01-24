import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

const fixtures = {
  modern: {
    VersionA: class VersionA extends React.Component {
      constructor(props) {
        super(props);
      }

      render() {
        return <div>VersionA</div>;
      }
    },

    VersionB: class VersionB extends React.Component {
      constructor(props) {
        super(props);

        this.state = {
          counter: 1,
        };
      }

      render() {
        return <div>VersionB: {this.state.counter}</div>;
      }
    },

    VersionC: class VersionC extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          counter: 1,
          secondCounter: 1,
        };
      }

      render() {
        return <div>VersionC: {this.state.counter}{this.state.secondCounter}</div>;
      }
    },

    PropsDependent: class PropsDependent extends React.Component {
      constructor(props) {
        super(props);
        
        this.state = { counter: props.defaultCounter };
      }

      render() {
        return <div>{this.state.counter}</div>;
      }
    },
  },

  classic: {
    ClassicA: React.createClass({
      render() {
        return <div>ClassicA</div>;
      }
    }),

    ClassicB: React.createClass({
      getInitialState() {
        return { counter: 1 };
      },

      render() {
        return <div>ClassicB: {this.state.counter}</div>;
      }
    }),
  },
}

describe('merging state', () => {
  let renderer;
  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  describe('modern', () => {
    it('should merge initial state', () => {
      const { VersionA, VersionB } = fixtures.modern;
      const proxy = createProxy(VersionA);
      const Proxy = proxy.get();
      proxy.update(VersionB);
      renderer.render(<Proxy/>);
      expect(renderer.getRenderOutput().props.children).toEqual(['VersionB: ', 1]);
    });

    it('initializes state based on props', () => {
      const { VersionA, PropsDependent } = fixtures.modern;
      const proxy = createProxy(VersionA);
      const Proxy = proxy.get();
      renderer.render(<Proxy defaultCounter={3}/>);
      proxy.update(PropsDependent);
      renderer.render(<Proxy/>);
      expect(renderer.getRenderOutput().props.children).toEqual(3);
    });

    it('does not overwrite existing state', () => {
      const { VersionA, VersionB } = fixtures.modern;
      const proxy = createProxy(VersionA);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy/>);
      instance.setState({counter: 5});
      proxy.update(VersionB);
      renderer.render(<Proxy/>);
      expect(renderer.getRenderOutput().props.children).toEqual(['VersionB: ', 5]);
    });

    it('supports multiple updates', () => {
      const { VersionA, VersionB, VersionC } = fixtures.modern;
      const proxy = createProxy(VersionA);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy/>);
      proxy.update(VersionB);
      renderer.render(<Proxy/>);
      proxy.update(VersionC);
      renderer.render(<Proxy/>);
      expect(renderer.getRenderOutput().props.children).toEqual(['VersionC: ', 1, 1]);
    });
  });

  describe('classic', () => {
    it('should merge initial state', () => {
      const { ClassicA, ClassicB } = fixtures.classic;
      const proxy = createProxy(ClassicA);
      const Proxy = proxy.get();
      proxy.update(ClassicB);
      renderer.render(<Proxy/>);
      expect(renderer.getRenderOutput().props.children).toEqual(['ClassicB: ', 1]);
    });

    it('does not overwrite existing state', () => {
      const { ClassicA, ClassicB } = fixtures.classic;
      const proxy = createProxy(ClassicA);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy/>);
      instance.setState({counter: 5});
      proxy.update(ClassicB);
      renderer.render(<Proxy/>);
      expect(renderer.getRenderOutput().props.children).toEqual(['ClassicB: ', 5]);
    });
  });
});

