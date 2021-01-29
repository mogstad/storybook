import { window, document } from 'global';
import { precompile } from 'ember-source/dist/ember-template-compiler';
import { StoryDeclaration, Template } from '../types';

declare let Ember: any;

type Owner = {};

const OUTLET_TEMPLATE = precompile('{{outlet}}');
const EMPTY_TEMPLATE = precompile('');

const rootEl = document.getElementById('root');

const config = window.require(`${window.STORYBOOK_NAME}/config/environment`);
const app = window.require(`${window.STORYBOOK_NAME}/app`).default.create({
  autoboot: false,
  rootElement: rootEl,
  ...config.APP,
});

let appPromise: Promise<any>;

const engines: Record<string, Promise<Owner>> = {};
let templateId = 0;

function lookupTemplate(owner: any, templateFullName: string) {
  const template = owner.lookup(templateFullName);
  if (typeof template === 'function') {
    return template(owner);
  }
  return template;
}

function lookupOutletTemplate(owner: any): any {
  let OutletTemplate = lookupTemplate(owner, 'template:-outlet');
  if (!OutletTemplate) {
    owner.register('template:-outlet', OUTLET_TEMPLATE);
    OutletTemplate = lookupTemplate(owner, 'template:-outlet');
  }
  return OutletTemplate;
}

/**
 * Renders a normalized story declaration and renders it into an optional
 * element. If no element is provided, it renders into the root element.
 */
export async function renderStory(storyDeclaration: StoryDeclaration, el?: HTMLElement) {
  const appOwner = await ensureApp();
  const owner = storyDeclaration.engine
    ? await ensureEngine(appOwner, storyDeclaration.engine)
    : appOwner;

  const topLevelView = el ? prepareTopLevelView(appOwner, el) : ensureTopLevelView(appOwner);

  const controller = Ember.Object.create({ ...storyDeclaration.context });
  render(storyDeclaration.template, topLevelView, appOwner, owner, controller);
  return { controller, topLevelView };
}

/**
 * Renders a template into a top level view.
 */
async function render(
  template: Template,
  topLevelView: any,
  appOwner: any,
  owner: any = appOwner,
  controller?: any
) {
  const OutletTemplate = lookupOutletTemplate(appOwner);
  templateId += 1;

  const templateFullName = `template:-undertest-${templateId}`;
  owner.register(templateFullName, template);

  const outletState: any = {
    render: {
      owner: appOwner,
      into: undefined,
      outlet: 'main',
      name: 'application',
      controller: undefined,
      ViewClass: undefined,
      template: OutletTemplate,
    },

    outlets: {
      main: {
        render: {
          owner,
          into: undefined,
          outlet: 'main',
          name: 'index',
          controller,
          ViewClass: undefined,
          template: lookupTemplate(owner, templateFullName),
          outlets: {},
        },
        outlets: {},
      },
    },
  };

  topLevelView.setOutletState(outletState);
  Ember.run.backburner.ensureInstance();
}

export function normalizeStoryDeclaration(
  storyDeclaration: StoryDeclaration | Template
): StoryDeclaration {
  if (typeof storyDeclaration === 'function') {
    return { template: storyDeclaration };
  }
  return storyDeclaration;
}

function prepareTopLevelView(owner: any, el: HTMLElement) {
  /* eslint-disable no-underscore-dangle */
  const OutletView = owner.factoryFor
    ? owner.factoryFor('view:-outlet')
    : owner._lookupFactory('view:-outlet');

  const topLevelView = OutletView.create();

  render(EMPTY_TEMPLATE, topLevelView, owner);

  topLevelView.appendTo(el);
  return topLevelView;
}

async function ensureEngine(owner: any, engineName: string): Promise<Owner> {
  if (engines[engineName]) {
    return engines[engineName];
  }

  const engine = loadEngine(owner, engineName);
  engines[engineName] = engine;
  return engine;
}

async function loadEngine(owner: any, engineName: string) {
  const enginePath = `engine:${engineName}`;

  if (!owner.hasRegistration(enginePath)) {
    const assetLoader = owner.lookup('service:asset-loader');
    await assetLoader.loadBundle(engineName);
    owner.register(enginePath, window.require(`${engineName}/engine`).default);
  }

  const engine = owner.buildChildEngineInstance(engineName, {
    mountPoint: engineName,
    routable: true,
  });

  engines[engineName] = engine;
  await engine.boot();
  return engine;
}

async function ensureApp() {
  if (appPromise) {
    return appPromise;
  }
  appPromise = bootApp();
  return appPromise;
}

async function bootApp() {
  await app.boot();
  const appOwner = app.buildInstance();
  await appOwner.boot();
  return appOwner;
}

function ensureTopLevelView(owner: any) {
  let topLevelView = owner.lookup('-top-level-view:main');
  if (topLevelView) {
    return topLevelView;
  }

  topLevelView = prepareTopLevelView(owner, rootEl);
  owner.register('-top-level-view:main', {
    create() {
      return topLevelView;
    },
  });
  return topLevelView;
}
