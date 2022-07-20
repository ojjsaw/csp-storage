import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { PanelLayout } from '@lumino/widgets';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid/Grid';

import StorageProvider from './storageProvider';
import CspDetails from './cspDetails';


import ViewImportList from './viewImportList';
import { CommandRegistry } from '@lumino/commands';

interface IProps {
  commands: CommandRegistry
}

export enum PageType {
  SelectCSP = 0,
  CSPDetails = 1,
  ViewImportList = 2
}

export interface IDataProps {
  myval: string;
  showlist: boolean;
  page: PageType;
  listArray: Array<any>;
  userName: string;
  bucketName: string;

}

export class IntroComponent extends React.Component<IProps, IDataProps> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      myval: 'hello',
      showlist: false,
      page: PageType.SelectCSP,
      listArray: [],
      userName: '',
      bucketName: ''
    };
    this.stateHandler = this.stateHandler.bind(this);
  }

  stateHandler = (val: any) => {
    console.log("In handler", val);
    this.setState(val)
  }

  render() {
    const pageState = this.state.page;
    let _renderTest;

    switch (pageState) {
      case PageType.SelectCSP:
        _renderTest = <StorageProvider stateHandler={this.stateHandler} commands={this.props.commands}></StorageProvider>;
        break;
      case PageType.CSPDetails:
        _renderTest = <CspDetails stateHandler={this.stateHandler}></CspDetails>;
        break;
      case PageType.ViewImportList:
        _renderTest = <ViewImportList stateHandler={this.stateHandler} viewList={this.state.listArray} userName={this.state.userName} bucketName={this.state.bucketName} commands={this.props.commands}></ViewImportList>
        break;
      default:
        _renderTest = <div>hello</div>;
        break;
    }

    return (
      <div style={{ height: '90vh', overflowX: 'hidden', overflowY: 'scroll', width: '100%' }}>
        <Grid container
          spacing={10}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ width: 'calc(70%)' }}>

          <Grid item>
            <Typography style={{ margin: "0px" }} variant="h6" component="h1" gutterBottom>
              Cloud Storage Connector
            </Typography>
          </Grid>

          {_renderTest}

        </Grid>
      </div>
    );
  }
}

export class IntroWidget extends ReactWidget {

  private _commands: CommandRegistry;

  constructor(commands: CommandRegistry) {
    super();
    this.addClass('intro-page-view');
    this._commands = commands;
    this.layout = new PanelLayout();
  }

  render(): JSX.Element {
    return (
      <React.Fragment>
        <IntroComponent commands={this._commands} />
      </React.Fragment>
    );
  }
}