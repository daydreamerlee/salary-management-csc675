var app = angular.module('salaryManagement', ['ngRoute', 'ngResource', 'datatables', 'angularMoment']);

app.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		controller: "DashboardController",
		templateUrl: "views/dashboard.html",
		activetab: "dashboard"
	})
	.when('/employees', {
		controller: "EmployeesController",
		templateUrl: "views/employees.html",
		activetab: "employees"
	})
	.when('/employees/:id', {
		controller: "EmployeeDetailController",
		templateUrl: "views/employeeDetail.html",
		activetab: "employees"
	})
	.when('/payments', {
		controller: "PaymentsController",
		templateUrl: "views/payments.html",
		activetab: "payments"
	})
	.when('/payments/:id', {
		controller: "PaymentDetailController",
		templateUrl: "views/paymentDetail.html",
		activetab: "payments"
	})
	.when('/contracts', {
		controller: "ContractsController",
		templateUrl: "views/contracts.html",
		activetab: "contracts"
	})
	.when('/contracts/:id', {
		controller: "ContractDetailController",
		templateUrl: "views/contractDetail.html",
		activetab: "contracts"
	})
	.when('/departments', {
		controller: "DepartmentsController",
		templateUrl: "views/departments.html",
		activetab: "departments"
	})
	.when('/departments/:id', {
		controller: "DepartmentDetailController",
		templateUrl: "views/departmentDetail.html",
		activetab: "departments"
	});
});

// Controllers

app.controller('DashboardController', function($scope, $route, DTOptionsBuilder, paymentsFactory, moment) {
	$scope.activeTab = $route.current.activetab;
	$scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(25);
	paymentsFactory.query().$promise.then(function(data) {
        $scope.payments = data;
    });
    $scope.getMoment = function(date) {
    	return new moment(date);
    }
});

app.controller('EmployeesController', function($scope, $route, DTOptionsBuilder, employeesFactory, departmentsFactory, officesFactory, constants) {
	$scope.data = constants;
	$scope.data.departments = departmentsFactory.query();
	$scope.data.offices = officesFactory.query();
	$scope.activeTab = $route.current.activetab;
	$scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(25);
	employeesFactory.query().$promise.then(function(data) {
        $scope.employees = data;
    });
	$scope.validateFields = constants.validateFieldsEmployees;
	$scope.newEmployee = {};
	$scope.newEmployee.status = "active";
	$scope.save = function() {
		employeesFactory.save($scope.newEmployee, function(data) {
			$scope.newEmployee = {};
			$scope.newEmployee.status = "active";
			$scope.validateFields = constants.validateFieldsEmployees;
			employeesFactory.query().$promise.then(function(data) {
		        $scope.employees = data;
		    });
			$scope.dismiss();
		}, function(data) {
			$scope.validateFields = data.data;
		});
	}
});

app.controller('EmployeeDetailController', function($scope, $route, $routeParams, $location, employeesFactory, departmentsFactory, officesFactory, constants) {
	$scope.data = constants;
	$scope.data.departments = departmentsFactory.query();
	$scope.data.offices = officesFactory.query();
	$scope.activeTab = $route.current.activetab;
	var employeeId = $routeParams.id;
	$scope.unsavedChanges = false;
	$scope.savedSuccess = false;
	$scope.employee = employeesFactory.get({id: employeeId});
	$scope.delete = function() {
		employeesFactory.delete({id: employeeId},
			function(success) {
				$location.path("employees");
			}, function(failure) {
				alert("Error: User couldn't be deleted");
			});
	}
	$scope.save = function() {
		employeesFactory.update({id: $scope.employee.id}, $scope.employee, function() {
			$scope.unsavedChanges = false;
			$scope.savedSuccess = true;
		});
	}
	$scope.$watch("employee", function(newValue, oldValue) {
		if(newValue !== oldValue && newValue.id !== undefined && oldValue.id !== undefined) {
			$scope.unsavedChanges = true;
		}
	}, true);
});

app.controller('PaymentsController', function($scope, $route, $filter, paymentsFactory, moment, DTOptionsBuilder, contractsFactory, constants) {
	$scope.data = constants;
	$scope.activeTab = $route.current.activetab;
	$scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(10);
	contractsFactory.query().$promise.then(function(data) {
        $scope.contracts = data;
    });
    $scope.activeContract = null;
    $scope.newPayment = {};
    $scope.recap = {};
    $scope.setActiveContract = function(id) {
    	var active = $filter('filter')($scope.contracts, function (d) {return d.id === id;})[0];
    	$scope.activeContract = active;
    	var begin = new moment($scope.activeContract.date_contract_begin);
    	var end = new moment($scope.activeContract.date_contract_end);
    	$scope.recap.begin = begin;
    	$scope.recap.end = end;
    	$scope.recap.type = active.type;
    	var duration = moment.duration(end.diff(begin));
		switch(active.type) {
			case 'hourly':
				$scope.recap.duration = Math.round(duration.asDays()*100)/100;
				$scope.recap.resolution = "hours";
				break;
			case 'monthly':
				$scope.recap.duration = Math.round(duration.asMonths());
				$scope.recap.resolution = "months";
				break;
			case 'annually':
				$scope.recap.duration = Math.round(duration.asYears()*100)/100;
				$scope.recap.resolution = "years";
				break;
		}
		$scope.recap.amount = active.pay_amount;
		$scope.recap.totalAmount = Math.round($scope.recap.duration * active.pay_amount * 100)/100;
		var length = ($scope.enumerateDaysBetweenDates(begin, end, active.pay_dates.split(','), '', '')).length;
		$scope.recap.singlePayment = Math.round($scope.recap.totalAmount / length * 100)/100;
		$scope.newPayment = $scope.enumerateDaysBetweenDates(begin, end, active.pay_dates.split(','), id, $scope.recap.singlePayment);
    }
    $scope.save = function() {
		paymentsFactory.save($scope.newPayment, function(data) {
			$scope.newPayment = {};
			$scope.dismiss();
		});
	}
    $scope.enumerateDaysBetweenDates = function(startDate, endDate, payDates, contract_id, amount) {
	    var dates = [];
	    var currDate = startDate.clone().startOf('day');
	    var lastDate = endDate.clone().startOf('day');
	    currDate = currDate.add(-1, 'days');
	    while(currDate.add(1, 'days').diff(lastDate) < 0) {
	        if(payDates.indexOf(currDate.format('D')) != -1) {
	        	dates.push({
	        		status: 'active',
	        		send_on_moment: currDate.clone().toDate(),
	        		send_on: currDate.clone().format('YYYY-MM-DD'),
	        		contract_id: contract_id,
	        		amount: amount
	        	});
	        }
	    }
	    return dates;
	}
});

app.controller('ContractsController', function($scope, $route, DTOptionsBuilder, contractsFactory, employeesFactory, constants) {
	$scope.data = constants;
	$scope.data.employees = employeesFactory.query();
	$scope.activeTab = $route.current.activetab;
	$scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(25);
	contractsFactory.query().$promise.then(function(data) {
        $scope.contracts = data;
    });
	$scope.validateFields = constants.validateFieldsContracts;
	$scope.newContract = {};
	$scope.newContract.status = "active";
	$scope.save = function() {
		contractsFactory.save($scope.newContract, function(data) {
			$scope.newContract = {};
			$scope.newContract.status = "active";
			$scope.validateFields = constants.validateFieldsContracts;
			contractsFactory.query().$promise.then(function(data) {
		        $scope.contracts = data;
		    });
			$scope.dismiss();
		}, function(data) {
			$scope.validateFields = data.data;
		});
	}
});

app.controller('ContractDetailController', function($scope, $route, $routeParams, $location, employeesFactory, contractsFactory, constants) {
	$scope.data = constants;
	$scope.data.employees = employeesFactory.query();
	$scope.activeTab = $route.current.activetab;
	var contractId = $routeParams.id;
	$scope.unsavedChanges = false;
	$scope.savedSuccess = false;
	$scope.contract = contractsFactory.get({id: contractId});
	$scope.delete = function() {
		contractsFactory.delete({id: contractId},
			function(success) {
				$location.path("contracts");
			}, function(failure) {
				alert("Error: Contract couldn't be deleted");
			});
	}
	$scope.save = function() {
		contractsFactory.update({id: $scope.contract.id}, $scope.contract, function() {
			$scope.unsavedChanges = false;
			$scope.savedSuccess = true;
		});
	}
	$scope.$watch("contract", function(newValue, oldValue) {
		if(newValue !== oldValue && newValue.id !== undefined && oldValue.id !== undefined) {
			$scope.unsavedChanges = true;
		}
	}, true);
});

app.controller('DepartmentsController', function($scope, $route, DTOptionsBuilder, employeesFactory, departmentsFactory, constants) {
	$scope.data = constants;
	$scope.data.employees = employeesFactory.query();
	$scope.activeTab = $route.current.activetab;
	$scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(25);
	departmentsFactory.query().$promise.then(function(data) {
        $scope.departments = data;
    });
	$scope.validateFields = constants.validateFieldsDepartments;
	$scope.newDepartment = {};
	$scope.newDepartment.status = "active";
	$scope.save = function() {
		departmentsFactory.save($scope.newDepartment, function(data) {
			$scope.newDepartment = {};
			$scope.newDepartment.status = "active";
			$scope.validateFields = constants.validateFieldsDepartments;
			departmentsFactory.query().$promise.then(function(data) {
		        $scope.departments = data;
		    });
			$scope.dismiss();
		}, function(data) {
			$scope.validateFields = data.data;
		});
	}
});

app.controller('DepartmentDetailController', function($scope, $route, $routeParams, $location, employeesFactory, departmentsFactory, constants) {
	$scope.data = constants;
	$scope.data.employees = employeesFactory.query();
	$scope.activeTab = $route.current.activetab;
	var departmentId = $routeParams.id;
	$scope.unsavedChanges = false;
	$scope.savedSuccess = false;
	$scope.department = departmentsFactory.get({id: departmentId});
	$scope.delete = function() {
		departmentsFactory.delete({id: departmentId},
			function(success) {
				$location.path("departments");
			}, function(failure) {
				alert("Error: Department couldn't be deleted");
			});
	}
	$scope.save = function() {
		departmentsFactory.update({id: $scope.department.id}, $scope.department, function() {
			$scope.unsavedChanges = false;
			$scope.savedSuccess = true;
		});
	}
	$scope.$watch("department", function(newValue, oldValue) {
		if(newValue !== oldValue && newValue.id !== undefined && oldValue.id !== undefined) {
			$scope.unsavedChanges = true;
		}
	}, true);
});

// Factories

app.factory('employeesFactory', function($resource) {
	return $resource('api/employees/:id', {id: '@id'}, {
		update: {
			method: 'PUT'
		}
	});
});

app.factory('departmentsFactory', function($resource) {
	return $resource('api/departments/:id', {id: '@id'}, {
		update: {
			method: 'PUT'
		}
	});
});

app.factory('contractsFactory', function($resource) {
	return $resource('api/contracts/:id', {id: '@id'}, {
		update: {
			method: 'PUT'
		}
	});
});

app.factory('officesFactory', function($resource) {
	return $resource('api/offices/:id', {id: '@id'}, {
		update: {
			method: 'PUT'
		}
	});
});

app.factory('paymentsFactory', function($resource) {
	return $resource('api/payments/:id', {id: '@id'}, {
		update: {
			method: 'PUT'
		}
	});
});
