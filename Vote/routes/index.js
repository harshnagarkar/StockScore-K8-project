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

var readconnection = mysql.createConnection({
  host: "mariadb-1-mariadb-secondary.mariadb.svc.cluster.local",
  user: "Suser",
  password: "<mwxe2H/3f8Kyb$N",
  database: "stockUser",
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

router.get("/vote/:stock", function (req, res, next) {
  if (!stocksData.has(req.params.stock)) {
    res.sendStatus(501);
  }
  console.log(req.params);
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      readconnection.query(
        `Select vote from Stock_Collection where User_email='${decoded.email}' and stock='${request.params.stock}'`,
        function (err, result, fields) {
          if (err) {
            res.sendStatus(400);
          }
          console.log(result);
          res.json(result);
        }
      );
    }
  });
});

function stockpredictedtoday(today, email, stock, callback) {
  readconnection.query(
    `Select vote,vote_datetime from Stock_Collection where User_email='${email}' and stock='${stock} and where game_date between '${startdate} 08:30:00' and '2012-05-11 19:00:00' '`,
    function (err, result, fields) {
      if (err) {
        res.sendStatus(400);
      }
      if (result.length !== 0) {
        callback(True, result.vote, null);
      } else {
        callback(null, null, True);
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

router.post("/vote/:stock", function (req, res, next) {
  console.log(req.body);
  if (!stocksData.has(req.params.stock)) {
    res.sendStatus(501);
  }
  req.body.vote;
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      stockpredictedtoday(function (voted, vote, notvoted) {
        if (voted) {
          let value = adjustedvotevalue(request.body.vote, vote);
          writeconnection.query(
            `Update Stock_Collection set vote=${value}`,
            function (err, result) {
              if (err) {
                return res.sendStatus(500);
              }
              return res.statusCode(200);
            }
          );
        } else if (notvoted) {
          let value = getVote(request.body.vote);
          if (!value) {
            res.send(400);
          }
          writeconnection.query(
            `INSERT INTO \`Stock_Collection\` (User_email,stock,vote,vote_datetime) VALUES ('${email}','${request.params.stock},${value},NOW()')`,
            function (err, result, fields) {
              if (err) {
                res.sendStatus(400);
              }
              console.log(result);
              res.json(result);
            }
          );
        }
      });
    }
  });
});

module.exports = router;
