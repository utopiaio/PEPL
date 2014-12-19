var standingsController = app.controller('standingsController', ['$scope', '$http', '$filter',  'Auth', 'Toast', 'loadPlayers', 'loadFixtures', 'loadPredictions', function ($scope, $http, $filter, Auth, Toast, loadPlayers, loadFixtures, loadPredictions) {
  scrollToTheTop();

  /**
   * RULE
   *
   * SO   spot-on 3 PTS
   * GD   gold difference 2 PTS
   * W    side 1 PTS
   * L    wrong 0 PTS
   * F    forfeit -1 PTS
   */

  $scope.players = loadPlayers;
  $scope.fixtures = loadFixtures; // the fixtures that are stored here are the ones that are "completed"
  $scope.predictions = loadPredictions;
  $scope.currentPlayer = Auth.info();

  // initiating players' stat
  $scope.playersStat = {}; // {'username': {SO: 0, GD: 0, W: 0, L: 0, F: 0, PTS: 0}}
  angular.forEach($scope.players, function (value, key) {
    $scope.playersStat[value.player_username] = {$username: value.player_username, SO: 0, GD: 0, W: 0, L: 0, F: 0, PTS: 0};
  });

  // we'll loop through fixtures and associate em' with predictions
  angular.forEach($scope.fixtures, function (valueF, keyF) {
    $scope.fixtures[keyF].predictions = {};

    angular.forEach($scope.predictions, function (valueP, keyP) {
      if (valueF.fixture_id === valueP.prediction_fixture.fixture_id) {
        $scope.fixtures[keyF].predictions[valueP.prediction_player.player_username] = valueP;
      }
    });
  });

  // yes more loop
  angular.forEach($scope.playersStat, function (stat, username) {
    angular.forEach($scope.fixtures, function (valueF, keyF) {
      // show me what you got little mama
      if (valueF.predictions.hasOwnProperty(username) === true) {
        // spot-on
        if ((valueF.fixture_team_home_score === valueF.predictions[username].prediction_home_team) && (valueF.fixture_team_away_score === valueF.predictions[username].prediction_away_team)) {
          $scope.playersStat[username].SO ++;
          $scope.playersStat[username].PTS += 3;
          $scope.fixtures[keyF].predictions[username].PTS = 3;
        }

        // goal difference
        else if ((valueF.fixture_team_home_score - valueF.fixture_team_away_score) === (valueF.predictions[username].prediction_home_team - valueF.predictions[username].prediction_away_team)) {
          $scope.playersStat[username].GD ++;
          $scope.playersStat[username].PTS += 2;
          $scope.fixtures[keyF].predictions[username].PTS = 2;
        }

        // side
        else if ((valueF.fixture_team_home_score > valueF.fixture_team_away_score) === (valueF.predictions[username].prediction_home_team > valueF.predictions[username].prediction_away_team)) {
          $scope.playersStat[username].W ++;
          $scope.playersStat[username].PTS += 1;
          $scope.fixtures[keyF].predictions[username].PTS = 1;
        }

        // miiiiiiiiiiiiiiith
        else {
          $scope.playersStat[username].L ++;
          $scope.fixtures[keyF].predictions[username].PTS = 0;
        }
      }

      // forfeit
      else {
        $scope.playersStat[username].F ++;
        $scope.playersStat[username].PTS -= 1;
        $scope.fixtures[keyF].predictions[username] = {PTS: -1};
      }
    });
  });

  $scope.fixtures = $filter('orderBy')($scope.fixtures, 'unixEpoch', true);

  /**
   * there's no turning back now
   * i was wrong, so wrong! (Prometheus)
   */
  $scope.statOrdered = [];
  angular.forEach($scope.playersStat, function (value, key) {
    $scope.statOrdered.push(value);
  });

  $scope.statOrdered = $filter('orderBy')($scope.statOrdered, 'F', false);
  $scope.statOrdered = $filter('orderBy')($scope.statOrdered, 'L', false);
  $scope.statOrdered = $filter('orderBy')($scope.statOrdered, 'W', true);
  $scope.statOrdered = $filter('orderBy')($scope.statOrdered, 'GD', true);
  $scope.statOrdered = $filter('orderBy')($scope.statOrdered, 'SO', true);
  $scope.statOrdered = $filter('orderBy')($scope.statOrdered, 'PTS', true);

  $scope.standingsController = this;
}]);



standingsController.loadPlayers = function ($q, $http) {
  var deferred = $q.defer();

  $http.get('api/players')
    .success(function (data, staus) {
      deferred.resolve(data);
    })
    .error(function (data, staus) {
      deferred.reject();
    });

  return deferred.promise;
};

standingsController.loadFixtures = function ($q, $http) {
  var deferred = $q.defer();

  $http.get('api/fixtures')
    .success(function (data, staus) {
      var fixtures = [];
      angular.forEach(data, function (value, key) {
        if (value.fixture_team_home_score > -1) {
          value.humanFormat = moment(value.fixture_time).format('MMMM DD, YYYY @ hh:mm A');
          value.unixEpoch = moment(value.fixture_time).valueOf();
          fixtures.push(value);
        }
      });

      deferred.resolve(fixtures);
    })
    .error(function (data, staus) {
      deferred.reject();
    })

  return deferred.promise;
};

standingsController.loadPredictions = function ($q, $http) {
  var deferred = $q.defer();

  $http.get('api/predictions')
    .success(function (data, staus) {
      deferred.resolve(data);
    })
    .error(function (data, staus) {
      deferred.reject();
    })

  return deferred.promise;
};
