'use strict';
var express = require('express');
var router = express.Router();
var app = express();
const fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var randtoken = require('rand-token');
var cookieParser = require('cookie-parser')
const util = require('util')

app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))

// const PORT = 8080;
// const HOST = '0.0.0.0';

// console.log(__dirname)
/*Setting up fundamental variables */
var refreshTokens = {}
var privateKEY = fs.readFileSync(path.join(__dirname, '../keys/private.key'), 'utf8');
var publicKEY = fs.readFileSync(path.join(__dirname, '../keys/public.key'), 'utf8');
var i = 'Social Stock INC'; // Issuer 
var s = 'some@gmail.com'; // Subject 
var a = 'localhost'; // Audience

console.log(publicKEY)

var signOptionsJWT = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "3m",
  algorithm: "RS256"
};

var verifyOptionsJWT = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "3m",
  algorithm: ["RS256"]
};

var signOptionsRT = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "12hr",
  algorithm: "RS256"
};

var verifyOptionsRT = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "12hr",
  algorithm: ["RS256"]
};


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});


/*Login Method */
function authenticate(username, password) {
  return true;
}

/* Create and add Refresh Token to DB */
function createRefreshToken(username) {
  var refreshToken = randtoken.uid(256);
  //database query
  return refreshToken
}

/* Login post route  */
router.post('/login', function (req, res, next) {

  console.log(req.body)
  var username = req.body.username;
  var password = req.body.password;
  console.log(username);
  var db_user = authenticate(username, password);
  console.log(db_user);
  if (db_user) {
    var refreshtoken = createRefreshToken(username);

    var user = {
      username: username,
      role: 'admin'
    }
    var refresh = {
      username: username,
      refreshToken: refreshToken
    }
    var jwtToken = jwt.sign(user, privateKEY, signOptionsJWT);
    var refreshToken = jwt.sign(refresh, privateKEY, signOptionsRT)

    // refreshTokens[refreshToken] = username 
    res.cookie('refreshToken', refreshToken, {
      maxAge: 86400000,
      httpOnly: true
    });
    res.cookie('token', jwtToken, {
      maxAge: 180000,
      httpOnly: true
    });
    res.send("200");
  } else {
    res.send("Username,password is wrong");
  }
});

/* Delete Refresh Token from DB */
function revokeToken(username) {
  return;
}

/* Logout post route */
router.get('/logout', function (req, res, next) {
  var token = req.cookies.token;
  var refreshToken = req.cookies.refreshToken;
  revokeToken(username);
  jwt.destroy(refreshToken);
  jwt.destroy(token);
  res.json("done");
})

/* Checking Database for refresh Token */
function dbRefreshTokenCheck(username, refreshToken) {
  //will return user
  return true;
}

/* Refresh the JWT using refresh Token */
router.get('/refresh', function (req, res, next) {
  console.log("cookie"+req.cookies)
  var refresh = req.cookies.refreshToken
  if (!refresh) {
    res.send("No refresh token found")
  }

  jwt.verify(refresh, publicKEY, verifyOptionsRT, function (err, decoded) {
    if (err) {
      res.send("please login again")
    }
    var db_user = dbRefreshTokenCheck(decoded.username, decoded.refreshToken);
    if (db_user) {
      var user = {
        'username': decoded.username,
        'role': 'admin'
      };
      var jwtToken = jwt.sign(user, privateKEY, signOptionsRT);
      res.cookie('token', jwtToken, {
        maxAge: 180000,
        httpOnly: true
      });
      res.send('200');
    } else {
      res.send("token invalid")
    }
  })


})

/* Test verify function */
router.get('/verify', function (req, res, next) {
  var token = req.cookies.token;
  console.log(token)
  if (!token) {
    res.send("empty");
  }
  // var refreshToken = req.cookies.refreshToken;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      console.log("not authenticated");
      res.send("not logged in");
      return
    } else {
      console.log("authenticated" + decoded.username)
      res.send("logged in still!")
    }
  })
})
// if (!jwt){
//   // RT= jwt.verify(refreshToken,publicKEY,verifyOptionsRT)
//   // if(RT){

//   // }
// }
// else{
//   console.log("authenticated")
//   res.send("logged in still!")
// }

//   function (err, decoded) {
//   if (err) {
//     console.log("invalid")
//     res.send("nothing")
//   };
//   console.log(decoded); // bar
//   res.send("done");

// })


module.exports = router;