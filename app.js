/*jshint node:true*/

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');

var http = require('http');
var path = require('path');
var redis = require('redis');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var redisport = process.env['REDIS_PORT'];
var redishost = process.env['REDIS_HOST'];
var redispw = process.env['REDIS_PW'];

if (redisport == "") {
  redisport = 6379;
}
if (redishost == "") {
  redishost = "localhost";
}

var rdClient = redis.createClient(redisport, redishost);
if (redispw != '') {
  rdClient.auth(redispw);
}

rdClient.on("error", function (err) {
    console.log("ERROR: " + err);
});

// Retrieve info about the redis server
app.get("/servinfo", function(request, response) {
  var respData = {};
  rdClient.info("server", function(err, servinfo) {
    respData['server'] = servinfo;
    console.log("Provided redis server info response");
    response.send(respData);
  })
})

// Returns an array of hashtags that have been put in the pubq
app.get("/hashtags", function(request, response) {
  var respData = {};
  rdClient.smembers("hashtags", function(err, hashtags) {
    respData['hashtags'] = hashtags;
    console.log("Hashtag list: "+hashtags);
    response.send(respData);
  })
})

// Returns count of tweets by specific hashtag left in the pubq
app.get("/htcount", function(request, response) {
  var respData = {};
  rdClient.get(request.query.hashtag, function(err, htcount) {
    respData['htcount'] = htcount;
    console.log("Count for hashtag ("+request.query.hashtag+"): "+htcount);
    response.send(respData);
  })
})

// Retrieves a single tweet from the publish Q
app.get("/atweet", function(request, response) {
  var respData = {};
  rdClient.rpop("pubq", function(err, tweetinfo) {
    if (tweetinfo != null) {
      var values = tweetinfo.split(':')
      if (values.length != 2) {
        console.log("invalid tweet info from redis!");
        response.send(respData);
        return
      }
      respData['tweetid'] = values[1];
      respData['hashtag'] = values[0];
      rdClient.decr(values[0], function(err) {});
      console.log("Tweet ID: "+values[1]+" / Hashtag: "+values[0]);
      response.send(respData);
    } else {
      response.send(respData);
    }
  })
});

// handle signals properly
process.on('SIGTERM', function() {
  console.log('\ncaught SIGTERM, stopping gracefully');
  process.exit(0);
});

process.on('SIGINT', function() {
  console.log('\ncaught CTRL-C, stopping gracefully');
  process.exit(0);
});


// start server
app.listen(8080, function() {
  console.log("tweetview server starting on port 8080");
});
