import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

import { IntroWidget } from './components/intro';

/**
 * Initialization data for the csp-storage extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'csp-storage:plugin',
  autoStart: true,
  requires: [
    ILayoutRestorer
  ],
  activate: async (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
    console.log('JupyterLab extension csp-storage is activated!');

    const introWidget = new IntroWidget();
    introWidget.title.iconClass = 'test1-icon';
    introWidget.title.caption = 'Cloud Storage Connector';
    introWidget.id = 'intro-page-view';

    restorer.add(introWidget, 'intropage');
    app.shell.add(introWidget, 'left', { rank: 1000 });

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The mix server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
