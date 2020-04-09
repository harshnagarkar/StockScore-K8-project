var express = require("express");
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
    extended: true,
  })
);

var publicKEY = fs.readFileSync(
  path.join(__dirname, "../keys/public.key"),
  "utf8"
);

var stocksData = fs.readFileSync(
  path.join(__dirname, "../stocks/s&p500.csv"),
  "utf8"
);
var stocksData = stocksData.replace(/ /g, "");
var stocksData = stocksData.replace(/\'/g, "");
var stocksData = new Set(stocksData.split(","));

var i = "Social Stock INC"; // Issuer
var s = "some@gmail.com"; // Subject
var a = "localhost"; // Audience
var verifyOptionsJWT = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "3m",
  algorithm: ["RS256"],
};

var options = {
  root: path.join(__dirname, "../data"),
  dotfiles: "deny",
  headers: {
    "x-timestamp": Date.now(),
    "x-sent": true,
  },
};


process.env.TZ = 'America/Chicago' 



var readconnection = mysql.createConnection({
  host: "mariadb-1-mariadb-secondary.mariadb.svc.cluster.local",
  user: "Suser",
  password: "<mwxe2H/3f8Kyb$N",
  database: "stockUser",
  timezone: 'America/Chicago'
});

readconnection.connect(function (err) {
  if (err) {
    console.log("error when connecting to db:", err);
  }
});

var writeconnection = mysql.createConnection({
  host: "mariadb-1-mariadb.mariadb.svc.cluster.local",
  user: "Suser",
  password: "<mwxe2H/3f8Kyb$N",
  database: "stockUser",
  timezone: 'America/Chicago'
});

writeconnection.connect(function (err) {
  if (err) {
    console.log("error when connecting to db:", err);
  }
});

/* GET home page. */
router.get("/vote", function (req, res, next) {
  readconnection.query(
    `Select * from Stock_Collection`,
    function (err, result, fields) {
      if (err) {
        res.sendStatus(400);
      }
      console.log(result);
      res.json(result);
    }
  );
});

function showdatelimit(){
  let today = new Date();
  today.setDate(today.getDate()-1)
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd+"  06:00:00";
  return today;
}


router.get("/vote/:stock", function (req, res, next) {
  
  if (!stocksData.has(req.params.stock)) {
    res.sendStatus(501);
  }
  console.log(req.params);
  let token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      console.log(decoded)
      readconnection.query(
        `Select vote from Stock_Collection where User_email='${decoded.email}' and stock='${req.params.stock}' and (vote_datetime BETWEEN '${showdatelimit()}' AND NOW())`,
        function (err, result, fields) {
          if (err) {
            console.log(err)
            res.sendStatus(400);
          }
          console.log(result);
          res.json(result);
        }
      );
    }
  });
});

function stockpredictedtoday(email, stock, callback) {
  let today = new Date();
  today.setDate(today.getDate())
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd
  readconnection.query(
    `Select vote,vote_datetime from Stock_Collection where User_email='${email}' and stock='${stock}' and  vote_datetime between '${today} 06:00:00' and '${today} 19:00:00'`,
    function (err, result, fields) {
      if (err) {
        console.log(err)
        res.sendStatus(400);
      }
      console.log(result[0],"->",result[0].vote," ",result[0].length)
      if (result[0].vote) {
        callback(true, result[0].vote, null);
      } else {
        callback(null, null, true);
      }
    }
  );
}

function adjustedvotevalue(votepost, votedb) {
  if (votedb === votepost) {
    return 0;
  } else {
    return votepost;
  }
}

function getVote(vote) {
  if (vote === 1 || vote === -1) {
    return vote;
  }
  return null;
}

function checkVotedatetime(){
  let today = new Date();
  if(today.getDay() == 6 || today.getDay() == 0 || today.getHours()<6 || today.getHours()>19 ){
    return false
  }
  return True
}

router.post("/vote/:stock", function (req, res, next) {
  if(!checkVotedatetime){
    res.send(405)
  }
  if (!stocksData.has(req.params.stock)) {
    res.sendStatus(501);
  }
  req.body.vote;
  let token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      let value = getVote(req.body.vote);
      if (value===null) {
        res.send(400);
      }
      stockpredictedtoday(decoded.email,req.params.stock,function (voted, vote, notvoted) {
        if (voted) {
          console.log("updated---------------------------------------")
          let value = adjustedvotevalue(req.body.vote, vote);
          writeconnection.query(
            `Update Stock_Collection set vote=${value} where User_email='${decoded.email}' and stock='${req.params.stock}'`,
            function (err, result) {
              if (err) {
                res.sendStatus(500);
              }
              res.sendStatus(200);
            }
          );
        } else if (notvoted) {
          writeconnection.query(
            `INSERT INTO \`Stock_Collection\` (User_email,stock,vote,vote_datetime) VALUES ('${decoded.email}','${req.params.stock}',${value},NOW())  ON DUPLICATE KEY UPDATE vote='${value}', vote_datetime=NOW()`,
            function (err, result, fields) {
              if (err) {
                console.log(err)
                res.sendStatus(400);
              }
              // console.log(result);
              res.json(200);
            }
          );
        }
      });
    }
  });
});

module.exports = router;
