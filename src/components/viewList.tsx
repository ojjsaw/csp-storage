import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/Folder';
import RefreshIcon from '@material-ui/icons/Refresh';
import { IconButton } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { requestAPI } from '../handler';

interface IProps {
    stateHandler: any,
    viewList: any
}

class ViewList extends Component<IProps> {

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
        const _viewlist = this.props.viewList;
        return (
            <div>
                <Grid item>
                    <IconButton name="refreshList" onClick={() => this.OnRefreshList()}>
                        <RefreshIcon color="primary" />
                    </IconButton>
                </Grid>
                <List component="nav" aria-label="main mailbox folders" style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {_viewlist.map((val: any, i: any) =>
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
                        <br />
                        <Grid item>
                            <Button variant="contained" type="submit" color="primary">
                                Upload File
                            </Button>
                        </Grid>
                    </form>
                </Grid>

            </div>
        );
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
            this.props.stateHandler({
                myval: JSON.stringify(reply),
                page: 2
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
            this.props.stateHandler({
                page: 2,
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
        console.log("index number", index);
        /*const dataToSend = { index: index, my_type: "download" };
        // POST request
        try {
            const reply = await requestAPI<any>('list_api', {
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
        }*/

    }

}

export default ViewList;
