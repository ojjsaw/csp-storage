import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the csp-storage extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'csp-storage:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension csp-storage is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The csp_storage server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
