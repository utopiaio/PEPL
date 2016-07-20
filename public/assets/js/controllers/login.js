;(function(angular) {
  'use strict';

  angular.module('pepl')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$http', '$location', 'Toast', 'Auth'];

  function LoginController($http, $location, Toast, Auth) {
    var vm = this;

    vm.credentials = {
      ID: '',
      password: ''
    };

    vm.newPlayer = {
      player_username: '',
      player_password: '',
      player_email: ''
    };

    $http.get('api/login').success(function(data, status, headers, config) {
      $location.path('/').replace();
    });

    vm.login = function() {
      Auth.login(vm.credentials).then(function(data) {
        $location.path('/').replace();
      }, function(status) {
        if(status === 406) {
          var toast = '<md-toast><span flex>check yo-self!</span></md-toast>';
        } else {
          var toast = '<md-toast><span flex>UNAUTHORIZED Mitch!</span></md-toast>';
        }

        Toast.show({template: toast});
      });
    };

    vm.singup = function() {
      $http.post('api/signup', vm.newPlayer)
        .success(function(data, status, headers, config) {
          Toast.show({template: '<md-toast><span flex>you\'ll be notified by email once you\'re approved</span></md-toast>'});
        })
        .error(function(data, status, headers, config) {
          var toast = '';

          if(status === 400) {
            toast = '<md-toast><span flex>that was just BAD!</span></md-toast>';
          } else if(status === 403) {
            toast = '<md-toast><span flex>one too many requests Mitch!</span></md-toast>';
          } else if(status === 406) {
            toast = '<md-toast><span flex>check yo-self!</span></md-toast>';
          } else if(status === 409) {
            toast = '<md-toast><span flex>username or email taken, try a different one</span></md-toast>';
          }

          Toast.show({template: toast});
        });
    };
  }
})(window.angular);
