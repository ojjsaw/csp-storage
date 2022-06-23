import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Button from '@material-ui/core/Button';
import { requestAPI } from '../handler';
import TextField from '@material-ui/core/TextField';

interface IProps {
    stateHandler: any
}

class CspDetails extends Component<IProps> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            myval: 'hello',
            showlist: false,
            page: 0,
            listArray: []
        };
    }

    render() {
        return (
            <div>
                <form noValidate autoComplete="off" onSubmit={this.OnCSPDetails}>
                    <Grid item>
                        <InputLabel style={{ marginBottom: "1em" }} shrink htmlFor="age-native-label-placeholder">AWS S3 Bucket Name</InputLabel>
                        <TextField required name="BUCKET_NAME" id="BUCKET_NAME" label="" variant="outlined" />
                    </Grid>
                    <Grid item>
                        <InputLabel style={{ marginTop: "1em" }} shrink htmlFor="age-native-label-placeholder">AWS Access Key</InputLabel>
                        <TextField required name="ACCESS_KEY_ID" id="ACCESS_KEY_ID" label="" variant="outlined" />
                    </Grid>

                    <Grid item>
                        <InputLabel style={{ marginTop: "1em" }} shrink htmlFor="age-native-label-placeholder">AWS Secret Access Key</InputLabel>
                        <TextField required name="SECRET_ACCESS_KEY" id="SECRET_ACCESS_KEY" label="" variant="outlined" type="password" />
                    </Grid>

                    <Grid item>
                        <Button style={{ marginTop: "1em" }} variant="contained" type="submit" color="primary">
                            Submit
                        </Button>
                    </Grid>
                </form>
            </div>
        );
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

        // POST request fpr saving config details
        try {
            const configResponse = await requestAPI<any>('config_api', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            console.log(configResponse);
            this.props.stateHandler({
                myval: JSON.stringify(configResponse),
                page: 2
            });
        } catch (reason) {
            console.error(`config details cannot be saved \n${reason}`);
        }

    }


}

export default CspDetails;
