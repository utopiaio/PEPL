var wallController = app.controller('wallController', ['$scope', '$http', '$filter', 'Auth', 'Toast', 'loadMessages', function ($scope, $http, $filter, Auth, Toast, loadMessages) {
  scrollToTheTop();

  $scope.currentPlayer = Auth.info();
  $scope.message = {message: ''};
  $scope.messages = loadMessages;

  /**
   * i should have handled the socket connection initiation
   * via a promise --- while trying to do that, i ran in to some problems
   */
  var socket = io.connect();

  socket.on('connect', function () {
    console.info('holly shit, socket connection established!');
  });

  socket.on('message', function (data) {
    switch (data.mode) {
      case 'NEW_MESSAGE':
        data.message.humanFormat = moment(data.message.wall_timestamp).format('MMMM DD, YYYY @ hh:mm A');
        data.message.age = moment(data.message.wall_timestamp).fromNow();
        data.message.unixEpoch = moment(data.message.wall_timestamp).valueOf();
        $scope.messages.push(data.message);
        $scope.messages = $filter('orderBy')($scope.messages, 'unixEpoch', true);
        $scope.$digest();
      break;
    };
  });

  socket.on('connect_error', function () {
    Toast.show({template: '<md-toast><span flex>TIE!</span></md-toast>'});
  });

  this.post = function () {
    $http.post('api/wall', $scope.message)
      .success(function (data, staus) {
        data.humanFormat = moment(data.wall_timestamp).format('MMMM DD, YYYY @ hh:mm A');
        data.age = moment(data.wall_timestamp).fromNow();
        data.unixEpoch = moment(data.wall_timestamp).valueOf();
        $scope.messages.push(data);
        $scope.messages = $filter('orderBy')($scope.messages, 'unixEpoch', true);
        $scope.message.message = '';
      })
      .error(function (data, staus) {
        Toast.show({template: '<md-toast><span flex>that\'s just too nasty!</span></md-toast>'});
      });
  };

  $scope.wallController = this;
}]);



wallController.loadMessages = function ($q, $http, $filter) {
  var deferred = $q.defer();
  $http.get('api/wall')
    .success(function (data, staus) {
      angular.forEach(data, function (value, key) {
        value.humanFormat = moment(value.wall_timestamp).format('MMMM DD, YYYY @ hh:mm A');
        value.age = moment(value.wall_timestamp).fromNow();
        value.unixEpoch = moment(value.wall_timestamp).valueOf();
      });

      data = $filter('orderBy')(data, 'unixEpoch', true);
      deferred.resolve(data);
    })
    .error(function (data, staus) {
      deferred.reject();
    });

  return deferred.promise;
};
