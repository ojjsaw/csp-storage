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
                        <InputLabel shrink htmlFor="age-native-label-placeholder">Access Key</InputLabel>
                        <TextField required name="ACCESS_KEY_ID" id="ACCESS_KEY_ID" label="" variant="outlined" />
                    </Grid>

                    <Grid item>
                        <InputLabel shrink htmlFor="age-native-label-placeholder">Secret Access Key</InputLabel>
                        <TextField required name="SECRET_ACCESS_KEY" id="SECRET_ACCESS_KEY" label="" variant="outlined" type="password" />
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
        // POST request
        try {
            const reply = await requestAPI<any>('init_s3_api', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            this.props.stateHandler({
                myval: JSON.stringify(reply),
                page: 2
            });
            console.log(reply);
        } catch (reason) {
            console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
        }
    }


}

export default CspDetails;
