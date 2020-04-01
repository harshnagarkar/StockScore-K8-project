var express = require('express');
var router = express.Router();


const fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
var mysql = require("mysql");
const util = require("util");
var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

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
  root: path.join(__dirname, "../data"),
  dotfiles: "deny",
  headers: {
    "x-timestamp": Date.now(),
    "x-sent": true
  }
};

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


/* GET home page. */
router.get('/vote', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/vote/:stock/:choice", function(req, res, next) {
  console.log(req.params);
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function(err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
    
    }
  });
});


module.exports = router;
