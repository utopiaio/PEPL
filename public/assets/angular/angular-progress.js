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
              template: '<md-toast style="position: fixed;">\
                           <div flex layout="row" layout-align="start center">\
                            <div flex="20"><md-progress-circular md-mode="indeterminate" md-diameter="24"></md-progress-circular></div>\
                            <div flex>Loading...\</div>\
                          </div>\
                        </md-toast>',
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
