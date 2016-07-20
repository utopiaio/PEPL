;(function(angular) {
  'use strict';

  angular.module('pepl')
    .controller('FixtureNewController', FixtureNewController);

  FixtureNewController.$inject = ['$http', '$location', 'Toast', 'Auth'];

  function FixtureNewController($http, $location, Toast, Auth) {
    var vm = this;

    if(Auth.info().player_type === 'NORMAL') {
      // am just redirecting you for your own good
      // you can try but you'll only get a 401
      $location.path('/season');
    }

    vm.newFixture = {
      fixture_team_home: 'Arsenal',
      fixture_team_away: 'Aston-Villa',
      fixture_time: moment().format('YYYY-MM-DD HH:mm')
    };

    vm.save = function() {
      $http.post('api/fixtures', vm.newFixture)
        .success(function(data, status) {
          Toast.show({template: '<md-toast><span flex>fixture added</span></md-toast>'});
          $location.path('/season').replace();
        })
        .error(function(data, status) {
          // am not going to look at the status code
          // it's mua who's going to Gadafi it
          Toast.show({template: '<md-toast><span flex>error adding fixture</span></md-toast>'});
        });
    };
  }
})(window.angular);
