const http = require('http');
const express = require("express");
const { Server: SocketServer } = require("socket.io");
const fs = require("fs/promises");
const pty = require("node-pty");
const path = require("path");
const cors = require('cors');
const chokidar = require("chokidar");
// const { default: socket } = require('../client/src/socket');

const ptyProcess = pty.spawn("powershell.exe", [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd() + '/user',
    env: process.env
});

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new SocketServer({
    cors: "*"
});

io.attach(server);

chokidar.watch('./user').on("all", (event, path)=>{
    console.log(event, path)
    io.emit("file:refresh", path)
})



ptyProcess.onData(data => {
    io.emit("terminal:data", data);
});

io.on('connection', (socket) => {
    console.log("Socket connected ", socket.id);

    socket.on("file:change",async({path, content})=>{
        await fs.writeFile(`./user${path}`, content)
        console.log(`./user${path}`, "the path is");
    })

    socket.on("terminal:write", (data) => {
        ptyProcess.write(data);
    });
});



app.get("/files", async (req, res) => {
    try {
        const fileTree = await generateFileTree("./user");
        res.json({ tree: fileTree });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating file tree");
    }
});

app.get("/files/content", async (req,res)=>{
    const path = req.query.path;
    const content = await fs.readFile(`./user${path}`, "utf-8")
    return res.json({content})
})

server.listen(9000, () => {
    console.log("Docker server is running on port 9000");
});

async function generateFileTree(dir) {
    const tree = {};

    async function buildTree(curDir, curTree) {
        try {
            const files = await fs.readdir(curDir);
            for (const file of files) {
                const filePath = path.join(curDir, file);
                const stat = await fs.stat(filePath);

                if (stat.isDirectory()) {
                    curTree[file] = {};
                    await buildTree(filePath, curTree[file]);
                } else {
                    curTree[file] = null;
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${curDir}:`, error);
            throw error;
        }
    }

    await buildTree(dir, tree);
    return tree;
}
