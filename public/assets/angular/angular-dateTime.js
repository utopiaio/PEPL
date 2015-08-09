;(function(angular) {
  'use strict';

  angular.module('moeDateTime', [])
    .directive('dateTime', function() {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attribute, ngModel) {
          var datePicker = $(element).datetimepicker({
            icons: {
                time: 'ion-ios-time-outline',
                date: 'ion-ios-calendar-outline',
                up:   'ion-ios-arrow-up',
                down: 'ion-ios-arrow-down'
            }
          });

          $(datePicker).on('dp.change', function(date, oldDate) {
            scope.$apply(function() {
              ngModel.$setViewValue(date.target.value);
            });
          });
        }
      };
    });
})(window.angular);
