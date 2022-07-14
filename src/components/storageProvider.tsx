import React from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Select from '@material-ui/core/Select';
import { requestAPI } from '../handler';
import FormControl from '@material-ui/core/FormControl';
import CspDetails from './cspDetails';
import ViewImportList from './viewImportList';
import Tooltip from "@material-ui/core/Tooltip";
import InfoIcon from '@material-ui/icons/Info';
import { CommandRegistry } from '@lumino/commands';
interface IProps {
    stateHandler: any,
    commands: CommandRegistry
}
export default function StorageProvider(props: IProps) {

    React.useEffect(() => {
        validateCredentials();
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
            console.log("data value", data);
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
            <div style={provider === "10" && isValid ? { display: 'none' } : {}}>

                <Grid item>
                    <FormControl variant="filled" style={{ margin: 1, minWidth: 120, width: "125%" }}>
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
                            <option value={20} disabled>Azure Blob Storage</option>
                            <option value={30} disabled>Google Cloud Storage</option>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    {provider === "10" && <CspDetails stateHandler={props.stateHandler} />}
                </Grid>
                {provider === "10" && <Grid item style={{ marginTop: "1em" }} >
                    <Tooltip title="Make sure to use IAM user credentials with programmatic access and appropriate policies.See Creating IAM Users (console) for more information." placement="top">
                        <InfoIcon />
                    </Tooltip>
                </Grid>}
            </div>
            {provider === "10" && isValid && <ViewImportList stateHandler={props.stateHandler} viewList={listValue} userName={username} bucketName={bucketname} commands={props.commands} />}
        </div>

    );
}

