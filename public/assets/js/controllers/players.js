;(function(angular) {
  'use strict';

  angular.module('pepl')
    .controller('PlayersController', PlayersController);

  PlayersController.$inject = ['$http', '$location', 'Toast', 'Auth'];

  function PlayersController($http, $location, Toast, Auth) {
    var vm = this;

    vm.search = '';

    if(Auth.info().player_type === 'NORMAL') {
      $location.path('/login').replace();
    }

    vm.players = [];

    $http.get('api/players')
      .success(function(data, status, headers, config) {
        vm.players = data;
      }).error(function(data, status) {
        Toast.show({template: '<md-toast><span flex>ahhhh, you shot me in the ass!</span></md-toast>'});
      });

    vm.changePlayerStatus = function(player, pStatus) {
      $http.put('api/players/'+ player.player_id, {player_suspended: pStatus})
        .success(function(data, status) {
          angular.forEach(vm.players, function(value, key) {
            if(value.player_id === player.player_id) {
              vm.players[key] = data;
            }
          });

          Toast.show({template: '<md-toast><span flex>player '+ String(pStatus === false ? 'activated' : 'suspended') +'</span></md-toast>'});
        })
        .error(function(data, status) {
          Toast.show({template: '<md-toast><span flex>player '+ String(pStatus === false ? 'activation' : 'suspension') +' failed</span></md-toast>'});
        });
    };

    vm.deletePlayer = function(player) {
      $http.delete('api/players/'+ player.player_id)
        .success(function(data, status) {
          angular.forEach(vm.players, function(value, key) {
            if(value.player_id === player.player_id) {
              vm.players.splice(key, 1);
            }
          });

          Toast.show({template: '<md-toast><span flex>deleted</span></md-toast>'});
        })
        .error(function(data, status) {
          Toast.show({template: '<md-toast><span flex>deletion failed</span></md-toast>'});
        });
    };
  }
})(window.angular);
