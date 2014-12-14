var fixtureNewController = app.controller('fixtureNewController', ['$scope', '$http', '$location', 'Toast', 'Auth', function ($scope, $http, $location, Toast, Auth) {
  if (Auth.info().player_type === 'NORMAL') {
    // am just redirecting you for your own good
    // you can try but you'll only get a 401
    $location.path('/season');
  }

  $scope.newFixture = {
    fixture_team_home: 'Arsenal',
    fixture_team_away: 'Aston-Villa',
    fixture_time: moment().format('YYYY-MM-DD HH:mm')
  };

  this.save = function () {
    $http.post('api/fixtures', $scope.newFixture)
      .success(function (data, status) {
        Toast.show({template: '<md-toast><span flex>fixture added</span></md-toast>'});
        $location.path('/season').replace();
      })
      .error(function (data, status) {
        // am not going to look at the status code
        // it's mua who's going to Gadafi it
        Toast.show({template: '<md-toast><span flex>error adding fixture</span></md-toast>'});
      });
  };

  $scope.fixtureNewController = this;
}]);
