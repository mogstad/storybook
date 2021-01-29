import { extractArgTypes, extractComponentDescription } from './jsondoc';
import { prepareForInline } from './prepareForInline';

export const parameters = {
  docs: {
    inlineStories: true,
    prepareForInline,
    iframeHeight: 80,
    extractArgTypes,
    extractComponentDescription,
  },
};
