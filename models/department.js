var mysql		= require('mysql');
var validator 	= require('validator');
var connection 	= require('../models/connection.js');

var base_query = 'select departments.id, departments.created_at, departments.status, departments.name, CONVERT(departments.manager, char) as manager, CONCAT(employees.first_name, " ", employees.last_name) as manager_name from departments left join employees on departments.manager = employees.id';

// REST Endpoints
exports.getAll = function(req, res) {	
	var query = base_query + ' order by departments.name desc';
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result);
	});
}

exports.getById = function(req, res) {
	var id = req.params.id;
	var query = base_query + ' where departments.id = ' + id;
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result[0]);
	});
}

exports.save = function(req, res, verb) {
	var status = req.body.status;
	var name = req.body.name;
	var manager = req.body.manager;

	var validateFields = {
		'status': status == null ? false : validator.isAlphanumeric(status),
		'name': name == null ? false : validator.isAlphanumeric(validator.blacklist(name, ['-', '&', ' ', '.', ','])),
		'manager': manager == null ? false : validator.isNumeric(manager)
	}

	var valid = true;

	for(var key in validateFields) {
		if(!validateFields[key]) {
			valid = false;
		}
	}

	if(valid) {
		if(verb == "POST") {
			var query = 'insert into departments (status, name, manager) values ("'+status+'", "'+name+'", "'+manager+'")';
		} else {
			var query = 'update departments set status="'+status+'", name="'+name+'", manager="'+manager+'" where id = '+req.body.id;
		}
		connection.query(query, function(err, result) {
			res.status(201).send(req.body);
		});
	} else {
		res.status(400).send(JSON.stringify(validateFields));
	}
}

exports.deleteById = function(req, res) {
	var id = req.params.id;
	var query = 'delete from departments where id = ' + id;
	connection.query(query, function(err, result) {
		res.sendStatus(202);
	});
}

// Functions
function giveJSONResponse(res, result) {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(result));
}