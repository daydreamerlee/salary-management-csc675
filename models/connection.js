var mysql	= require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'salary_management_app',
	multipleStatements: true
});

module.exports = connection;