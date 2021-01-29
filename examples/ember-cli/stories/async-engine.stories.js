import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'Engine/Async/LazyButton',
};

export const Button = () => ({
  template: hbs`<LazyButton @title="Click me" />`,
  engine: 'async',
});
