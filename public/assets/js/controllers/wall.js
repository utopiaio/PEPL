;(function(angular) {
  'use strict';

  angular.module('pepl')
    .controller('WallController', WallController);

  WallController.$inject = ['$scope', '$http', '$filter', '$interval', 'Auth', 'Toast', 'loadMessages'];

  function WallController($scope, $http, $filter, $interval, Auth, Toast, loadMessages) {
    var vm = this;

    vm.currentPlayer = Auth.info();
    vm.message = {message: ''};
    vm.messages = loadMessages;
    vm.timeStampInterval = undefined;

    // refresh trash age every minute
    vm.timeStampInterval = $interval(function() {
      angular.forEach(vm.messages, function(value, key) {
        vm.messages[key].age = moment(value.wall_timestamp).fromNow();
      });
    }, 60000);

    $scope.$on('$destroy', function() {
      if (angular.isDefined(vm.timeStampInterval)) {
        $interval.cancel(vm.timeStampInterval);
      }
    });

    var socket = io.connect();

    socket.on('connect', function() {
      console.info('holly shit, socket connection established!');
    });

    socket.on('message', function(data) {
      switch(data.mode) {
        case 'NEW_MESSAGE':
          data.message.humanFormat = moment(data.message.wall_timestamp).format('MMMM DD, YYYY @ hh:mm A');
          data.message.age = moment(data.message.wall_timestamp).fromNow();
          data.message.unixEpoch = moment(data.message.wall_timestamp).valueOf();
          vm.messages.push(data.message);
          vm.messages = $filter('orderBy')(vm.messages, 'unixEpoch', true);
          vm.$digest();
        break;
      };
    });

    socket.on('connect_error', function() {
      Toast.show({template: '<md-toast><span flex>TIE!</span></md-toast>'});
    });

    vm.post = function() {
      $http.post('api/wall', vm.message)
        .success(function(data, staus) {
          data.humanFormat = moment(data.wall_timestamp).format('MMMM DD, YYYY @ hh:mm A');
          data.age = moment(data.wall_timestamp).fromNow();
          data.unixEpoch = moment(data.wall_timestamp).valueOf();
          vm.messages.push(data);
          vm.messages = $filter('orderBy')(vm.messages, 'unixEpoch', true);
          vm.message.message = '';
        })
        .error(function(data, staus) {
          Toast.show({template: '<md-toast><span flex>that\'s just too nasty!</span></md-toast>'});
        });
    };
  }
})(window.angular);
