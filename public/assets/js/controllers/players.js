var playersController = app.controller('playersController', ['$scope', '$http', '$location', 'Toast', 'Auth', function ($scope, $http, $location, Toast, Auth) {
  scrollToTheTop();

  if (Auth.info().player_type === 'NORMAL') {
    $location.path('/login').replace();
  }

  $scope.players = [];

  $http.get('api/players')
    .success(function (data, status, headers, config) {
      $scope.players = data;
    }).error(function (data, status) {
      Toast.show({template: '<md-toast><span flex>ahhhh, you shot me in the ass!</span></md-toast>'});
    });

  this.changePlayerStatus = function (player, pStatus) {
    $http.put('api/players/'+ player.player_id, {player_suspended: pStatus})
      .success(function (data, status) {
        angular.forEach($scope.players, function (value, key) {
          if (value.player_id === player.player_id) {
            $scope.players[key] = data;
          }
        });

        Toast.show({template: '<md-toast><span flex>player '+ String(pStatus === false ? 'activated' : 'suspended') +'</span></md-toast>'});
      })
      .error(function (data, status) {
        Toast.show({template: '<md-toast><span flex>player '+ String(pStatus === false ? 'activation' : 'suspension') +' failed</span></md-toast>'});
      });
  };

  this.deletePlayer = function (player) {
    $http.delete('api/players/'+ player.player_id)
      .success(function (data, status) {
        angular.forEach($scope.players, function (value, key) {
          if (value.player_id === player.player_id) {
            $scope.players.splice(key, 1);
          }
        });

        Toast.show({template: '<md-toast><span flex>deleted</span></md-toast>'});
      })
      .error(function (data, status) {
        Toast.show({template: '<md-toast><span flex>deletion failed</span></md-toast>'});
      });
  };

  $scope.playersController = this;
}]);
