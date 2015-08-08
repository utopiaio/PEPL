;(function(angular) {
  'use strict';

  angular.module('moeDateTime', [])
    .directive('dateTime', function() {
      return {
        restrict: 'A',
        link: function(scope, element, attribute) {
          $(element).datetimepicker({
            icons: {
                time: 'ion-ios-time-outline',
                date: 'ion-ios-calendar-outline',
                up:   'ion-ios-arrow-up',
                down: 'ion-ios-arrow-down'
            }
          });
        }
      };
    });
})(window.angular);
