import React from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Select from '@material-ui/core/Select';
import { requestAPI } from '../handler';
import FormControl from '@material-ui/core/FormControl';
import CspDetails from './cspDetails';
import ViewImportList from './viewImportList';
import { CommandRegistry } from '@lumino/commands';
import Typography from "@material-ui/core/Typography";
interface IProps {
    stateHandler: any,
    commands: CommandRegistry
}
export default function StorageProvider(props: IProps) {

    React.useEffect(() => {
        validateCredentials();
        /*const timer = setTimeout(() => {
            let el = document.getElementById('jp-left-stack');
            let el2 = document.getElementById('jp-main-dock-panel');
            if (el && el2) {
                console.log("left stack width ::", el.style.width);
                console.log("main dock panel width ::", el.style.width);
                el.style.width = '430px';
                el2.style.left = '430px';
            }
        }, 500)
        return () => {
            clearTimeout(timer)
        }*/

    }, []);

    const [isValid, setIsValid] = React.useState(false)

    const [provider, setProvider] = React.useState('')

    const listValue: any[] = [];

    var username = '';
    var bucketname = '';

    function handleChange(event: any) {
        setProvider(event.target.value);
    };

    const validateCredentials = async () => {

        try {
            const data = await requestAPI<any>('config_api');
            if (data.isValid) {
                setIsValid(true);
                username = data.username;
                bucketname = data.bucketName;
                props.stateHandler({
                    myval: JSON.stringify(data),
                    page: 2,
                    userName: data.username,
                    bucketName: data.bucketName
                });
            } else {
                setIsValid(false);
            }
        } catch (reason) {
            console.error(`Unable to retrieve config details`);
        }
    }

    return (
        <div >
            {provider != "10" && <div style={{ marginBottom: "3em",marginLeft:"5em" }}>
                <Typography style={{ fontSize: "0.85rem", width: "315px" }} variant="h6" align="left">
                    Select a cloud service provider and enter your credentials to import or export your code,models and data with DevCloud
                </Typography>
            </div>}
            {provider === "10" && <div style={{ marginBottom: "3em",marginLeft:"5em" }}>
                <Typography style={{ fontSize: "0.85rem", width: "315px" }} variant="h6" align="left">
                    Make sure to use IAM user credentials with programmatic access and appropriate policies.<a style={{ color: "#106ba3" }} href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html#id_users_create_console" target="_blank">See Creating IAM Users (console)</a> for more information.
                </Typography>
            </div>}
            <div style={provider === "10" && isValid ? { display: 'none' } : {}}>

                <Grid item>
                    <FormControl variant="filled" style={{ margin: 1, minWidth: 120, width: "100%",marginLeft:"5em" }}>
                        <InputLabel id="test-select-label" style={{ margin: "-20px", marginLeft: "14px", minWidth: 120, width: "125%" }}>Service Provider</InputLabel>
                        <Select
                            native
                            value={provider}
                            onChange={handleChange}
                            labelId="test-select-label"
                            label={"Service Provider"}

                        >
                            <option value="" />
                            <option value={10}>Amazon Web Services S3</option>
                            <option value={20} disabled>Azure Blob Storage(Coming Soon)</option>
                            <option value={30} disabled>Google Cloud Storage(Coming Soon)</option>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    {provider === "10" && <CspDetails stateHandler={props.stateHandler} />}
                </Grid>
            </div>
            {provider === "10" && isValid && <ViewImportList stateHandler={props.stateHandler} viewList={listValue} userName={username} bucketName={bucketname} commands={props.commands} />}
        </div>

    );
}

