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
import CircularProgress from '@material-ui/core/CircularProgress';
import { CommandRegistry } from '@lumino/commands';

interface IProps {
    stateHandler: any,
    viewList: any,
    userName: string,
    bucketName: string,
    commands: CommandRegistry

}
const useStyles = makeStyles((theme) => ({
    checkboxstyles: {
        "& .MuiSvgIcon-root": { fontSize: "0.7em", marginLeft: "0.25em" }
    },
    divStyles: {
        width: "80%"
    },
    parentDisable: {
        display: "none"
    },
    overlayBox: {
        position: "absolute",
        top: "30%",
        left: "40%",
        transform: "translate(-50%, -50%)",
        color: "blue",
        opacity: .8,
        zIndex: 1000
    },
    importTextStyles: {
        position: "absolute",
        top: "50%",
        left: "15%",
        fontSize: "0.8rem",
        fontWeight: "bold"
    },
    viewBtnStyles: {
        position: "absolute",
        top: "56%",
        left: "15%",
        fontSize: "0.7rem",
        fontWeight: "bold"
    },
    continueBtnStyles: {
        position: "absolute",
        top: "56%",
        left: "40%",
        fontSize: "0.7rem",
        fontWeight: "bold"
    },
    treeStyles:{
        "& .MuiTypography-body1": {
            fontSize: "0.85rem"
            
        },
        "& .fa-lg":{
            fontSize:"1.1em"
        }
    }
}));
export default function ViewImportList(props: IProps) {

    const classes = useStyles();

    const [selected, setSelected] = React.useState<string[]>([]);

    const filesPath: any[] = [];

    const initialPriBtnTxt = 'IMPORT FROM S3 BUCKET';

    const [priButtonText, setPriButtonText] = React.useState(initialPriBtnTxt);

    const initialSecBtnTxt = 'EXPORT TO THIS BUCKET';

    const [secButtonText, setSecButtonText] = React.useState(initialSecBtnTxt);

    const selectionValue = 'EXPORT';

    const [selectionValueText, setSelectionValueText] = React.useState(selectionValue);

    const intialSelectedFiles: any[] = [];

    const [selectedFiles, setSelectedFiles] = React.useState(intialSelectedFiles);

    const [isLoading, setIsLoading] = React.useState(false)

    const [msgTxt, setMsgTxt] = React.useState('')

    const [listLoading, setListLoading] = React.useState(false)

    const [isImport, setIsImport] = React.useState(true);

    const intialExportedFiles: any[] = [];

    const [exportedFiles, setExportedFiles] = React.useState(intialExportedFiles);

    const [hideTreeView, setHideTreeView] = React.useState(false);



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
        //console.log("nodes ", nodes);
        var filesSelected = selectedFiles;
        var exFiles: any[] = [];
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
        for (var i = 0; i < filesPath.length; i++) {
            let index = 0;
            pathList.filter((element: any) => {

                if (element.includes(filesPath[i].name)) {
                    //console.log("index value ", index);
                    let existingindex = filesSelected.indexOf(index);
                    if (existingindex > -1) {
                        filesSelected = filesSelected.filter(function (item) {
                            return item !== index
                        })
                    } else {
                        var lastItem = pathList[index].split("/").pop();
                        if (lastItem != "") {
                            filesSelected.push(index);
                        }
                    }

                } index = index + 1;
            });
            //filesSelected.push(result);                       
        }

        setSelectedFiles([]);

        setSelectedFiles(filesSelected);


        setSelected(array);

        if (priButtonText == 'EXPORT TO S3 BUCKET') {
            filesSelected.map(function (val) {
                return exFiles.push(pathList[val]);
            });

            setExportedFiles(exFiles);
            console.log("selected export ", exFiles)
            console.log("Export list ::", exportedFiles)
        }


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
        console.log("state values", props)
        setListLoading(true);
        props.stateHandler({
            page: 2,
            listArray: []
        });
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
        setListLoading(false);
    }

    const OnRefreshList = async () => {
        if (priButtonText == 'IMPORT FROM S3 BUCKET') {
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
        setListLoading(true);
        props.stateHandler({
            page: 2,
            listArray: []
        });
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
        setListLoading(false);
    }

    function buttonSelected(btnName: any) {
        setSelected([]);
        setSelectedFiles([]);
        if (btnName == 'EXPORT') {
            (async () => {
                await exportList();
            })();
            setPriButtonText('EXPORT TO S3 BUCKET');
            setSecButtonText('IMPORT TO DEV CLOUD');
            setSelectionValueText('IMPORT');
            setIsImport(false);
        } else {
            (async () => {
                await importList();
            })();
            setPriButtonText('IMPORT FROM S3 BUCKET');
            setSecButtonText('EXPORT TO THIS BUCKET');
            setSelectionValueText('EXPORT');
            setIsImport(true);
        }

    }

    function priBtnSelected() {
        setIsLoading(true);
        if (priButtonText == 'IMPORT FROM S3 BUCKET') {
            (async () => {
                await importData();
            })();

        } else {
            (async () => {
                await exportData();
            })();
        }

    }



    const importData = async () => {
        setMsgTxt('');
        //setIsLoading(true);
        setHideTreeView(true);
        console.log("files selected for import :: ", selectedFiles);
        var msg: string = '';
        var count = 1;
        try {
            await Promise.all(selectedFiles.map(async (file) => {
                const dataToSend = { index: file, my_type: "download" };
                const reply = await requestAPI<any>('list_api', {
                    body: JSON.stringify(dataToSend),
                    method: 'POST',
                });
                msg = count + ' files have been successfull imported to';
                setMsgTxt(msg);
                count = count + 1;
                console.log(reply);
            }));
        } catch (reason) {
            setIsLoading(false);
            console.error(`Unable to import  file \n${reason}`);
        }
    }

    React.useEffect(() => {
        let finalMsg;
        if (priButtonText == 'IMPORT FROM S3 BUCKET') {

            finalMsg = selectedFiles.length + ' files have been successfull imported to';
        } else {
            finalMsg = exportedFiles.length + ' files have been successfull exported to';
        }
        if (msgTxt == finalMsg) {
            setIsLoading(false);
            //setMsgTxt('');
        }
        console.log("import msg", msgTxt);
    }, [msgTxt]);

    const exportData = async () => {
        setMsgTxt('');
        //setIsLoading(true);
        setHideTreeView(true);
        console.log("files selected for export is :: ", exportedFiles);
        var msg: string = '';
        var count = 1;
        try {
            await Promise.all(exportedFiles.map(async (file) => {
                const dataToSend = { UPLOAD_FILE_PATH: file, my_type: "upload" };
                const reply = await requestAPI<any>('list_api', {
                    body: JSON.stringify(dataToSend),
                    method: 'POST',
                });
                msg = count + ' files have been successfull exported to';
                setMsgTxt(msg);
                count = count + 1;
                console.log(reply);
            }));
        } catch (reason) {
            setIsLoading(false);
            console.error(`Unable to export file \n${reason}`);
        }
    }

    const viewFunction = function () {
        if (priButtonText == 'IMPORT FROM S3 BUCKET') {
            console.log("list of commands in view function", props.commands);
            props.commands.execute('filebrowser:go-to-path', { 'path': '/cloud-imports/s3/'+props.bucketName }).catch((reason) => {
                console.error(
                    `An error occurred during the execution of filebrowser:go-to-path command.\n${reason}`
                );
            });
        } else {
            setHideTreeView(false);
            (async () => {
                await importList();
            })();
        }
    }

    const disconnectProvider = async () => {
        try {
            await requestAPI<any>('disconnect');
            props.stateHandler({
                page: 0
            });
        } catch (reason) {
            console.error(`Unable to disconnect provider \n${reason}`);
        }
    }



    return (

        <div className={classes.divStyles}>
            {listLoading && <CircularProgress className={classes.overlayBox} color="primary" />}
            {isLoading && <CircularProgress className={classes.overlayBox} color="primary" />}
            {hideTreeView && <Typography className={classes.importTextStyles}>{msgTxt}</Typography>}
            {hideTreeView && <Button className={classes.viewBtnStyles} variant="contained" type="submit" color="primary" onClick={() => viewFunction()}>
                View
            </Button>}
            {hideTreeView && <Button className={classes.continueBtnStyles} variant="contained" type="submit" color="primary" onClick={() => setHideTreeView(false)}>
                Continue
            </Button>}
            {isImport && <Typography style={{ fontSize: "0.85rem", fontWeight: "bold" }} variant="h6" align="left">
                Connected to: Amazon S3
            </Typography>}
            {!isImport && <Typography style={{ fontSize: "0.85rem", fontWeight: "bold" }} variant="h6" align="left">
                Connected to: DevCloud
            </Typography>}
            {isImport && <Typography style={{ fontSize: "0.85rem", fontWeight: "bold" }} variant="h6" align="left">
                Bucket Name : {props.bucketName}
            </Typography>}
            <Button style={{ float: "left",fontSize:"0.7rem" }} type="submit" color="primary" onClick={() => disconnectProvider()}>
                Disconnect
            </Button>
            <Button style={hideTreeView ? { display: 'none' } : { float: "right",fontSize:"0.7rem" }} type="submit" color="primary" onClick={() => buttonSelected(selectionValueText)}>
                {secButtonText}
            </Button>
            <hr style={{ color: '#000000', backgroundColor: '#000000', height: .1, borderColor: '#000000', marginTop: '5em' }} />
            <Button style={{ float: "right", marginBottom: "2em", marginTop: "0.1em",fontSize:"0.7rem",width:"184px" }} variant="contained" type="submit" color="primary" onClick={() => priBtnSelected()}>
                {priButtonText}
            </Button>
            <Grid item>
                <IconButton style={{ fontSize: "2rem" }} name="refreshList" onClick={() => OnRefreshList()}>
                    <RefreshIcon color="primary" />
                </IconButton>
            </Grid>
            <TreeView className={classes.treeStyles} style={hideTreeView ? { display: 'none' } : {}}
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
