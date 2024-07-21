import Terminal from "./components/terminal";
import './App.css';
import { useCallback, useEffect, useState } from "react";
import FileTree from "./components/tree";
import socket from "./socket";
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

function App() {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState('');
  const [code, setCode] = useState('');
  const [fileContent, setFileContent] = useState();

  const isSaved = fileContent === code

  const getFileTree = async () => {
    const res = await fetch('http://localhost:9000/files');
    const result = await res.json();
    setFileTree(result.tree);
  };

  const getFilesContent = useCallback(async () => {
    if (!selectedFile) return
    else {
      const res = await fetch(`http://localhost:9000/files/content?path=${selectedFile}`);
      const result = await res.json();
      setFileContent(result.content);
    }
  },[selectedFile])

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, []);

  useEffect(()=>{
    if(selectedFile && fileContent){
      setCode(fileContent)
    }
  },[selectedFile,fileContent]);

  useEffect(()=>{
    setCode("")
  },[selectedFile]);

  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        console.log("emitted", code);
        socket.emit("file:change", {
          path: selectedFile,
          content: code,
        });
      }, 5000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved]);


  useEffect(() => {
    if (selectedFile) getFilesContent()
  }, [getFilesContent, selectedFile])

  return (
    <div className="ground">
      <div className="editor-con">
        <div className="files">
          <FileTree
            onSelect={(path) => {
              setSelectedFile(path);
              console.log(path);
            }}
            tree={fileTree}
          />
        </div>
        <div className="editor">
          <p>{selectedFile} {isSaved ? "Saved":"Unsaved"}</p>
          <AceEditor value={code} onChange={(e) => setCode(e)} />
        </div>
      </div>
      <div className="term-con">
        <Terminal />
      </div>
    </div>
  );
}

export default App;
