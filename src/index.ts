import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IntroWidget } from './components/intro';
import { IFileBrowserCommands } from '@jupyterlab/filebrowser';


/**
 * Initialization data for the csp-storage extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'csp-storage:plugin',
  autoStart: true,
  requires: [
    ILayoutRestorer,
    IFileBrowserCommands
  ],
  activate: async (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
    console.log('JupyterLab extension csp-storage is activated!');
    const introWidget = new IntroWidget(app.commands);
    introWidget.title.iconClass = 'test1-icon';
    introWidget.title.caption = 'Cloud Storage Connector';
    introWidget.id = 'intro-page-view';

    restorer.add(introWidget, 'intropage');
    app.shell.add(introWidget, 'left', { rank: 1000 });


    /*app.commands.execute('filebrowser:go-to-path', { 'path': '/aiworkflow/cloud-imports/s3'}).catch((reason) => {

      console.error(

        `An error occurred during the execution of filebrowser:go-to-path command.\n${reason}`

      );

    });  */


  }

};

export default plugin;
