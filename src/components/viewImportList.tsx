import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { RenderTree, convertPath } from "./importFileData";
import Grid from '@material-ui/core/Grid/Grid';
import { requestAPI } from '../handler';
import { IconButton } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { MDBIcon } from 'mdbreact'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from "@material-ui/core/Typography";

interface IProps {
    stateHandler: any,
    viewList: any
}
const useStyles = makeStyles((theme) => ({
    checkboxstyles: {
        "& .MuiSvgIcon-root": { fontSize: "0.85em", marginLeft: "0.25em" }
    },
    divStyles: {
        width: "80%"
    }
}));
export default function ViewImportList(props: IProps) {

    const classes = useStyles();

    const [selected, setSelected] = React.useState<string[]>([]);

    const filesPath: any[] = [];

    const initialPriBtnTxt = 'IMPORT SELECTED';

    const [priButtonText, setPriButtonText] = React.useState(initialPriBtnTxt);

    const initialSecBtnTxt = 'EXPORT TO THIS BUCKET';

    const [secButtonText, setSecButtonText] = React.useState(initialSecBtnTxt);

    const selectionValue = 'EXPORT';

    const [selectionValueText, setSelectionValueText] = React.useState(selectionValue);

    const intialSelectedFiles: any[] = [];

    const [selectedFiles, setSelectedFiles] = React.useState(intialSelectedFiles);

    React.useEffect(() => {
        importList();
    }, []);


    function getChildById(node: RenderTree, id: string) {
        let array: string[] = [];

        function getAllChild(nodes: RenderTree | null) {
            if (nodes === null) return [];
            array.push(nodes.id);
            if (Array.isArray(nodes.children)) {
                nodes.children.forEach((node) => {
                    array = [...array, ...getAllChild(node)];
                    array = array.filter((v, i) => array.indexOf(v) === i);
                });
            }
            return array;
        }

        function getNodeById(nodes: any, id: string) {
            if (nodes.id === id) {
                return nodes;
            } else if (Array.isArray(nodes.children)) {
                let result = null;
                nodes.children.forEach((node: any) => {
                    if (!!getNodeById(node, id)) {
                        result = getNodeById(node, id);
                    }
                });
                return result;
            }

            return null;
        }

        return getAllChild(getNodeById(node, id));
    }

    function getOnChange(checked: boolean, nodes: RenderTree) {
        var filesSelected = selectedFiles;
        if (nodes) {
            filesPath.push(nodes);
        }
        const allNode: string[] = getChildById(
            {
                id: "0",
                name: "Parent",
                children: convertPath(props.viewList)
            },
            nodes.id
        );
        let array = checked
            ? [...selected, ...allNode]
            : selected.filter((value) => !allNode.includes(value));

        array = array.filter((v, i) => array.indexOf(v) === i);
        var pathList = props.viewList;
        console.log("file paths :: ", filesPath);
        for (var i = 0; i < filesPath.length; i++) {
            let index = 0;
            pathList.filter((element: any) => {

                if (element.includes(filesPath[i].name)) {
                    console.log("index value :: ", index);
                    filesSelected.push(index);
                } index = index + 1;
            });
            //filesSelected.push(result);                       
        }
        setSelectedFiles(filesSelected);
        setSelected(array);
    }

    const renderTree = (nodes: any) => (
        <TreeItem
            nodeId={nodes.id}
            label={
                <FormControlLabel
                    control={
                        <Checkbox
                            className={classes.checkboxstyles}
                            color="primary"
                            checked={selected.some((item) => item === nodes.id)}
                            onChange={(event) =>
                                getOnChange(event.currentTarget.checked, nodes)
                            }
                            onClick={(e) => e.stopPropagation()}
                        />
                    }
                    label={<>{nodes.name}</>}
                    key={nodes.id}
                />
            }
        >
            {Array.isArray(nodes.children)
                ? nodes.children.map((node: any) => renderTree(node))
                : null}
        </TreeItem>
    );

    const importList = async () => {
        try {
            const data = await requestAPI<any>('list_api');
            props.stateHandler({
                page: 2,
                listArray: data
            });
            console.log("list data ::", data);
        } catch (reason) {
            console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
        }
    }

    const OnRefreshList = async () => {
        if (priButtonText == 'IMPORT SELECTED') {
            (async () => {
                await importList();
            })();
        } else {
            (async () => {
                await exportList();
            })();
        }

    }

    const exportList = async () => {
        // GET request
        try {
            const data = await requestAPI<any>('export_list_api');
            props.stateHandler({
                page: 2,
                listArray: data
            });
            console.log("export list data ::", data);
        } catch (reason) {
            console.error(`The csp_storage server extension appears to be missing.\n${reason}`);
        }
    }

    function buttonSelected(btnName: any) {
        if (btnName == 'EXPORT') {
            (async () => {
                await exportList();
            })();
            setPriButtonText('EXPORT SELECTED');
            setSecButtonText('IMPORT TO DEV CLOUD');
            setSelectionValueText('IMPORT');
        } else {
            setPriButtonText('IMPORT SELECTED');
            setSecButtonText('EXPORT TO THIS BUCKET');
            setSelectionValueText('EXPORT');
        }

    }

    const importData = async () => {
        console.log("filtered result in import data :: ", selectedFiles);
        const dataToSend = { index: selectedFiles, my_type: "download" };
        // POST request
        try {
            const reply = await requestAPI<any>('list_api', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            console.log(reply);
        } catch (reason) {
            console.error(`Error in import data .\n${reason}`);
        }
    }

    return (

        <div className={classes.divStyles}>
            <Typography style={{ fontSize: "1rem", fontWeight: "bold" }} variant="h6" align="left">
                Connected to: Amazon S3
            </Typography>
            <Typography style={{ fontSize: "1rem", fontWeight: "bold" }} variant="h6" align="left">
                Bucket Name : Mybucket
            </Typography>
            <Button style={{ float: "left" }} type="submit" color="primary">
                Disconnect
            </Button>
            <Button style={{ float: "right" }} type="submit" color="primary" onClick={() => buttonSelected(selectionValueText)}>
                {secButtonText}
            </Button>
            <hr style={{ color: '#000000', backgroundColor: '#000000', height: .1, borderColor: '#000000', marginTop: '5em' }} />
            <Button style={{ float: "right", marginBottom: "2em", marginTop: "0.1em" }} variant="contained" type="submit" color="primary" onClick={() => importData()}>
                {priButtonText}
            </Button>
            <Grid item>
                <IconButton style={{ fontSize: "2rem" }} name="refreshList" onClick={() => OnRefreshList()}>
                    <RefreshIcon color="primary" />
                </IconButton>
            </Grid>
            <TreeView
                defaultCollapseIcon={<MDBIcon far icon="folder-open" size="lg" />}
                defaultExpanded={["0", "3", "4"]}
                defaultExpandIcon={<MDBIcon icon="folder" size="lg" />}
            >
                {renderTree({
                    id: "0",
                    name: "home",
                    children: convertPath(props.viewList)
                })}
            </TreeView>
        </div>
    );


}
