var express 	= require('express');
var path        = require('path');
var bodyParser  = require('body-parser');

var app = express();
var port = 2002;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, 'public_html')));
app.use("/api", require('./routes/routes.js'));

app.listen(port, function() {
    console.log('Listening on port ', port)
});