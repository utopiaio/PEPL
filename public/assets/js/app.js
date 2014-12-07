var app = angular.module('pepl', ['ngRoute', 'ngAnimate', 'ngTouch', 'ngMaterial', 'ngAria', 'moeAuth', 'moeProgressMaterial', 'quickToast']);



app.controller('appController', ['$rootScope', '$http', '$location', '$mdSidenav', 'Auth', 'xhrInProgress', function ($rootScope, $http, $location, $mdSidenav, Auth, xhrInProgress) {
  xhrInProgress.listenToXHR();

  $rootScope.showFab = true;

  $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
    console.error(rejection);
  });

  $rootScope.$on('$routeChangeStart', function (event, target) {
  });

  $rootScope.$on('$routeChangeSuccess', function (event, target) {
    $rootScope.showFab = (target.$$route && target.$$route.originalPath !== '/login');
  });

  this.toggleMenu = function() {
    $mdSidenav('menu').toggle();
  };

  this.closeMenu = function () {
    $mdSidenav('menu').close();
  };

  this.activateMenu = function (e, url) {
    $('md-list.main-menu md-item button').removeClass('active');
    $rootScope.appController.closeMenu();

    url === 'logout' ? Auth.logout() : $(e.delegateTarget).addClass('active');

    // post menu activation/close goes here
  };

  $rootScope.appController = this;
}]);



// just preparing, making sure we don't forget stuff
app.config(function($sceDelegateProvider, AuthProvider) {
  AuthProvider.config({
    authUrl: 'api/login',
    redirect: true,
    redicrectUrl: '/login',
    redirectOnStatus: [412]
  });

  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://pifa*.herokuapp.org/**'
  ]);
});



// we're going to intercept request and look out for anything suspicious
// meaning: we're going to look for property 'notify' and call `iPNotify`
// that's pretty much it --- talk about overkill :)
app.config(function ($routeProvider, $locationProvider, AuthProvider) {
  $routeProvider

  .when('/login', {
    templateUrl: 'views/login.html',
    controller: 'loginController'
  })

  .when('/', {
    templateUrl: 'views/home.html',
    controller: 'homeController',
    resolve: {
      loggedIn: AuthProvider.isLoggedIn
    }
  })

  .when('/players', {
    templateUrl: 'views/players.html',
    controller: 'playersController',
    resolve: {
      loggedIn: AuthProvider.isLoggedIn
    }
  })

  .otherwise({
    redirectTo: '/login'
  });

  $locationProvider.html5Mode(true);
});
