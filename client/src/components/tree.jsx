const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
    const isDir = !!nodes;
    return (
        <div 
        style={{'marginLeft':"10px"}}
        onClick={(e)=>{
            e.stopPropagation()
            if(isDir) return
            onSelect(path)
        }}
        >
            <p className={isDir ? "":"file-node"}>{fileName}</p>
            {nodes && fileName !== "node_modules" && <ul>
                {Object.keys(nodes).map((child) => {
                    return (
                        <li key={child}>
                            <FileTreeNode onSelect={onSelect} path={path + '/' + child} fileName={child} nodes={nodes[child]} />
                        </li>
                    )
                })}
            </ul>}
        </div>
    )
}

const FileTree = ({ tree, onSelect }) => {
    return (
        <div>
            <FileTreeNode

                onSelect={onSelect}
                fileName='/'
                nodes={tree}
                path=''
            />
        </div>
    )
}

export default FileTree