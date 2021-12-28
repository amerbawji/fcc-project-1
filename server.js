var database_uri = 'mongodb+srv://amerbawji:YYOf6a7TMDbesfrj@cluster0.zp6w1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
// server.js
// where your node app starts

// init project
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortid = require('shortid');
var app = express();
var port = process.env.PORT || 3000; //to stop running the server on a dynamic port let it be fixed on 3000

// mongoose.connect(process.env.DB_URI)
mongoose.connect(database_uri, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/requestHeaderParser", function (req, res) {
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

app.get("/urlShortenerMicroservice", function (req, res) {
  res.sendFile(__dirname + '/views/urlShortenerMicroservice.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/timestamp", function(req,res){
  var now = new Date();
  res.json({
    "unix": now.getTime(),
    "utc": now.toUTCString()
  });
});


// get Date String
app.get("/api/timestamp/:date_string", function(req, res){
  let dateString = req.params.date_string;
  
  if(parseInt(dateString)>10000){
    let unixTime= new Date(parseInt(dateString));
    res.json({
      "unix": unixTime.getTime(),
      "utc": unixTime.toUTCString()
    });
  }
  let passedInValue = new Date(dateString);
  if (passedInValue == "Invalid Date"){
    res.json({ "error" : "Invalid Date" });
  }
  else {
    res.json({
      "unix": passedInValue.getTime(),
      "utc": passedInValue.toUTCString()
    })
  }
});

app.get("/api/whoami", function(req,res){
    res.json({
      "ipaddress": req.ip,
      "language": req.headers["accept-language"],
      "software": req.headers["user-agent"]
    });
  });


var ShortURL = mongoose.model('ShortURL', new mongoose.Schema({
  short_url: String,
  original_url: String,
  suffix: String
}));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.post("/api/shorturl/", function(req,res){
  let client_requested_url = req.body.url
  let suffix = shortid.generate();
  let newShortURL = suffix
  console.log(suffix, "<= this will be our suffix");

  let newURL = new ShortURL({
    short_url: __dirname + "/api/shorturl" + suffix,
    original_url: client_requested_url,
    suffix: suffix
  });
  newURL.save( function(err, doc){
    if (err) return console.error(err);
    console.log("successfully saved!");
    res.json({
      "saved": true,
      "short_url": newURL.short_url,
      "original-url": newURL.original_url,
      "suffix": newURL.suffix
    });
  });
});

app.get("/api/shorturl/:suffix", function(req,res){
  let userGeneratedSuffix = req.params.suffix;
  ShortURL.find({suffix: userGeneratedSuffix}).then(function(foundUrls){
    let urlForRedirect = foundUrls[0];
    res.redirect(urlForRedirect.original_url);
  });
});

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
