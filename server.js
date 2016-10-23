// set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var Container = require('./models/container');
	var router = express.Router();
	var containerRoute = require('./routes/containerRoute');

    // configuration =================
	
    // After having Heroku deployed change to mLab https://devcenter.heroku.com/articles/mongolab
    mongoose.connect('mongodb://localhost:27017/tuber'); 
	var db = mongoose.connection;
  	db.on('error', console.error.bind(console, 'connection error:'));
  	db.once('open', function callback() {
   		console.log('Connected to DB');
	});	
	// Do all your "pre-route" use() functions first
	
//	app.use(function (req, res, next) {
//   		req.locals.db = db; // this is setting up db property to request
//   		next();
//	});


    app.use(express.static(__dirname + '/WebContent'));                 // set the static files location /public/img will be /img for users
    app.use('/bower_components', express.static(__dirname + '/bower_components'));
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
	app.use('/api', containerRoute);

    // listen (start app with node server.js) ======================================
    app.listen(9998);
    console.log("App listening on port 9998");

	app.get('/', function(req, res) {
        res.sendfile('./WebContent/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


// *********** REST API *****************


