//provides authentication for the whole web app
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
var mysql = require('mysql');
const util = require('util')
const bcrypt = require('bcrypt');

app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))

//----------------------------------------------------------mysql connection
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
  password: '<mwxe2H/3f8Kyb$N',
  database: "stockUser",
})

readconnection.connect(function (err) {
  if (err) {
    console.log('error when connecting to db:', err);
  }
})

//-----------------------------------------------------------------------jwt initialization global parameters
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


//--------------------------------------------------------------auth function

/* GET home page. */
router.get('/auth', function (req, res, next) {
  readconnection.query("Select * from User", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.send(result)
  });
});

/*Login Method */
function authenticate(email, password) {
  let query = readconnection.query(`Select password from User where email='${email}'`)
  query.on('error', function (err) {
    console.log("This is error \n", err)
    return false;
  });
  // console.log(result);
  query.on("result", function (result) {
    console.log("the query result is", result);
    if (bcrypt.compareSync(password, result.password)) {
      console.log("logged in db");
      return true;
    } else {
      console.log("unlogged in db");
      return false;
    }
  });

};

/* Create and add Refresh Token to DB */
function createRefreshToken(email, callback) {
  let refreshToken = randtoken.uid(256);
  writeconnection.query(`INSERT INTO \`Auth_token\` (User_email,refresh_token,expiry) VALUES ('${email}','${refreshToken}',NOW() + INTERVAL 24 HOUR)  ON DUPLICATE KEY UPDATE refresh_token='${refreshToken}', expiry=NOW() + INTERVAL 24 HOUR`, function (err, result, fields) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};


function createAccount(email, password,name,callback) {
  let hash = bcrypt.hashSync(password, 10);
  writeconnection.query(`INSERT INTO \`User\` (email,password,name) VALUES ('${email}','${hash}','${name}')`, function (err, result, fields) {
    if (err) {
      callback(err, null);
    };
    callback(null, result);
  });
};

router.post('/auth/createAccount', function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;
  let name = req.body.name;
  createAccount(email, password,name,function(err,result){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }else{
      res.sendStatus(200);
    }
  });
});

/* Login post route  */
router.post('/auth/login', function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;
  // let db_user = authenticate(email, password);
  // console.log("The db user: ", authenticate(email, password));
  let query = readconnection.query(`Select password from User where email='${email}'`)

  query.on('error', function (err) {
    res.sendStatus(403);
  });

  query.on('result', function (result) {
    if (bcrypt.compareSync(password, result.password)) {
      createRefreshToken(email, function (err, data) {
        if (err) {
          res.sendStatus(500);
        } else {
          let user = {
            email: email,
            role: 'user'
          }
          let refresh = {
            email: email,
            refreshToken: data
          }
          let jwtToken = jwt.sign(user, privateKEY, signOptionsJWT);
          let refreshToken = jwt.sign(refresh, privateKEY, signOptionsRT)

          // refreshTokens[refreshToken] = username 
          res.cookie('refreshToken', refreshToken, {
            maxAge: 86400000,
            httpOnly: true
          });
          res.cookie('token', jwtToken, {
            maxAge: 180000,
            httpOnly: false
          });
          res.sendStatus(200);
        }
      });
    } else {
      res.sendStatus(401)
    }
  });
})

/* Delete Refresh Token from DB */
function revokeToken(email,callback) {
  writeconnection.query(`DELETE FROM \`Auth_token\` WHERE User_email = '${email}'`, function (err, result, fields) {
    if (err) {
      callback(err,null);
    };
    callback(null,result);
  });
}

/* Logout post route */
router.get('/auth/logout', function (req, res, next) {
  let token = req.cookies.token;
  let refreshToken = req.cookies.refreshToken;
  jwt.verify(refreshToken, publicKEY, verifyOptionsRT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    }
    revokeToken(decoded.email,function(err,result){
      if(err){
        console.log("this is a error in delete revoke token",err);
        res.sendStatus(500);
      }else{
        console.log("Deleting the cookie from the browser");
        res.clearCookie('refreshToken')
        res.clearCookie('token')
        res.sendStatus(200);
      }
    });
  })
});

/* Checking Database for refresh Token */
function dbRefreshTokenCheck(email, refreshToken,callback) {
  readconnection.query(`select User_email,refresh_token from Auth_token where User_email='${email}' and refresh_token='${refreshToken}'`, function (err, result, fields) {
    if (err || result.length == 0) {
      callback(err,null);
    }else{
      callback(null,result)
    }
  });
}

/* Refresh the JWT using refresh Token */
router.get('/auth/refresh', function (req, res, next) {
  console.log("cookie" + req.cookies)
  let refresh = req.cookies.refreshToken
  if (!refresh) {
    res.send("No refresh token found")
  }

  jwt.verify(refresh, publicKEY, verifyOptionsRT, function (err, decoded) {
    if (err) {
      // console.log(err)
      res.sendStatus(401)
    }
    dbRefreshTokenCheck(decoded.email, decoded.refreshToken,function(err,result){
      if(err){
        res.sendStatus(401)
      }else{
        var user = {
          'email': decoded.email,
          'role': 'admin'
        };
        var jwtToken = jwt.sign(user, privateKEY, signOptionsRT);
        res.cookie('token', jwtToken, {
          maxAge: 180000,
          httpOnly: false
        });
        res.send('200');
      }
    });
  })


})

/* Test verify function */
router.get('/auth/verify', function (req, res, next) {
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



module.exports = router;