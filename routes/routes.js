var express 	= require('express');
var router		= express.Router();

var employee	= require('../models/employee.js');
var department	= require('../models/department.js');
var office      = require('../models/office.js');
var contract    = require('../models/contract.js');
var payment     = require('../models/payment.js');

// Employees
router.get('/employees', function(req, res) { employee.getAll(req, res); });
router.get('/employees/:id', function(req, res) { employee.getById(req, res); });
router.post('/employees', function(req, res) { employee.save(req, res, "POST"); });
router.put('/employees/:id', function(req, res) { employee.save(req, res, "PUT"); });
router.delete('/employees/:id', function(req, res) { employee.deleteById(req, res); });

// Departments
router.get('/departments', function(req, res) { department.getAll(req, res); });
router.get('/departments/:id', function(req, res) { department.getById(req, res); });
router.post('/departments', function(req, res) { department.save(req, res, "POST"); });
router.put('/departments/:id', function(req, res) { department.save(req, res, "PUT"); });
router.delete('/departments/:id', function(req, res) { department.deleteById(req, res); });

// Office
router.get('/offices', function(req, res) { office.getAll(req, res); });
router.get('/offices/:id', function(req, res) { office.getById(req, res); });

// Contracts
router.get('/contracts', function(req, res) { contract.getAll(req, res); });
router.get('/contracts/:id', function(req, res) { contract.getById(req, res); });
router.post('/contracts', function(req, res) { contract.save(req, res, "POST"); });
router.put('/contracts/:id', function(req, res) { contract.save(req, res, "PUT"); });
router.delete('/contracts/:id', function(req, res) { contract.deleteById(req, res); });

// Payments
router.get('/payments', function(req, res) { payment.getAll(req, res); });
router.post('/payments', function(req, res) { payment.save(req, res, "POST"); });
router.delete('/payments/:id', function(req, res) { payment.deleteById(req, res); });

module.exports = router;