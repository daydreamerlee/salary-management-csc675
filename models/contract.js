var mysql		= require('mysql');
var validator 	= require('validator');
var connection 	= require('../models/connection.js');
var Q 			= require('Q');

var base_query = 'select contracts.id, contracts.created_at, contracts.status, contracts.created_at, convert(contracts.employee_id, char) as employee_id, contracts.status, date_format(contracts.date_effective, "%m/%d/%Y") as date_effective, date_format(contracts.date_contract_begin, "%m/%d/%Y") as date_contract_begin, date_format(contracts.date_contract_end, "%m/%d/%Y") as date_contract_end, contracts.weekly_hours, contracts.type, contracts.pay_amount, contracts.pay_type, contracts.note, contracts.scan_url, concat(employees.first_name, " ", employees.last_name) as employee_name, group_concat(pay_dates.pay_date) as pay_dates from contracts join pay_dates on contracts.id = pay_dates.contract_id join employees on contracts.employee_id = employees.id';

// REST Endpoints
exports.getAll = function(req, res) {	
	var query = base_query + ' group by employees.first_name, employees.last_name, contracts.id order by contracts.id';
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result);
	});
}

exports.getById = function(req, res) {
	var id = req.params.id;
	var query = base_query + ' where contracts.id = ' + id + ' group by employees.first_name, employees.last_name, contracts.id';
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result[0]);
	});
}

exports.save = function(req, res, verb) {
	var employee_id = req.body.employee_id;
	var status = req.body.status;
	var date_effective = req.body.date_effective;
	var date_contract_begin = req.body.date_contract_begin;
	var date_contract_end = req.body.date_contract_end;
	var weekly_hours = req.body.weekly_hours;
	var type = req.body.type;
	var pay_amount = req.body.pay_amount;
	var pay_type = req.body.pay_type;
	var note = req.body.note;
	var scan_url = req.body.scan_url == undefined ? '' : req.body.scan_url;
	var pay_dates = req.body.pay_dates == undefined ? '' : req.body.pay_dates;

	var validateFields = {
		'employee_id': employee_id == null ? false : validator.isNumeric(employee_id),
		'status': status == null ? false : validator.isAlphanumeric(status),
		'date_effective': date_effective == null ? false : validator.isDate(date_effective),
		'date_contract_begin': date_contract_begin == null ? false : validator.isDate(date_contract_begin),
		'date_contract_end': date_contract_end == null ? false : validator.isDate(date_contract_end),
		'weekly_hours': weekly_hours == null ? false : validator.isNumeric(weekly_hours+''),
		'type': type == null ? false : validator.isAlphanumeric(type),
		'pay_amount': pay_amount == null ? false : validator.isNumeric(pay_amount+''),
		'pay_type': pay_type == null ? false : validator.isAlphanumeric(pay_type),
		'note': note == null || note == '' ? true : validator.isAlphanumeric(note),
		'scan_url': scan_url == null || scan_url == '' ? true : validator.isURL(scan_url),
		'pay_dates': pay_dates == null ? false : validator.matches(pay_dates+'', /^(\d+)(,\s*\d+)*$/i)
	}

	var valid = true;

	for(var key in validateFields) {
		if(!validateFields[key]) {
			valid = false;
		}
	}

	function doQuery(query) {
        var defered = Q.defer();
        connection.query(query, defered.makeNodeResolver());
        return defered.promise;
    }

	if(valid) {
		pay_dates = pay_dates.replace(/\s/g, '');
		if(verb == "POST") {
			var query = 'insert into contracts (employee_id, status, date_effective, date_contract_begin, date_contract_end, weekly_hours, type, pay_amount, pay_type, note, scan_url) values ("'+employee_id+'", "'+status+'", str_to_date("'+date_effective+'", "%m/%d/%Y"), str_to_date("'+date_contract_begin+'", "%m/%d/%Y"), str_to_date("'+date_contract_end+'", "%m/%d/%Y"), "'+weekly_hours+'", "'+type+'", "'+pay_amount+'", "'+pay_type+'", "'+note+'", "'+scan_url+'")';
		} else {
			var query = 'update contracts set employee_id="'+employee_id+'", status="'+status+'", date_effective=str_to_date("'+date_effective+'", "%m/%d/%Y"), date_contract_begin=str_to_date("'+date_contract_begin+'", "%m/%d/%Y"), date_contract_end=str_to_date("'+date_contract_end+'", "%m/%d/%Y"), weekly_hours="'+weekly_hours+'", type="'+type+'", pay_amount="'+pay_amount+'", pay_type="'+pay_type+'", note="'+note+'", scan_url="'+scan_url+'" where id = '+req.body.id;
		}

		var insert_query = '';

		Q.all([doQuery(query)]).then(function(result) {
			var dates = pay_dates.split(",");
			if(verb == "POST") {
				var id = result[0][0].insertId;
			} else {
				var id = req.body.id;
			}
			var delete_query = 'delete from pay_dates where contract_id = '+id+';';
			for(var date in dates) {
				insert_query += 'insert into pay_dates (contract_id, pay_date) values ("'+id+'", "'+dates[date]+'"); ';
			}
			return doQuery(delete_query);
    	})
    	.then(function() {
    		return doQuery(insert_query);
    	})
    	.done(function() {
    		res.status(201).send(req.body);
    	});
	} else {
		res.status(400).send(JSON.stringify(validateFields));
	}
}

exports.deleteById = function(req, res) {
	var id = req.params.id;
	var query = 'delete from contracts where id = ' + id + ';';
	query += 'delete from pay_dates where contract_id = ' + id + ';';
	connection.query(query, function(err, result) {
		res.sendStatus(202);
	});
}

// Functions
function giveJSONResponse(res, result) {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(result));
}