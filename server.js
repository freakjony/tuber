// set up ========================
var express = require('express');
var app = express(); // create our app w/ express
var mongoose = require('mongoose'); // mongoose for mongodb
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)



// configuration =================
mongoose.connect('mongodb://localhost/container2');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Connected to DB');
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With,content-type, Authorization');
    next();
}

app.use(express.static(__dirname + '/WebContent')); // set the static files location /public/img will be /img for users
app.use("/node_modules", express.static('node_modules'));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(allowCrossDomain);

var router = express.Router();
var Container = require('./models/container');
var containerRoute = require('./routes/containerRoute');
var User = require('./models/user');
var userRoute = require('./routes/userRoute');

app.use('/api', containerRoute);
app.use('/api', userRoute);

process.on('uncaughtException', function(err) {
    console.log(err);
})
// listen (start app with node server.js) ======================================
// process.env.PORT when deployed in Heroku, port 5000 for local testing.
app.listen(process.env.PORT || 5000)
console.log("App listening on port " + process.env.PORT);

app.get('/', function(req, res) {
    res.sendfile('./WebContent/index.html'); // load the single view file
});
