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
            console.log("nodes ", nodes);
            console.log("id ", id);
            if (nodes.id === id) {
                return nodes;
            } else if (Array.isArray(nodes.children)) {
                let result = null;
                nodes.children.forEach((node: any) => {
                    if (!!getNodeById(node, id)) {
                        result = getNodeById(node, id);
                    }
                });
                console.log("result", result);
                return result;
            }

            return null;
        }

        return getAllChild(getNodeById(node, id));
    }

    function getOnChange(checked: boolean, nodes: RenderTree) {
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
        console.log("checked array", array);
        console.log("convert path :: ", convertPath(props.viewList))
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

    const OnRefreshList = async () => {
        // GET request
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
            <Button style={{ float: "right" }} type="submit" color="primary">
                Export to this bucket
            </Button>
            <hr style={{ color: '#000000', backgroundColor: '#000000', height: .1, borderColor: '#000000', marginTop: '5em' }} />
            <Button style={{ float: "right", marginBottom: "2em", marginTop: "0.1em" }} variant="contained" type="submit" color="primary">
                Import Selected
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
