import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'Engine/Routable/Button',
  engine: 'routable',
};

export const Button = () => ({
  template: hbs`<Button @title="Routable engine" />`,
  engine: 'routable',
});
