app.directive('ngConfirmClick', [function() {
    return {
        link: function (scope, element, attr) {
            var msg = attr.ngConfirmClick;
            var clickAction = attr.confirmedClick;
            element.bind('click',function (event) {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction)
                }
            });
        }
    };
}])

app.directive('myModal', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.dismiss = function() {
                element.modal('hide');
            };
        }
    } 
});

app.directive('jqueryDatePicker', ['$compile', '$timeout', '$parse', function($compile, $timeout, $parse) {
    var tpl = "<div class='input-group'> <input type='text' class='form-control' ng-model='myDate' placeholder='mm/dd/yyyy' required='true' /> <div class='input-group-addon' ng-click='showCalendar()'><i class='fa fa-calendar'></i></div> </div>";
    return {
        restrict: 'AE',
        require: 'ngModel',
        replace: true,
        template: tpl,
        scope: {
            invalidDates: "=disableDates"
        },
        link : function(scope,element,attrs,ngModelCtrl){
          $(element).daterangepickercompat({
              singleDatePicker: true,
              "isInvalidDate": function (val) {
                  var findFedDate = $.inArray(moment(val).format("MM/DD/YYYY"), scope.invalidDates);
                  if (findFedDate != -1) {
                      return true;
                  } else {
                      return false;
                  }
                  
              }
          });

          //Updating incoming model value and assign to viewValue
          ngModelCtrl.$formatters.push(function(modelValue) {
              var myDate = modelValue;
              return myDate;
          });

          //Incoming viewValue and assign to modelValue
          ngModelCtrl.$parsers.push(function(viewValue) {
              scope.myDate = viewValue;
              scope.myDate = scope.myDate.format('L');
              return scope.myDate;
          });


          $(element).on('apply.daterangepickercompat', function(ev, picker) {
              var pickedDate = moment(picker.startDate).utcOffset(240); //Corrects UTC offset issue
              ngModelCtrl.$setViewValue(pickedDate);
              ngModelCtrl.$render = function() {
                  scope.myDate = scope.myDate;
              };
          });

          //Return rendered to templates model
          ngModelCtrl.$render = function() {
            scope.myDate = ngModelCtrl.$viewValue;
          };

        }
    };

}]);