import React from 'react';
import createShallowRenderer from '../helpers/createShallowRenderer';
import expect from 'expect.js';
import { createPatch } from '../../src';

const Bar = React.createClass({
  render() {
    return <div>Bar</div>;
  }
});

const Baz = React.createClass({
  render() {
    return <div>Baz</div>;
  }
});

const Foo = React.createClass({
  render() {
    return <div>Foo</div>;
  }
});

const BarShouldComponentUpdateFalse = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    return <div>Bar</div>;
  }
});

const BazShouldComponentUpdateFalse = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    return <div>Baz</div>;
  }
});

const FooShouldComponentUpdateFalse = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    return <div>Foo</div>;
  }
});

describe('classic force update', () => {
  let renderer;
  let patch;

  beforeEach(() => {
    renderer = createShallowRenderer();
    patch = createPatch();
  });

  it('gets triggered', () => {
    const HotBar = patch(Bar);
    renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    patch(Baz);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    patch(Foo);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });

  it('gets triggered with strict shouldComponentUpdate', () => {
    const HotBarShouldComponentUpdateFalse = patch(BarShouldComponentUpdateFalse);
    renderer.render(<HotBarShouldComponentUpdateFalse />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    patch(BazShouldComponentUpdateFalse);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    patch(FooShouldComponentUpdateFalse);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });
});
