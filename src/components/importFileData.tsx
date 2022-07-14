export interface RenderTree {
  id: string;
  name: string;
  children?: RenderTree[];
}


export var convertPath = function (pathList: any) {
  //console.log("Path list ::", pathList)
  let idvalue = 0;
  //const pathes = ["path1/subpath1/file1.doc", "path2/subpath2/file2.doc"],
  //getFolderListDetails();
  //console.log("path list data ::",data);
  if (pathList) {
    var result = pathList.reduce((r: any, path: any) => {
      var path = path.replace('/home/', '');
      path.split('/').reduce((children: any, name: string) => {
        //console.log("childeren", name);
        if (name != "") {
          let child = children.find((n: any) => n.name === name);
          if (!child) children.push(child = { name, id: String(++idvalue), children: [] });
          return child.children;
        }

      }, r);
      return r;
    }, []);
  }

  //console.log(result);
  return result;


};


