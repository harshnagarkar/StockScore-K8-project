var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
const csv = require('csv-parser');
var mysql = require('mysql');
const util = require('util')
var app = express();


app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))

var publicKEY = fs.readFileSync(path.join(__dirname, '../keys/public.key'), 'utf8');
var i = 'Social Stock INC'; // Issuer 
var s = 'some@gmail.com'; // Subject 
var a = 'localhost'; // Audience
var verifyOptionsJWT = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "3m",
  algorithm: ["RS256"]
};

/* GET home page. */
router.get('/user/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/user/data', function (req, res, next) {
  console.log(req.query)
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
      return
    } else {
      if (!req.query.term) {
        res.json({
          "stocks": output
        })
      }
    }
  })
})

module.exports = router;
