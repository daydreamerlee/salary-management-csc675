var mysql		= require('mysql');
var validator 	= require('validator');
var connection 	= require('../models/connection.js');

var base_query = 'select * from offices';

// REST Endpoints
exports.getAll = function(req, res) {	
	var query = base_query + ' order by id desc';
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result);
	});
}

exports.getById = function(req, res) {
	var id = req.params.id;
	var query = base_query + ' where id = ' + id;
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result[0]);
	});
}

// Functions
function giveJSONResponse(res, result) {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(result));
}