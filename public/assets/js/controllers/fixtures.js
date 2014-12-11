var fixturesController = app.controller('fixturesController', ['$scope', '$http', function ($scope, $http) {
  $http.get('api/fixtures')
    .success(function (data, status, headers, config) {
      $scope.fixtures = data;
    })
    .error(function (data, status, headers, config) {
      $scope.fixtures = [];
    });

  this.activate = function () {
    console.log('activate');
  };

  $scope.fixturesController = this;
}]);
