angular.module('moeQuickToast', ['ngMaterial'])
  .factory('Toast', ['$timeout', '$mdToast', function ($timeout, $mdToast) {
    return {
      show: function (options) {
        var defaults = {
          template: '<md-toast><span flex>message</span></md-toast>',
          hideDelay: 3000,
          position: 'bottom left'
        };

        angular.extend(defaults, options);

        $timeout(function() {
          $mdToast.show(defaults);
        }, 64);
      }
     };
  }]);
