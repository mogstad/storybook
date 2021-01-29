import dedent from 'ts-dedent';
import { RenderContext, OptionsArgs } from './types';
import { normalizeStoryDeclaration, renderStory } from './-private/render';

let currentStoryController: any | null = null;

export default async function renderMain({
  storyFn,
  kind,
  name,
  showMain,
  showError,
  forceRender,
}: RenderContext) {
  const storyDeclaration: OptionsArgs = storyFn();

  if (!storyDeclaration) {
    showError({
      title: `Expecting a Ember element from the story: "${name}" of "${kind}".`,
      description: dedent`
        Did you forget to return the Ember element from the story?
        Use "() => hbs('{{component}}')" or "() => { return {
          template: hbs\`{{component}}\`
        } }" when defining the story.
      `,
    });
    return;
  }

  showMain();

  const normalizedStoryDeclaration = normalizeStoryDeclaration(storyDeclaration);
  if (!currentStoryController || !forceRender) {
    const { controller } = await renderStory(normalizedStoryDeclaration);
    currentStoryController = controller;
  } else if (normalizedStoryDeclaration.context) {
    currentStoryController.setProperties(normalizedStoryDeclaration.context);
  }
}
