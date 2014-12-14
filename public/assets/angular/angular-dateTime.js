angular.module('moeDateTime', []).directive('dateTime', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attribute) {
      $(element).datetimepicker();
    }
  };
});
