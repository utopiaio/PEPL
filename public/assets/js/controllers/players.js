var playersController = app.controller('playersController', ['$scope', '$http', '$location', 'Toast', 'Auth', function ($scope, $http, $location, Toast, Auth) {
  if (Auth.info().player_type === 'NORMAL') {
    $location.path('/login').replace();
  }

  $scope.players = [];

  $http.get('api/players')
    .success(function (data, status, headers, config) {
      $scope.players = data;
    });

  this.activatePlayer = function (id) {
    $http.put('api/players/'+ id + '/activate')
      .success(function (data, status, headers, config) {
        angular.forEach($scope.players, function (value, key) {
          if (value.player_id === id) {
            $scope.players[key] = data;
          }
        });

        Toast.show({template: '<md-toast><span flex>activated</span></md-toast>'});
      })
      .error(function (data, status, headers, config) {
        Toast.show({template: '<md-toast><span flex>activation failed</span></md-toast>'});
      });
  };

  this.suspendPlayer = function (id) {
    $http.put('api/players/'+ id + '/suspend')
      .success(function (data, status, headers, config) {
        angular.forEach($scope.players, function (value, key) {
          if (value.player_id === id) {
            $scope.players[key] = data;
          }
        });

        Toast.show({template: '<md-toast><span flex>suspended</span></md-toast>'});
      })
      .error(function (data, status, headers, config) {
        Toast.show({template: '<md-toast><span flex>suspension failed</span></md-toast>'});
      });
  };

  this.deletePlayer = function (id) {
    $http.delete('api/players/'+ id)
      .success(function (data, status, headers, config) {
        angular.forEach($scope.players, function (value, key) {
          if (value.player_id === id) {
            $scope.players.splice(key, 1);
          }
        });

        Toast.show({template: '<md-toast><span flex>deleted</span></md-toast>'});
      })
      .error(function (data, status, headers, config) {
        Toast.show({template: '<md-toast><span flex>deletion failed</span></md-toast>'});
      });
  };

  $scope.playersController = this;
}]);
