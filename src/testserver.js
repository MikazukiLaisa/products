const express = require("express");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser")
const jsonpath = "./seikabutsu.json"
let json = require(jsonpath)
const multer = require("multer")
var upload = multer({dest:"./uploads/"})

const PORT = process.env.PORT || 3020



app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Max-Age', '86400');
    res.header("Content-Security-Policy: default-src 'self' font-src '*'");
    next();
  });
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.post("/data", upload.fields([ { name: 'myFile' } ]), (req,res)=>{
        console.log("post")
        console.log(req.body.name)
        const myFile = req.files.myFile[0];
        const tmp_path = myFile.path;
        const target_path = './seikabutsu_files/' + myFile.originalname;
        console.log("tmp_path" + tmp_path + "  target_path" + target_path)

        //④
        fs.rename(tmp_path, target_path, (err) => {
          if (err) throw err;
          //⑤
          fs.unlink(tmp_path, () => {
            if (err) throw err;
            res.json({message: 'File uploaded to: ' + target_path + ' - ' + myFile.size + ' bytes'});
          });
        });
})

app.get("/data", (req,res)=>{
    res.json(json);
    console.log("get");
})

app.listen(PORT, () => {
    console.log('Example app listening on port '+PORT+' !');
   });
   