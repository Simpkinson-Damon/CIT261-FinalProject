// required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/index');
//var pg = require('pg');
//var url = require('url');


//begin app
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Set up body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set port
app.set('port', (process.env.PORT || 5000));

// set routes
routes(app);

// Start the server
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});