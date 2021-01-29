export { RenderContext } from '@storybook/core';

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export interface ElementArgs {
  el: HTMLElement;
}

export type OptionsArgs = Template | StoryDeclaration;

export type Template = () => void;
export type StoryDeclaration = {
  template: Template;
  engine?: string;
  context?: {
    [key: string]: any;
  };
};
