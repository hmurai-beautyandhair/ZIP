const Shopify = require("shopify-api-node");
const date = new Date();
const express = require('express')
const multer  = require('multer');
const options = { month: "short", day: "numeric" };
const date2 = date.toLocaleDateString("en-US", options);
const fs = require("fs");
const http = require("https");
const zipFolder = require("zip-a-folder");
var zipper = require("zip-local");
const path = require("path");
var net = require("net");
const app = express()

const port = 3000
app.use(`wigs.com/${date2}`, express.static(path.join(__dirname, `wigs.com/${date2}`)));


const shopify2 = new Shopify({
  shopName: "wigs-store",
  apiKey: "def0b879df143c2b3575391121b3272a",
  password: "fec6c84d5f2364000732aea5236ab11d",
  autoLimit: true,
  bucketSize: { calls: 5, interval: 1000, bucketSize: 35 },
});
const shopify1 = new Shopify({
  shopName: "wigscom",
  apiKey: "dc84bc74af0be2b7757756c4fea170f7",
  password: "046fd5d3c21a33d038aeebb050e3d500",
  autoLimit: true,
  bucketSize: { calls: 5, interval: 1000, bucketSize: 35 },
});

async function getShop() {
  let assets = await shopify1.theme.list({ role: "main" });
  let res = await shopify1.asset.list(assets[0].id);
  const length = res.length;
  let arr = [];
  let junk = [];
  console.log("original", res.length);
  var fs = await require("fs");
  var dir = `./wigs.com/${date2}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  var dir2 = `./wigs.com/${date2}/assets`;
  if (!fs.existsSync(dir2)) {
    fs.mkdirSync(dir2);
  }


   
Promise.all(res.map(async (asset) => {
      if (asset.public_url === null) {
        const res5 = await shopify1.asset.get(assets[0].id, {
          "asset[key]": asset.key,
        });
        arr.push({
          key: asset.key,
          src: res5,
        });
        console.log("arrrr", arr.length);
        var parts = asset.key.split("/");
        var answer = parts[parts.length - 1];
        var writeStream = await fs.createWriteStream(
          `wigs.com/${date2}/assets/${answer}`
        );
        writeStream.write(res5.value);
        writeStream.on('finish', () => {
            console.log('wrote all data to file');
        });
        writeStream.end();
      } else {
        let src2 = await asset.key.replace(".js", ".txt");
        junk.push({
          key: src2,
          src: asset.public_url,
        });
        console.log("junk", junk.length);
        var parts = src2.split("/");
        var answer = parts[parts.length - 1];

        const url = asset.public_url;
        const path = `wigs.com/${date2}/assets/${answer}`;

        const request = await http.get(url, function (response) {
          if (response.statusCode === 200) {
            var file = fs.createWriteStream(path);
            response.pipe(file);
          }
          request.setTimeout(600000, function () {
            request.abort();
          });
        });
      }
    })
  ).then((values) => {
    console.log(values);
    console.log("finish");
  
  });

 
}

async function zipFile(){
    class ZipAFolder {
        static main() {
          zipFolder.zipFolder(
            `wigs.com/${date2}/assets`,
            `wigs.com/${date2}/assets2.zip`,
            function (err) {
              if (err) {
                console.log("Something went wrong!", err);
              }
            }
          );
        }
      }
      const zip =   await ZipAFolder.main();
     console.log("zip", zip);
}
getShop().then(zipFile)

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, `wigs.com/${date2}`);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
// });
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype == 'assets2/zip' ) {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// }
// const upload = multer({ storage: storage, fileFilter: fileFilter });
// app.post('/upload', upload.single('file'), (req, res, next) => {
//     try {
//         return res.status(201).json({
//             message: 'File uploded successfully'
//         });
//     } catch (error) {
//         console.error(error);
//     }
// });
app.get('/', (req, res) => {
    res.status(200).send('Running');
});



app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));