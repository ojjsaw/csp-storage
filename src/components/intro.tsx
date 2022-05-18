import Button from '@material-ui/core/Button';
import React from 'react';
//import ReactDOM from 'react-dom';
import { ReactWidget } from '@jupyterlab/apputils';
import { PanelLayout } from '@lumino/widgets';
//import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';
import NativeSelect from '@material-ui/core/NativeSelect/NativeSelect';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid/Grid';

import { requestAPI } from '../handler';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/Folder';
import RefreshIcon from '@material-ui/icons/Refresh';
import { IconButton } from '@material-ui/core';

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

  }

  OnSelectCSP = async () => {
    // GET request
    try {
      const data = await requestAPI<any>('init_s3_api');
      this.setState({
        myval: JSON.stringify(data),
        page: PageType.CSPDetails
      });
      console.log(data);
    } catch (reason) {
      console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
    }
  }

  OnCSPDetails: React.FormEventHandler<HTMLFormElement> = async (event) => {

    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log(data.get('ACCESS_KEY_ID'));
    const dataToSend = {
      ACCESS_KEY_ID: data.get('ACCESS_KEY_ID'),
      SECRET_ACCESS_KEY: data.get('SECRET_ACCESS_KEY'),
      BUCKET_NAME: data.get('BUCKET_NAME'),
    };
    // POST request
    try {
      const reply = await requestAPI<any>('init_s3_api', {
        body: JSON.stringify(dataToSend),
        method: 'POST',
      });
      this.setState({
        myval: JSON.stringify(reply),
        page: PageType.ViewList,
      });
      console.log(reply);
    } catch (reason) {
      console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
    }
  }

  OnFileUpload: React.FormEventHandler<HTMLFormElement> = async (event) => {

    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log(data.get('UPLOAD_FILE_PATH'));
    const dataToSend = {
      UPLOAD_FILE_PATH: data.get('UPLOAD_FILE_PATH'),
      my_type: "upload"
    };

    // POST request
    try {
      const reply = await requestAPI<any>('list_api', {
        body: JSON.stringify(dataToSend),
        method: 'POST',
      });
      this.setState({
        myval: JSON.stringify(reply),
        page: PageType.ViewList,
      });
      console.log(reply);
    } catch (reason) {
      console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
    }
  }

  OnRefreshList = async () => {
    // GET request
    try {
      const data = await requestAPI<any>('list_api');
      this.setState({
        //myval: JSON.stringify(data),
        page: PageType.ViewList,
        listArray: data
      });
      console.log(data);
    } catch (reason) {
      console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
    }
  }

  OnListClick = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {

    const dataToSend = { index: index, my_type: "download" };
    // POST request
    try {
      const reply = await requestAPI<any>('list_api', {
        body: JSON.stringify(dataToSend),
        method: 'POST',
      });
      this.setState({
        myval: JSON.stringify(reply),
        page: PageType.ViewList,
      });
      console.log(reply);
    } catch (reason) {
      console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
    }

  };

  render() {
    const pageState = this.state.page;
    const _viewlist = this.state.listArray;
    let _renderTest;
    switch (pageState) {
      case PageType.SelectCSP:
        _renderTest = <div>
          <Grid item>
            <InputLabel shrink htmlFor="age-native-label-placeholder">Cloud Storage Provider</InputLabel>
            <NativeSelect>
              <option value={10}>Amazon S3</option>
              <option value={20} disabled>Azure Blob Storage</option>
              <option value={30} disabled>Google Cloud Storage</option>
            </NativeSelect>
          </Grid>
          <Grid item>
            <FormHelperText>Storage Provider to import from.</FormHelperText>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={() => this.OnSelectCSP()}>
              Configure
            </Button>
          </Grid>
        </div>;
        break;
      case PageType.CSPDetails:
        _renderTest = <div>
          <form noValidate autoComplete="off" onSubmit={this.OnCSPDetails}>
            <Grid item>
              <InputLabel shrink htmlFor="age-native-label-placeholder">Access Key</InputLabel>
              <TextField required name="ACCESS_KEY_ID" id="ACCESS_KEY_ID" label="" variant="outlined" />
            </Grid>

            <Grid item>
              <InputLabel shrink htmlFor="age-native-label-placeholder">Secret Access Key</InputLabel>
              <TextField required name="SECRET_ACCESS_KEY" id="SECRET_ACCESS_KEY" label="" variant="outlined" />
            </Grid>

            <Grid item>
              <InputLabel shrink htmlFor="age-native-label-placeholder">Bucket Name</InputLabel>
              <TextField required name="BUCKET_NAME" id="BUCKET_NAME" label="" variant="outlined" />
            </Grid>

            <Grid item>
              <Button variant="contained" type="submit" color="primary">
                Submit
              </Button>
            </Grid>
          </form>
        </div>;
        break;
      case PageType.ViewList:
        _renderTest = <div>
          <Grid item>
                    <IconButton name="refreshList" onClick={() => this.OnRefreshList()}>
            <RefreshIcon color="primary" />
          </IconButton>
          </Grid>
          <List component="nav" aria-label="main mailbox folders" style={{maxHeight: '300px', overflow: 'auto'}}>
          {_viewlist.map((val, i) => 
          <Grid item>
          <ListItem 
            dense 
            button
            onClick={(event) => this.OnListClick(event, i)}
          >
          <ListItemIcon>
                <Checkbox />
              </ListItemIcon>
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
          <ListItemText primary={val} key={i} />
          </ListItem>
          </Grid> 
          )}
          </List>
          
          <Grid item>
          <form noValidate autoComplete="off" onSubmit={this.OnFileUpload}>
            <Grid item>
              <InputLabel shrink htmlFor="age-native-label-placeholder">Full Upload File Path</InputLabel>
              <TextField required name="UPLOAD_FILE_PATH" id="UPLOAD_FILE_PATH" label="" variant="outlined" />
            </Grid>
            <br/>
            <Grid item>
              <Button variant="contained" type="submit" color="primary">
                Upload File
              </Button>
            </Grid>
          </form>
          </Grid>

        </div>;
        //<Grid item>{this.state.myval}</Grid>
        //_renderTest = <div>{this.state.myval}</div>;
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