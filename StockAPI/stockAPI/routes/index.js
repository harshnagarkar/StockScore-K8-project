'use strict';
var express = require('express');
var Influx = require('influx');
var router = express.Router();
var http = require('http')
var os = require('os')
const fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
const csv = require('csv-parser');
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

var stocksData = fs.readFileSync(path.join(__dirname, '../stocks/s&p500.csv'), 'utf8');
var stocksData = stocksData.replace(/ /g,"");
var stocksData = stocksData.replace(/\'/g,"");
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
const influx = new Influx.InfluxDB(`http://suser:mwxe2H3f8KybN@influxdb-1-influxdb-svc.influxdb.svc.cluster.local:8086/stocks`)
function search(arr, val) {
  var query = [];
  for(i = 0; i < arr.length; i++)
      if (arr[i].includes(val))
          query.push(arr[i]);
  return query;
}

search(stocksData,"ABT");


/* GET home page. */
router.get('/stocks/home', function(req, res, next) {
  influx.query("SHOW MEASUREMENTS")
  .then(result => {
    console.log(result);
    res.send(result)
  }).catch(error=>{
    res.send(error)
  })
});


function sortInputFirst(input, data) {
    data.sort();
    const [first, others] = data.reduce(([a, b], c) => (c.indexOf(input) == 0 ? [[...a, c], b] : [a, [...b, c]]), [[], []]);
    return(first.concat(others));
}



router.get('/stocks/search',function(req,res,next){
  console.log(req.query)
  var token = req.cookies.token;
  jwt.verify(token, publicKEY, verifyOptionsJWT, function (err, decoded) {
    if (err) {
      res.sendStatus(401);
      return
    } else {
      if(!req.body.search){
        influx.query("")
        .then(result => {
          console.log(result);
          res.json(result);
        }).catch(error=>{
          res.sendStatus(500);
        })
      }else{
        var terms = search(stocksData,req.query.term.toUpperCase());
        const output = sortInputFirst(req.query.term.toUpperCase(), terms);
        console.log(output)
        res.json({"stocks":output})
      }
    }
  })
})


module.exports = router;