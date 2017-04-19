// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var handlebars = require('express-handlebars');
var methodOverride = require('method-override');

mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Set the port
var PORT = 3000;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


app.use(express.static(__dirname + '/public'));


app.use(methodOverride('_method'));


mongoose.connect('mongodb://heroku_sthxcl68:i45cl0mvm0tm55atonh355s7mn@ds159050.mlab.com:59050/heroku_sthxcl68');
var db = mongoose.connection;


db.on('error', function(error) {
  console.log('Mongoose Error: ', error);
});


db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log('App running on port ' + PORT);
});

// Require routes from controllers
require('./controllers/controller.js')(app);