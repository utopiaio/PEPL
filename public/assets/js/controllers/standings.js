;(function(angular) {
  'use strict';

  angular.module('pepl')
    .controller('StandingsController', StandingsController);

  StandingsController.$inject = ['$http', '$filter',  'Auth', 'Toast', 'loadPlayers', 'loadFixtures', 'loadPredictions'];

  function StandingsController($http, $filter, Auth, Toast, loadPlayers, loadFixtures, loadPredictions) {
    var vm = this;

    /**
     * RULE
     *
     * SO   spot-on 3 PTS
     * GD   gold difference 2 PTS
     * W    side 1 PTS
     * L    wrong 0 PTS
     * F    forfeit -1 PTS
     */
    vm.players = loadPlayers;
    vm.fixtures = loadFixtures; // the fixtures that are stored here are the ones that are "completed"
    vm.predictions = loadPredictions;
    vm.currentPlayer = Auth.info();

    // initiating players' stat
    vm.playersStat = {}; // {'username': {SO: 0, GD: 0, W: 0, L: 0, F: 0, PTS: 0}}
    angular.forEach(vm.players, function(value, key) {
      vm.playersStat[value.player_username] = {$username: value.player_username, SO: 0, GD: 0, W: 0, L: 0, F: 0, PTS: 0};
    });

    // we'll loop through fixtures and associate em' with predictions
    angular.forEach(vm.fixtures, function(valueF, keyF) {
      vm.fixtures[keyF].predictions = {};

      angular.forEach(vm.predictions, function(valueP, keyP) {
        if(valueF.fixture_id === valueP.prediction_fixture.fixture_id) {
          vm.fixtures[keyF].predictions[valueP.prediction_player.player_username] = valueP;
        }
      });
    });

    // yes more loop
    angular.forEach(vm.playersStat, function(stat, username) {
      angular.forEach(vm.fixtures, function(valueF, keyF) {
        // show me what you got little mama
        if(valueF.predictions.hasOwnProperty(username) === true) {
          // spot-on
          if((valueF.fixture_team_home_score === valueF.predictions[username].prediction_home_team) && (valueF.fixture_team_away_score === valueF.predictions[username].prediction_away_team)) {
            if(valueF.fixture_team_home_score > -1) {
              vm.playersStat[username].SO ++;
              vm.playersStat[username].PTS += 3;
              vm.fixtures[keyF].predictions[username].PTS = 3;
            }
          }

          // goal difference
          else if((valueF.fixture_team_home_score - valueF.fixture_team_away_score) === (valueF.predictions[username].prediction_home_team - valueF.predictions[username].prediction_away_team)) {
            if(valueF.fixture_team_home_score > -1) {
              vm.playersStat[username].GD ++;
              vm.playersStat[username].PTS += 2;
              vm.fixtures[keyF].predictions[username].PTS = 2;
            }
          }

          // side
          else if((valueF.fixture_team_home_score > valueF.fixture_team_away_score) === (valueF.predictions[username].prediction_home_team > valueF.predictions[username].prediction_away_team) &&
                  (valueF.fixture_team_home_score < valueF.fixture_team_away_score) === (valueF.predictions[username].prediction_home_team < valueF.predictions[username].prediction_away_team)) {
            if(valueF.fixture_team_home_score > -1) {
              vm.playersStat[username].W ++;
              vm.playersStat[username].PTS += 1;
              vm.fixtures[keyF].predictions[username].PTS = 1;
            }
          }

          // miiiiiiiiiiiiiiith
          else {
            if(valueF.fixture_team_home_score > -1) {
              vm.playersStat[username].L ++;
              vm.fixtures[keyF].predictions[username].PTS = 0;
            }
          }
        }

        // forfeit
        else {
          if(valueF.fixture_team_home_score > -1) {
            vm.playersStat[username].F ++;
            vm.playersStat[username].PTS -= 1;
            vm.fixtures[keyF].predictions[username] = {PTS: -1};
          }
        }
      });
    });

    vm.fixtures = $filter('orderBy')(vm.fixtures, 'unixEpoch', true);

    /**
     * there's no turning back now
     * i was wrong, so wrong! (Prometheus)
     */
    vm.statOrdered = [];
    angular.forEach(vm.playersStat, function(value, key) {
      vm.statOrdered.push(value);
    });

    vm.statOrdered = $filter('orderBy')(vm.statOrdered, 'F', false);
    vm.statOrdered = $filter('orderBy')(vm.statOrdered, 'L', false);
    vm.statOrdered = $filter('orderBy')(vm.statOrdered, 'W', true);
    vm.statOrdered = $filter('orderBy')(vm.statOrdered, 'GD', true);
    vm.statOrdered = $filter('orderBy')(vm.statOrdered, 'SO', true);
    vm.statOrdered = $filter('orderBy')(vm.statOrdered, 'PTS', true);
  }
})(window.angular);
