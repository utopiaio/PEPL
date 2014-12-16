var bareController = app.controller('bareController', ['$scope', '$http', 'Auth', function ($scope, $http, Auth) {
  scrollToTheTop();

  $scope.bareController = this;
}]);
