;(function(angular) {
  'use strict';

  angular.module('pepl')
    .controller('FixturesController', FixturesController);

  FixturesController.$inject = ['$http', '$q', '$filter', 'Toast', 'Auth'];

  function FixturesController($http, $q, $filter, Toast, Auth) {
    var vm = this;

    // filter object to be used to show fixtures that are happening/ed in the
    // next/past 36 hours
    vm.showInToday = {showInToday: true};
    vm.currentUser = Auth.info();

    var loadPredictionsAnonymously = function() {
      var deferred = $q.defer();

      $http.get('api/predictions/anonymous')
        .success(function(data, status) {
          deferred.resolve(data);
        })
        .error(function(data, status) {
          deferred.reject(status);
        });

      return deferred.promise;
    };

    loadPredictionsAnonymously().then(function(anonymousPredictions) {
      var i = 0,
          l = anonymousPredictions.length;

      $http.get('api/fixtures')
        .success(function(data, status, headers, config) {
          angular.forEach(data, function(value, key) {
            // if payer already predicted for fixture
            // we'll set the lock "mode" on
            for(i = 0; i < l; i++) {
              if(anonymousPredictions[i].prediction_fixture === value.fixture_id && anonymousPredictions[i].prediction_player === vm.currentUser.player_id) {
                data[key].lock = true;
                break;
              }
            }

            // if fixture time is less than 1 minute away
            // we'll set the lock "mode" on
            // you can try --- BUT good luck passing though my security check
            // muhahahahahahah
            if(moment().add(1, 'minutes').isAfter(data[key].fixture_time) === true) {
              data[key].lock = true;
            }

            data[key].unixEpoch = moment(data[key].fixture_time).valueOf();
            data[key].age = moment(data[key].fixture_time).fromNow();
            // this accounts for different timezones which isSame "doesn't"
            // games starting at midnight will no longer be on lock-down
            var dMinus72 = moment(data[key].fixture_time).subtract(72, 'hours'),
                dPlus72 = moment(data[key].fixture_time).add(72, 'hours');
            data[key].showInToday = moment().isAfter(dMinus72) && moment().isBefore(dPlus72);
            /**
             * 45 minutes - first half
             * 1 minute - minimum stoppage time
             * 15 minutes - half time break
             * 45 minutes - second half
             * 1 minute - minimum stoppage time
             * grand total of...drum roll
             * 107 minutes
             */
            data[key].gameIsOver = moment().isAfter(moment(data[key].fixture_time).add(107, 'minutes'));
            data[key].humanFormat = moment(data[key].fixture_time).format('MMMM DD, YYYY @ hh:mm A');
            data[key].predictions = {
              prediction_fixture: data[key].fixture_id,
              prediction_home_team: '',
              prediction_away_team: ''
            };
          });

          vm.fixtures = $filter('orderBy')(data, 'unixEpoch', false);
        })
        .error(function(data, status, headers, config) {
          vm.fixtures = [];
        });
    }, function(status) {
      Toast.show({template: '<md-toast><span flex>you better call Moe!</span></md-toast>'});
    });



    vm.sendPrediction = function(fixture) {
      /**
       * either it's Angular or it's Angular Material or it's me
       * I've given EVERYthing to the form and ng-pattern isn't being recognized
       *
       * since the server does the finial validation, it's all good --- for now
       */
      $http.post('api/predictions', fixture.predictions)
        .success(function(data, status) {
          angular.forEach(vm.fixtures, function(value, key) {
            if(value.fixture_id === data.prediction_fixture) {
              vm.fixtures[key].lock = true;
              vm.fixtures[key].showAction = false;
              vm.fixtures[key].showForm = false;
            }
          });

          Toast.show({template: '<md-toast><span flex>prediction submitted</span></md-toast>'});
        })
        .error(function(data, status) {
          var toast = '<md-toast><span flex>i got nothing!</span></md-toast>';

          if(status === 400) {
            toast = '<md-toast><span flex>that was just HORRIBLE!</span></md-toast>';
          } else if(status === 404) {
            toast = '<md-toast><span flex>i don\'t know how you did that, but don\'t do it again!</span></md-toast>';
          } else if(status === 408) {
            toast = '<md-toast><span flex>too late Mitch!</span></md-toast>';
          } else if(status === 409) {
            toast = '<md-toast><span flex>prediction ALREADY submitted!</span></md-toast>';
          }

          Toast.show({template: toast});
       });
    };



    /**
     * yes, am avoiding using ng-submit because pressing return seems to bypass
     * the form validation, so it's on with the click
     *
     * PS
     * this function is to be called by a MAN only
     * rest of you Mitches stay back!
     */
    vm.matchFinalResult = function(fixture) {
      $http.put('api/fixtures/'+ fixture.fixture_id, fixture)
        .success(function(data, status) {
          angular.forEach(vm.fixtures, function(value, key) {
            if(value.fixture_id === data.fixture_id) {
              vm.fixtures[key].lock = true;
              vm.fixtures[key].showAction = false;
              vm.fixtures[key].showAdminForm = false;
            }
          });

          Toast.show({template: '<md-toast><span flex>fixture updated</span></md-toast>'});
        })
        .error(function(data, status) {
          var toast = '<md-toast><span flex>i got nothing!</span></md-toast>';

          if(status === 400) {
            toast = '<md-toast><span flex>that was just HORRIBLE!</span></md-toast>';
          } else if(status === 401) {
            toast = '<md-toast><span flex>comeback when you\'re 21</span></md-toast>';
          } else if(status === 404) {
            toast = '<md-toast><span flex>fixture no-longer exits</span></md-toast>';
          }

          Toast.show({template: toast});
        });
    };
  }
})(window.angular);
