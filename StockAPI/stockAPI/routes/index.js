"use strict";
var express = require("express");
var Influx = require("influx");
var router = express.Router();
var http = require("http");
var os = require("os");
const fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const csv = require("csv-parser");
var app = express();
var mysql = require('mysql');

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

var stocksData = fs.readFileSync(
  path.join(__dirname, "../stocks/s&p500.csv"),
  "utf8"
);
var stocksData = stocksData.replace(/ /g, "");
var stocksData = stocksData.replace(/\'/g, "");
var stocksData = stocksData.split(",");

// var stocksData= fs.createReadStream('stocks/s&p500.csv')
// .pipe(csv())
// .on('data', (row) => {
//   console.log(row);
// })
// .on('end', () => {
//   console.log('CSV file successfully processed');
// });
console.log(stocksData);

// console.log(stocksData.indexOf(element => element.includes("E")))
const influx = new Influx.InfluxDB(
  `http://suser:mwxe2H3f8KybN@influxdb-1-influxdb-svc.influxdb.svc.cluster.local:8086/stocks`
);

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

function search(arr, val) {
  var query = [];
  for (i = 0; i < arr.length; i++) if (arr[i].includes(val)) query.push(arr[i]);
  return query;
}

/* GET home page. */
router.get("/stocks/home", function (req, res, next) {
  influx
    .query("SHOW MEASUREMENTS")
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((error) => {
      res.send(error);
    });
});

function sortInputFirst(input, data) {
  data.sort();
  const [first, others] = data.reduce(
    ([a, b], c) => (c.indexOf(input) == 0 ? [[...a, c], b] : [a, [...b, c]]),
    [[], []]
  );
  return first.concat(others);
}

router.get("/stocks/search", function (req, res, next) {
  console.log(req.query);
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      if (!req.query.term) {
        res.json({
          stocks: stocksData.slice(0, 10),
        });
      } else {
        var terms = search(stocksData, req.query.term.toUpperCase());
        const output = sortInputFirst(req.query.term.toUpperCase(), terms);
        console.log(output);
        res.json({
          stocks: output,
        });
      }
    }
  });
});

router.get("/stocks/data/:stock", function (req, res, next) {
  var token = req.cookies.token;
  console.log(req.params)
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      influx
        .query(`select * from "${req.params.stock}_data" order by time desc limit 1`)
        .then((result) => {
          console.log(result);
          res.send(result[0]);
        })
        .catch((error) => {
          res.send(error);
        });
    }
  });
});

router.get("/stocks/collection", function (req, res, next) {
  console.log("Sending collection")
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      console.log("Running the query")
      console.log(`Select * from Stock_Collection where User_email='${decoded.email}'`)
      readconnection.query(`Select * from Stock_Collection where User_email='${decoded.email}'`,function(err, result, fields){
        if (err) res.send(err);
        console.log(result);
        res.send(result)
      })
    }
  });
});

router.get("/stocks/deletecollectionstock/:stock", function (req, res, next) {
  console.log("Sending collection")
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
    } else {
      console.log("Running the query")
      console.log(`DELETE FROM Stock_Collection where User_email='${decoded.email}' and stock='${req.params.stock}'`)
      writeconnection.query(`DELETE FROM Stock_Collection where User_email='${decoded.email}' and stock='${req.params.stock}'`,function(err, result, fields){
        if (err) res.send(err);
        console.log(result);
        res.sendStatus(200)
      })
    }
  });
});

module.exports = router;
