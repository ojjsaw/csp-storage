import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';
import NativeSelect from '@material-ui/core/NativeSelect/NativeSelect';
import Button from '@material-ui/core/Button';
import { requestAPI } from '../handler';

interface IProps {
    stateHandler: any
}

class StorageProvider extends Component<IProps> {

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
                <Grid item>
                    <InputLabel shrink htmlFor="age-native-label-placeholder">Cloud Storage Provider</InputLabel>
                    <NativeSelect>
                        <option value={10}>Amazon Web Services S3</option>
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
            </div>
        );
    }

    OnSelectCSP = async () => {
        // GET request
        try {
            const data = await requestAPI<any>('init_s3_api');

            console.log(data);
        } catch (reason) {
            console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
        }
        try {
            const data = await requestAPI<any>('config_api');
            console.log(data);
            if (data.containsConfig) {
                this.props.stateHandler({
                    myval: JSON.stringify(data),
                    page: 2
                });
            } else {
                this.props.stateHandler({
                    myval: JSON.stringify(data),
                    page: 1
                });
            }
        } catch (reason) {
            console.error(`Unable to retrieve config details`);
        }
    }
}

export default StorageProvider;
