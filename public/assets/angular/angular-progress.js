angular.module('moeProgressMaterial', ['ngMaterial']).config(function ($routeProvider, $httpProvider) {
  $httpProvider.interceptors.push(function ($rootScope, $q) {
    $rootScope.xhrInProgress = false;

    return {
     'request': function(config) {
        $rootScope.xhrInProgress = true;
        return config;
      },

      'response': function(response) {
        $rootScope.xhrInProgress = false;
        return response;
      },

      'responseError': function (rejection) {
        $rootScope.xhrInProgress = false;
        return $q.reject(rejection);
      }
    };

  });
}).factory('xhrInProgress', ['$rootScope', '$mdToast', function ($rootScope, $mdToast) {
  return {
    listenToXHR: function () {
      var loadingToast = null;
      $rootScope.$watch('xhrInProgress', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          if (newVal === true) {
            loadingToast = $mdToast.show({
              controller: function () {},
              template: '<md-toast style="position: fixed;"><span flex><i class="ion-loading-c"></i>&nbsp;&nbsp;Loading...</span></md-toast>',
              hideDelay: false,
              position: 'bottom left'
            });
          } else if (newVal === false) {
            $mdToast.hide(loadingToast);
          }
        }
      });
    }
  };
}]);
