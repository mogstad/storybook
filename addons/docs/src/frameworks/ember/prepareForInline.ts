import React from 'react';
import { StoryFn, StoryContext } from '@storybook/addons';
import { renderStory, normalizeStoryDeclaration } from '@storybook/ember';

export const prepareForInline = (storyFn: StoryFn, storyContext: StoryContext) => {
  const storyDeclaration = normalizeStoryDeclaration(storyFn());
  const el = React.useRef(null);

  React.useEffect(() => {
    const render = async () => {
      const application = (await renderStory(storyDeclaration, el.current)) as {
        topLevelView: any;
        controller: any;
      };
      return application;
    };

    const application = render();

    return () => {
      application.then(({ topLevelView }) => {
        topLevelView.renderer.cleanupRootFor(topLevelView);
      });
    };
  }, [el]);
  return React.createElement('div', { ref: el });
};
