var mysql		= require('mysql');
var validator 	= require('validator');
var connection 	= require('../models/connection.js');

var base_query = 'select payments.id, payments.created_at, payments.status, payments.contract_id, payments.send_on, payments.amount, contracts.pay_type, employees.id as employee_id, concat(employees.first_name, " ", employees.last_name) as employee_name, (case when (payments.send_on > CURRENT_DATE) then true else false end) as upcoming from payments join contracts on payments.contract_id = contracts.id join employees on contracts.employee_id = employees.id';

// REST Endpoints
exports.getAll = function(req, res) {	
	var query = base_query + ' order by payments.send_on';
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result);
	});
}

exports.save = function(req, res) {
	var status = '';
	var contract_id = '';
	var send_on = '';
	var amount = '';

	var query = '';
	for(payment in req.body) {
		status = req.body[payment].status;
		contract_id = req.body[payment].contract_id;
		send_on = req.body[payment].send_on;
		amount = req.body[payment].amount;
		query += 'insert into payments (status, contract_id, send_on, amount) values ("'+status+'", "'+contract_id+'", "'+send_on+'", "'+amount+'"); ';
	}

	connection.query(query, function(err, result) {
		if(err) {
			console.log(err);
			res.status(400);
		} else {
			res.status(201).send({status: 'saved'});
		}
	});
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