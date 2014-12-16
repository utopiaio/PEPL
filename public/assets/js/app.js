/**
 * API summary
 *
 *
 * LOGIN -----------------------------------------------------------------------
 * GET    /login
 * POST   /login {ID: 'ID', password: 'password'}
 *
 * PREDICTIONS -----------------------------------------------------------------
 * GET    /predictions/anonymous
 * GET    /predictions
 * POST   /predictions {prediction_fixture: 'prediction_fixture', prediction_home_team: 'prediction_home_team', prediction_away_team: 'prediction_away_team'}
 *
 * FIXTURES --------------------------------------------------------------------
 * GET    /fixtures
 * POST   /fixtures/new
 * PUT    /fixtures/:id {fixture}
 * DELETE /fixtures/:id
 *
 * PLAYERS (admin) -------------------------------------------------------------
 * GET    /api/players
 * GET    /api/players/:id
 * PUT    /api/players/:id {player_suspended: STATUS}
 * DELETE /api/players/:id
 *
 */

var app = angular.module('pepl', ['ngRoute',
                                  'ngAnimate',
                                  'ngTouch',
                                  'ngMaterial',
                                  'ngAria',
                                  'moeAuth',
                                  'moeProgressMaterial',
                                  'moeQuickToast',
                                  'moeDateTime']);



app.controller('appController', ['$rootScope', '$http', '$location', '$timeout', '$route', '$window', '$mdSidenav', 'Auth', 'xhrInProgress', function ($rootScope, $http, $location, $timeout, $route, $window, $mdSidenav, Auth, xhrInProgress) {
  xhrInProgress.listenToXHR();
  $rootScope.showFab = false;
  // we need reload where socket.io fails :(
  // $rootScope.iPhone = $window.navigator.platform.search(/iPhone/ig) === -1 ? false : true;
  $rootScope.teams = ['Arsenal',
                      'Aston-Villa',
                      'Burnley',
                      'Chelsea',
                      'Crystal-Palace',
                      'Everton',
                      'Hull-City',
                      'Leicester-City',
                      'Liverpool',
                      'Manchester-City',
                      'Manchester-United',
                      'Newcastle-United',
                      'QPR',
                      'Southampton',
                      'Stock-City',
                      'Sunderland',
                      'Swansea-City',
                      'Tottenham-Hotspur',
                      'West-Bromwich-Albion',
                      'West-Ham-United'];

  $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
    console.error(rejection);
  });

  $rootScope.$on('$routeChangeStart', function (event, target) {
    // clearing all active menu
    // the designated menu will be activated on `routeChangeSuccess`
    $('md-list.main-menu md-item button').removeClass('active');
    $('.bootstrap-datetimepicker-widget').remove();
  });

  $rootScope.$on('$routeChangeSuccess', function (event, target) {
    $rootScope.showFab = (target.$$route && target.$$route.originalPath !== '/login');

    // menu activation based on the, the good ol' switch!
    if (target.$$route) {
      switch (target.$$route.originalPath) {
        case '/':
          $('button[menu-target="fixtures"]').addClass('active');
        break;

        case '/season':
          $('button[menu-target="season"]').addClass('active');
        break;

        case '/standings':
          $('button[menu-target="standings"]').addClass('active');
        break;

        case '/wall':
          $('button[menu-target="wall"]').addClass('active');
        break;
      }
    }
  });

  this.toggleMenu = function() {
    $mdSidenav('menu').toggle();
  };

  this.closeMenu = function () {
    $mdSidenav('menu').close();
  };

  this.navigateTo = function (url) {
    $rootScope.appController.closeMenu();
    if (url === 'logout') {
      $rootScope.showFab = false;
    }

    // giving the time out makes sure the animation doesn't become "weired"
    $timeout(function () {
      url === 'logout' ? Auth.logout() : $location.path(url);
    }, 250);
  };

  this.reload = function () {
    $route.reload();
  };

  $rootScope.appController = this;
}]);



// just preparing, making sure we don't forget stuff
app.config(function($sceDelegateProvider, AuthProvider) {
  AuthProvider.config({
    authUrl: 'api/login',
    redirect: true,
    redicrectUrl: '/login',
    redirectOnStatus: [404, 412]
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
    templateUrl: 'views/fixtures.html',
    controller: 'fixturesController',
    resolve: {
      loggedIn: AuthProvider.isLoggedIn
    }
  })

  .when('/fixture/new', {
    templateUrl: 'views/fixture-new.html',
    controller: 'fixtureNewController',
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

  .when('/season', {
    templateUrl: 'views/season.html',
    controller: 'seasonController',
    resolve: {
      loggedIn: AuthProvider.isLoggedIn
    }
  })

  .when('/standings', {
    templateUrl: 'views/standings.html',
    controller: 'standingsController',
    resolve: {
      loggedIn: AuthProvider.isLoggedIn,
      loadPlayers: standingsController.loadPlayers,
      loadFixtures: standingsController.loadFixtures,
      loadPredictions: standingsController.loadPredictions
    }
  })

  .when('/wall', {
    templateUrl: 'views/wall.html',
    controller: 'wallController',
    resolve: {
      loggedIn: AuthProvider.isLoggedIn,
      loadMessages: wallController.loadMessages
    }
  })

  .otherwise({
    redirectTo: '/login'
  });

  $locationProvider.html5Mode(true);
});
