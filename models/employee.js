var mysql		= require('mysql');
var validator 	= require('validator');
var connection 	= require('../models/connection.js');

var base_query = 'select employees.id, employees.created_at, employees.status, employees.first_name, employees.last_name, employees.title, employees.gender, employees.job_title, employees.email, employees.ssn, employees.phone_number, employees.street, employees.city, employees.state, employees.country, employees.zip, CONVERT(employees.office, char) as office, CONVERT(departments.id, char) as department, departments.name as department_name from employees left join departments on employees.department = departments.id';

// REST Endpoints
exports.getAll = function(req, res) {
	var query = base_query + ' order by employees.id desc';
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result);
	});
}

exports.getById = function(req, res) {
	var id = req.params.id;
	var query = base_query + ' where employees.id = ' + id;
	connection.query(query, function(err, result) {
		giveJSONResponse(res, result[0]);
	});
}

exports.save = function(req, res, verb) {
	var status = req.body.status;
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var title = req.body.title;
	var gender = req.body.gender;
	var job_title = req.body.job_title;
	var email = req.body.email;
	var ssn = req.body.ssn;
	var phone_number = req.body.phone_number;
	var street = req.body.street;
	var city = req.body.city;
	var state = req.body.state;
	var country = req.body.country;
	var zip = req.body.zip;
	var department = req.body.department;
	var office = req.body.office;

	var validateFields = {
		'status': status == null ? false : validator.isAlphanumeric(status),
		'first_name': first_name == null ? false : validator.isAlpha(first_name),
		'last_name': last_name == null ? false : validator.isAlpha(last_name),
		'title': title == null ? false : validator.isAlpha(title),
		'gender': gender == null ? false : validator.isAlpha(gender),
		'job_title': job_title == null ? false : validator.isAlphanumeric(validator.blacklist(job_title, ['-', ' ', '.', ','])),
		'email': email == null ? false : validator.isEmail(email),
		'ssn': ssn == null ? false : validator.isNumeric(validator.blacklist(ssn, '-')),
		'phone_number': phone_number == null ? false : validator.isMobilePhone(phone_number, 'en-US'),
		'street': street == null ? false : validator.isAlphanumeric(validator.blacklist(street, ['-', ' ', '.', ','])),
		'city': city == null ? false : validator.isAlpha(validator.blacklist(city, ['-', ' ', '.', ','])),
		'state': state == null ? false : validator.isAlpha(state),
		'country': country == null ? false : validator.isAlpha(country),
		'zip': zip == null ? false : validator.isNumeric(zip),
		'department': department == null ? false : validator.isNumeric(department),
		'office': office == null ? false : validator.isNumeric(office)
	}

	var valid = true;

	for(var key in validateFields) {
		if(!validateFields[key]) {
			valid = false;
		}
	}

	if(valid) {
		if(verb == "POST") {
			var query = 'insert into employees (status, first_name, last_name, title, gender, job_title, email, ssn, phone_number, street, city, state, country, zip, department, office) values ("'+status+'", "'+first_name+'", "'+last_name+'", "'+title+'", "'+gender+'", "'+job_title+'", "'+email+'", "'+ssn+'", "'+phone_number+'", "'+street+'", "'+city+'", "'+state+'", "'+country+'", "'+zip+'", "'+department+'", "'+office+'")';
		} else {
			var query = 'update employees set status="'+status+'", first_name="'+first_name+'", last_name="'+last_name+'", title="'+title+'", gender="'+gender+'", job_title="'+job_title+'", email="'+email+'", ssn="'+ssn+'", phone_number="'+phone_number+'", street="'+street+'", city="'+city+'", state="'+state+'", country="'+country+'", zip="'+zip+'", department="'+department+'", office="'+office+'" where id = '+req.body.id;
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
	var query = 'delete from employees where id = ' + id;
	connection.query(query, function(err, result) {
		res.sendStatus(202);
	});
}

// Functions
function giveJSONResponse(res, result) {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(result));
}