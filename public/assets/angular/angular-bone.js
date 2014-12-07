angular.module('angularHeight', []).directive('windowHeight', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attribute, ngModel) {
      $(element).css({
        'height': $(window).height() + 'px',
      });

      $(window).resize(function () {
        $(element).css({
          'height': $(window).height() + 'px'
        });
      });
    }
  }
});
