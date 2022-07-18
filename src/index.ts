import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IntroWidget } from './components/intro';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';


/**
 * Initialization data for the csp-storage extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'csp-storage:plugin',
  autoStart: true,
  requires: [
    ILayoutRestorer,
    IFileBrowserFactory
  ],
  activate: async (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
    console.log('JupyterLab extension csp-storage is activated!');
    const introWidget = new IntroWidget(app.commands);
    introWidget.title.iconClass = 'test1-icon';
    introWidget.title.caption = 'Cloud Storage Connector';
    introWidget.id = 'intro-page-view';

    restorer.add(introWidget, 'intropage');
    app.shell.add(introWidget, 'left', { rank: 1000 });

  }

};

export default plugin;
