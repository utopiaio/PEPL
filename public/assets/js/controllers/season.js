;(function(angular) {
  'use strict';

  angular.module('pepl')
    .controller('SeasonController', SeasonController);

  SeasonController.$inject = ['$http', '$filter', 'Auth', 'Toast'];

  function SeasonController($http, $filter, Auth, Toast) {
    var vm = this;
    vm.currentUser = Auth.info();

    $http.get('api/fixtures')
      .success(function(data, status) {
        angular.forEach(data, function(value, key) {
          if(moment().add(1, 'minutes').isAfter(data[key].fixture_time) === true) {
            data[key].lock = true;
          }

          data[key].unixEpoch = moment(data[key].fixture_time).valueOf();
          data[key].humanFormat = moment(data[key].fixture_time).format('MMMM DD, YYYY @ hh:mm A');
          data[key].age = moment(data[key].fixture_time).fromNow();
        });

        data = $filter('orderBy')(data, 'unixEpoch', false);

        angular.forEach(data, function(value, key) {
          if(moment(value.fixture_time).isSame(moment(), 'day') === true) {
            data[key].scrollTo = true;
          }
        });

        vm.fixtures = data;

        // giving DOM to render our list before scrolling
        setTimeout(function() {
          if($('.scrollTo').length > 0) {
            $('html, body').animate({
              scrollTop: $($('.scrollTo')[0]).offset().top
            }, 250, 'linear');
          }
        }, 250);
      })
      .error(function(data, status) {
        vm.fixtures = [];
      });

    vm.delete = function(fixture) {
      $http.delete('api/fixtures/'+ fixture.fixture_id)
        .success(function(data, status) {
          angular.forEach(vm.fixtures, function(value, key) {
            if(value.fixture_id === fixture.fixture_id) {
              vm.fixtures.splice(key, 1);
            }
          });

          Toast.show({template: '<md-toast><span flex>fixture deleted</span></md-toast>'});
        })
        .error(function(data, status) {
          var toast = '<md-toast><span flex>i got nothing!</span></md-toast>';

          if(status === 400) {
            toast = '<md-toast><span flex>that was just HORRIBLE!</span></md-toast>';
          } else if(status === 401) {
            toast = '<md-toast><span flex>comeback when you\'re 21</span></md-toast>';
          } else if(status === 404) {
            toast = '<md-toast><span flex>i don\'t know how you did that, but don\'t do it again!</span></md-toast>';
          }

          Toast.show({template: toast});
        });
    };
  }
})(window.angular);
