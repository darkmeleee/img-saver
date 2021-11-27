const express = require("express");
const app = express();
const port = 5000;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const compress_images = require("compress-images");

const upload = multer({
    dest: "/temp"
  });

function reducesize(name) {
    compress_images(
      `${__dirname}/temp/${name}`,
      `${__dirname}/images/`,
      { compress_force: false, statistic: false, autoupdate: true },
      false,
      { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
      { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
      { svg: { engine: "svgo", command: "--multipass" } },
      {
        gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] },
      },
      function (err, completed) {
        if (completed === false) {
          console.log(err);
        }
      }
    );
  }

function sendfile(res, path) {
    res.sendFile(path);
}



app.get("/", (req, res) => {
    res.send(`<form method="post" enctype="multipart/form-data" action="/upload"> <input type="file" name="file"> <input type="submit" value="Submit"> </form>`);
})

app.post("/upload", upload.single("file"), (req,res) => {
    const tempPath = req.file.path;

    if (path.extname(req.file.originalname).toLowerCase() == ".png" || path.extname(req.file.originalname).toLowerCase() == ".jpg" || path.extname(req.file.originalname).toLowerCase() == ".jpeg") {
        fs.rename(tempPath, path.join(__dirname, "./temp/" + req.file.originalname), err => {
            if (err) return res.status(404);

            reducesize(req.file.originalname);
            setTimeout(sendfile, 450, res, `${__dirname}/images/${req.file.originalname}`);
          
                
        })
    }
    else {
        fs.unlink(tempPath, err => {
            if (err) return res.status(404);

            res
                .status(403)
                .contentType("text/plain")
                .end(".png only")
        })
    }
})

app.listen(port, () => {
    console.log(`listening on ${port}`)
  })
  
