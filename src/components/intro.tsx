import React from 'react';
//import ReactDOM from 'react-dom';
import { ReactWidget } from '@jupyterlab/apputils';
import { PanelLayout } from '@lumino/widgets';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid/Grid';

import StorageProvider from './storageProvider';
import CspDetails from './cspDetails';
import ViewList from './viewList';

interface IProps { }

export enum PageType {
  SelectCSP = 0,
  CSPDetails = 1,
  ViewList = 2
}

export interface IDataProps {
  myval: string;
  showlist: boolean;
  page: PageType;
  listArray: Array<any>;
}

export class IntroComponent extends React.Component<IProps, IDataProps> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      myval: 'hello',
      showlist: false,
      page: PageType.SelectCSP,
      listArray: []
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
        _renderTest = <StorageProvider stateHandler={this.stateHandler}></StorageProvider>;
        break;
      case PageType.CSPDetails:
        _renderTest = <CspDetails stateHandler={this.stateHandler}></CspDetails>;
        break;
      case PageType.ViewList:
        _renderTest = <ViewList stateHandler={this.stateHandler} viewList={this.state.listArray}></ViewList>
        break;
      default:
        _renderTest = <div>hello</div>;
        break;
    }

    return (
      <div>
        <Grid container
          spacing={10}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: '30vh' }}>

          <Grid item>
            <Typography variant="h6" component="h1" gutterBottom>
              Intel® DevCloud Storage Connector
            </Typography>
          </Grid>

          {_renderTest}

        </Grid>
      </div>
    );
  }
}

export class IntroWidget extends ReactWidget {

  constructor() {
    super();
    this.addClass('intro-page-view');
    this.layout = new PanelLayout();
  }

  render(): JSX.Element {
    return (
      <React.Fragment>
        <IntroComponent />
      </React.Fragment>
    );
  }
}