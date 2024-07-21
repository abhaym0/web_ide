const express = require("express");
const app = express();

app.get("/", (req,res)=>{
    res.send("hello from vs code cloud");
})

app.listen(1200, ()=>{ console.log("cloud server is running on 1200") });
