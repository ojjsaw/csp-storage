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

interface IProps { }

export enum PageType{
  SelectCSP = 0,
  CSPDetails = 1,
  ViewList = 2
}

export interface IDataProps {
  myval: string;
  showlist: boolean;
  page: PageType;
}

export class IntroComponent extends React.Component<IProps, IDataProps> {

  constructor(props: IProps){
    super(props);
    this.state = {
      myval: 'hello',
      showlist: false,
      page: PageType.SelectCSP
    };

  }

  OnSelectCSP = async () => {
       // GET request
       try {
        const data = await requestAPI<any>('get_example');
        this.setState({
          myval: JSON.stringify(data),
          page: PageType.CSPDetails
        });
        console.log(data);
      } catch (reason) {
        console.error(`The mix server extension appears to be missing.\n${reason}`);
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
    // GET request
    try {
      const reply = await requestAPI<any>('get_example', {
        body: JSON.stringify(dataToSend),
        method: 'POST',
      });
     this.setState({
       myval: JSON.stringify(data),
       page: PageType.ViewList
     });
     console.log(reply);
   } catch (reason) {
     console.error(`The mix server extension appears to be missing.\n${reason}`);
   }
  }

  render() {
    const pageState = this.state.page;
    let _renderTest;
    switch(pageState){
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
          <Button variant="contained" color="primary" onClick={ () => this.OnSelectCSP() }>
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
        _renderTest = <div>{this.state.myval}</div>;
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