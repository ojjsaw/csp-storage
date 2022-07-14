import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Button from '@material-ui/core/Button';
import { requestAPI } from '../handler';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

interface IProps {
    stateHandler: any
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
    errorMsg: string;

}
class CspDetails extends Component<IProps, IDataProps> {


    constructor(props: IProps) {
        super(props);
        this.state = {
            myval: 'hello',
            showlist: false,
            page: 0,
            listArray: [],
            errorMsg: ''
        };

    }

    render() {
        return (
            <div>
                <form noValidate autoComplete="off" onSubmit={this.OnCSPDetails}>
                    <Grid item>
                        <InputLabel style={{ marginBottom: "1em", marginTop: "1em" }} shrink htmlFor="age-native-label-placeholder">AWS S3 Bucket Name<span style={{ color: "red" }}>*</span></InputLabel>
                        <TextField required name="BUCKET_NAME" id="BUCKET_NAME" label="" variant="outlined" style={{ width: "110%" }} />
                    </Grid>
                    <Grid item>
                        <InputLabel style={{ marginTop: "1em", marginBottom: "1em" }} shrink htmlFor="age-native-label-placeholder">AWS Access Key<span style={{ color: "red" }}>*</span></InputLabel>
                        <TextField required name="ACCESS_KEY_ID" id="ACCESS_KEY_ID" label="" variant="outlined" style={{ width: "110%" }} />
                    </Grid>

                    <Grid item>
                        <InputLabel style={{ marginTop: "1em", marginBottom: "1em" }} shrink htmlFor="age-native-label-placeholder">AWS Secret Key<span style={{ color: "red" }}>*</span></InputLabel>
                        <TextField required name="SECRET_ACCESS_KEY" id="SECRET_ACCESS_KEY" label="" variant="outlined" type="password" style={{ width: "110%" }} />
                    </Grid>

                    <Grid item>
                        <Button style={{ marginTop: "1em", marginBottom: "1em" }} variant="contained" type="submit" color="primary">
                            Connect
                        </Button>
                    </Grid>
                    <div style={{ marginTop: "1em" }}>
                        <Typography style={{ fontSize: "0.85rem", fontWeight: "bold", color: "red" }} variant="h6" align="left">
                            {this.state.errorMsg}
                        </Typography>
                    </div>
                </form>
            </div>
        );
    }

    OnCSPDetails: React.FormEventHandler<HTMLFormElement> = async (event) => {

        event.preventDefault();
        const data = new FormData(event.currentTarget);        
        const dataToSend = {
            ACCESS_KEY_ID: data.get('ACCESS_KEY_ID'),
            SECRET_ACCESS_KEY: data.get('SECRET_ACCESS_KEY'),
            BUCKET_NAME: data.get('BUCKET_NAME'),
        };

        // POST request fpr saving config details
        try {
            const configResponse = await requestAPI<any>('config_api', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });           
            if (configResponse.isValid) {
                this.props.stateHandler({
                    myval: JSON.stringify(configResponse),
                    page: 2,
                    userName: configResponse.username,
                    bucketName: configResponse.bucketName
                });
            } else {
                let val = {
                    myval: 'hello',
                    showlist: false,
                    page: 0,
                    listArray: [],
                    errorMsg: 'Please enter valid AWS S3 Credentials'
                };
                this.setState(val);
            }
        } catch (reason) {
            console.error(`config details cannot be saved \n${reason}`);
        }

    }


}
export default CspDetails;
