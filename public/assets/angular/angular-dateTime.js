angular.module('moeDateTime', []).directive('dateTime', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attribute) {
      $(element).datetimepicker({
        icons: {
            time: 'ion-ios7-time-outline',
            date: 'ion-ios7-calendar-outline',
            up:   'ion-ios7-arrow-up',
            down: 'ion-ios7-arrow-down'
        }
      });
    }
  };
});
