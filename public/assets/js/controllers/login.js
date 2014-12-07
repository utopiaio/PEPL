var loginController = app.controller('loginController', ['$scope', '$http', '$location', '$log', '$mdToast', '$timeout', 'Auth', function ($scope, $http, $location, $log, $mdToast, $timeout, Auth) {
  $scope.credentials = {
    ID: '',
    password: ''
  };

  $scope.newPlayer = {
    player_username: '',
    player_password: '',
    player_email: ''
  };

  $http.get('api/login').success(function (data, status, headers, config) {
    $location.path('/').replace();
  });

  this.login = function () {
    Auth.login($scope.credentials).then(function (data) {
      $location.path('/').replace();
    }, function (data) {
      $timeout(function() {
        $mdToast.show({
          template: '<md-toast><span flex>UNAUTHORIZED Mitch!</span></md-toast>',
          hideDelay: 3000,
          position: 'bottom left'
        });
      }, 64);
    });
  };

  this.singup = function () {
    $http.post('api/signup', $scope.newPlayer)
      .success(function (data, status, headers, config) {
        $timeout(function() {
          $mdToast.show({
            template: '<md-toast><span flex>you\'ll be notified by email once you\'re approved</span></md-toast>',
            hideDelay: 5000,
            position: 'bottom left'
          });
        }, 64);
      })
      .error(function (data, status, headers, config) {
        var toast = '';

        if (status === 409) {
          toast = '<md-toast><span flex>username or email taken, try a different one</span></md-toast>';
        } else if (status === 403) {
          toast = '<md-toast><span flex>one too many requests Mitch!</span></md-toast>'
        } else {
          $log.error(data);
        }

        $timeout(function() {
          $mdToast.show({
            template: toast,
            hideDelay: 3000,
            position: 'bottom left'
          });
        }, 64);
      });
  };

  $scope.loginController = this;
}]);
