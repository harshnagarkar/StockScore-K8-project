var express = require("express");
var router = express.Router();
const fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
var mysql = require("mysql");
const util = require("util");
const multer = require("multer");
var app = express();



app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);


//-----------------------------------------------------------------JWT

var publicKEY = fs.readFileSync(
  path.join(__dirname, "../keys/public.key"),
  "utf8"
);
var i = "Social Stock INC"; // Issuer
var s = "some@gmail.com"; // Subject
var a = "localhost"; // Audience
var verifyOptionsJWT = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "3m",
  algorithm: ["RS256"]
};

var options = {
  root: '/mnt/',
  dotfiles: "deny",
  headers: {
    "x-timestamp": Date.now(),
    "x-sent": true
  }
};

//----------------------------------------------fileupload-------------------------------------------------------------------------------
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "/mnt"); //here we specify the destination. in this case i specified the current directory
  },
  filename: function(req, file, cb) {
    console.log(file); //log the file object info in console
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);//here we specify the file saving name. in this case. 
//i specified the original file name .you can modify this name to anything you want
  }
});

var uploadDisk = multer({ 
  storage: storage,
  fileFilter: function (req, file, callback) {
    // var ext = path.extname(file.originalname);
    // if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    //     return callback(new Error('Only images are allowed'))
    // }
    callback(null, true)
    }
    // ,
    // limits:{
    //     fileSize: 1024 * 1024 * 5
    // }
});

//----------------------------------database---------------------------------------------------------------

var writeconnection = mysql.createConnection({
  host: "mariadb-1-mariadb.mariadb.svc.cluster.local",
  user: "Suser",
  password: '<mwxe2H/3f8Kyb$N',
  database: "stockUser",
})

writeconnection.connect(function (err) {
  if (err) {
    console.log('error when connecting to db:', err);
  }
})

var readconnection = mysql.createConnection({
  host: "mariadb-1-mariadb-secondary.mariadb.svc.cluster.local",
  user: "Suser",
  password: "<mwxe2H/3f8Kyb$N",
  database: "stockUser"
});

readconnection.connect(function(err) {
  if (err) {
    console.log("error when connecting to db:", err);
  }
});

//----------------------------------------------------------------------------------------------------------------------
function  authcheck(req,res,next){
  var token = req.cookies.token;
  console.log("auth check")
  jwt.verify(token, publicKEY, verifyOptionsJWT, function(err, decoded) {
    if (err) {
      res.sendStatus(401)
    } else {
      next(decoded)
    }
  });
 };

/* GET home page. */
router.get("/user/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/user/data", function(req, res, next) {
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function(err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      readconnection.query(
        "Select accuracy,name,score,correct_predictions,total_predictions,profileimage from User where email='" + decoded.email + "'",
        function(err, result, fields) {
          if (err) res.sendStatus(500);
          console.log(decoded.email, " ", result);
          res.json(result[0])
        }
      );
    }
  });
});

router.post("/user/uploadimage",authcheck,uploadDisk.single("image"),function(req,res,next){
  console.log("in function")
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function(err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      console.log("upload image")
  writeconnection.query(
    "INSERT INTO \`User\` (profileimage) VALUES ("+req.filename+") where email='"+decoded.email+"'  ON DUPLICATE KEY UPDATE profileimage='" + req.filename + "'",
    function(err, result, fields) {
      if (err){
      console.log(err)
      res.sendStatus(500)
    };
      console.log(decoded.email, " ", result);
      console.log(req.filename)
      res.sendStatus(200)
    }
  );
    } 
})
})

router.get("/user/image/:name", function(req, res, next) {
  console.log(req.params);
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function(err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      res.sendFile(req.params.name, options, function(err) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          console.log("Sent:", fileName);
        }
      });
    }
  });
});

module.exports = router;
