var fixtureNewController = app.controller('fixtureNewController', ['$scope', '$http', '$log', 'Toast', 'Auth', function ($scope, $http, $log, Toast, Auth) {
  // yes, teams are static, give me a break
  // i'll migrate it to Firebase when i can
  $scope.teams = ['Arsenal',
                  'Aston-Villa',
                  'Burnley',
                  'Chelsea',
                  'Crystal-Palace',
                  'Everton',
                  'Hull-City',
                  'Leicester-City',
                  'Liverpool',
                  'Manchester-City',
                  'Manchester-United',
                  'Newcastle-United',
                  'QPR',
                  'Southampton',
                  'Stock-City',
                  'Sunderland',
                  'Swansea-City',
                  'Tottenham-Hotspur',
                  'West-Bromwich-Albion',
                  'West-Ham-United'];

  $scope.newFixture = {
    fixture_team_home: 'Arsenal',
    fixture_team_away: 'Aston-Villa',
    date: '',
    time: '',
    fixture_time: ''
  };

  $http.get('api/fixtures');

  this.save = function () {
    // there has to be a better way!!!
    $scope.newFixture.fixture_time = moment(moment($scope.newFixture.date).year() +"-"+ (moment($scope.newFixture.date).month() + 1) +"-"+ moment($scope.newFixture.date).date() +" "+ moment($scope.newFixture.time).hours() +":"+ moment($scope.newFixture.time).minute() +":"+ moment($scope.newFixture.time).second(), 'YYYY-M-D H:m:s').format('YYYY-MM-DD HH:mm:ss');

    $http.post('api/fixtures', $scope.newFixture)
      .success(function (data, status, headers, config) {
        Toast.show({template: '<md-toast><span flex>fixture added</span></md-toast>'});
        $location.path('/').replace();
      })
      .error(function (data, status, headers, config) {
        Toast.show({template: '<md-toast><span flex>error adding fixture</span></md-toast>'});
      });
  };

  $scope.fixtureNewController = this;
}]);
