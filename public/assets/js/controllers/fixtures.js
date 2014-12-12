(function () {
  'use strict';

  var fixturesController = app.controller('fixturesController', ['$scope', '$http', '$q', 'Toast', 'Auth', function ($scope, $http, $q, Toast, Auth) {
    // filter object to be used to show fixtures that are happening/ed in the
    // next/past 24 hours
    $scope.showInToday = {showInToday: true};

    var loadPredictionsAnonymously = function () {
      var deferred = $q.defer();
      $http.get('api/predictions/anonymous')
        .success(function (data, status) {
          deferred.resolve(data);
        })
        .error(function (data, status) {
          deferred.reject(status);
        });

      return deferred.promise;
    };

    loadPredictionsAnonymously().then(function (anonymousPredictions) {
      var currentUser = Auth.info(),
          i = 0,
          l = anonymousPredictions.length;

      $http.get('api/fixtures')
        .success(function (data, status, headers, config) {
          angular.forEach(data, function (value, key) {
            // if payer already predicted for fixture
            // we'll set the lock "mode" on
            for (i = 0; i < l; i++) {
              if (anonymousPredictions[i].prediction_fixture === data[key].fixture_id && anonymousPredictions[i].prediction_player === currentUser.player_id) {
                data[key].lock = true;
                break;
              }
            }

            // if fixture time is within 30 minutes
            // we'll also set the lock "mode" on
            // you can try --- BUT good luck passing though my security check
            // muhahahahahahah
            if (moment().add(30, 'minutes').isAfter(data[key].fixture_time) === true) {
              data[key].lock = true;
            }

            data[key].unixEpoch = moment(data[key].fixture_time).valueOf();
            data[key].age = moment(data[key].fixture_time).fromNow();

            var dMinus24 = moment(data[key].fixture_time).subtract(1, 'day'),
                dPlus24 = moment(data[key].fixture_time).add(1, 'day');
            data[key].showInToday = moment().isAfter(dMinus24) && moment().isBefore(dPlus24);
            data[key].humanFormat = moment(data[key].fixture_time).format('MMMM DD, YYYY @ hh:mm A');
            data[key].predictions = {
              prediction_fixture: data[key].fixture_id,
              prediction_home_team: '',
              prediction_away_team: ''
            };
          });

          $scope.fixtures = data;
        })
        .error(function (data, status, headers, config) {
          $scope.fixtures = [];
        });
    }, function (status) {
      Toast.show({template: '<md-toast><span flex>you better call Moe!</span></md-toast>'});
    });



    this.sendPrediction = function (fixture) {
      /**
       * either it's Angular or it's Angular Material or it's me
       * I've given EVERYthing to the form and ng-pattern isn't being recognized
       *
       * since the server does the finial validation, it's all good --- for now
       */
      var toast = '<md-toast><span flex>i got nothing!</span></md-toast>';

      $http.post('api/predictions', fixture.predictions)
        .success(function (data, status) {
          angular.forEach($scope.fixtures, function (value, key) {
            if (value.fixture_id === data.prediction_fixture) {
              $scope.fixtures[key].lock = true;
              $scope.fixtures[key].showAction = false;
              $scope.fixtures[key].showForm = false;
            }
          });

          Toast.show({template: '<md-toast><span flex>prediction submitted</span></md-toast>'});
        })
        .error(function (data, status) {
          if (status === 400) {
            var toast = '<md-toast><span flex>that was just HORRIBLE!</span></md-toast>';
          } else if (status === 404) {
            var toast = '<md-toast><span flex>i don\'t know how you did that, but don\'t do it again!</span></md-toast>';
          } else if (status === 408) {
            var toast = '<md-toast><span flex>too late Mitch!</span></md-toast>';
          } else if (status === 409) {
            var toast = '<md-toast><span flex>prediction ALREADY submitted!</span></md-toast>';
          }

          Toast.show({template: toast});
       });
    };

    $scope.fixturesController = this;
  }]);
})();
