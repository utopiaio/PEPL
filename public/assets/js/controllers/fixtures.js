var fixturesController = app.controller('fixturesController', ['$scope', '$http', function ($scope, $http) {
  $http.get('api/fixtures')
    .success(function (data, status, headers, config) {
      $scope.fixtures = data;
    })
    .error(function (data, status, headers, config) {
      $scope.fixtures = [];
    });

  $scope.fixturesController = this;
}]);
