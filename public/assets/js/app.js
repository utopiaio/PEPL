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
;(function(angular) {
  'use strict';

  angular.module('pepl', ['ngRoute', 'ngAnimate', 'ngTouch', 'ngAria', 'ngMaterial', 'moeAuth', 'moeProgressMaterial', 'moeQuickToast', 'moeDateTime']);

  angular.module('pepl')
    .controller('AppController', AppController)
    .config(Config);

  AppController.$inject = ['$rootScope', '$http', '$location', '$timeout', '$route', '$window', '$mdSidenav', 'Auth', 'xhrInProgress'];
  Config.$inject = ['$sceDelegateProvider', '$routeProvider', 'AuthProvider'];

  function Config($sceDelegateProvider, $routeProvider, AuthProvider) {
    AuthProvider.config({
      authUrl: 'api/login',
      redirect: true,
      redicrectUrl: '/login',
      redirectOnStatus: [404, 412]
    });

    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://pepl*.herokuapp.org/**'
    ]);

    $routeProvider
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        controllerAs: 'login'
      })
      .when('/', {
        templateUrl: 'views/fixtures.html',
        controller: 'FixturesController',
        controllerAs: 'fixtures',
        resolve: {
          loggedIn: AuthProvider.isLoggedIn
        }
      })
      .when('/fixture/new', {
        templateUrl: 'views/fixture-new.html',
        controller: 'FixtureNewController',
        controllerAs: 'fixtureNew',
        resolve: {
          loggedIn: AuthProvider.isLoggedIn
        }
      })
      .when('/players', {
        templateUrl: 'views/players.html',
        controller: 'PlayersController',
        controllerAs: 'players',
        resolve: {
          loggedIn: AuthProvider.isLoggedIn
        }
      })
      .when('/season', {
        templateUrl: 'views/season.html',
        controller: 'SeasonController',
        controllerAs: 'season',
        resolve: {
          loggedIn: AuthProvider.isLoggedIn
        }
      })
      .when('/standings', {
        templateUrl: 'views/standings.html',
        controller: 'StandingsController',
        controllerAs: 'standings',
        resolve: {
          loggedIn: AuthProvider.isLoggedIn,
          loadPlayers: function($q, $http) {
            var deferred = $q.defer();

            $http.get('api/players')
              .success(function(data, staus) {
                deferred.resolve(data);
              })
              .error(function(data, staus) {
                deferred.reject();
              });

            return deferred.promise;
          },
          loadFixtures: function($q, $http) {
            var deferred = $q.defer();

            $http.get('api/fixtures')
              .success(function(data, staus) {
                var fixtures = [];
                angular.forEach(data, function(value, key) {
                  if(moment(value.fixture_time).isSame(moment(), 'day') || value.fixture_team_home_score > -1) {
                    value.humanFormat = moment(value.fixture_time).format('MMMM DD, YYYY @ hh:mm A');
                    value.unixEpoch = moment(value.fixture_time).valueOf();
                    fixtures.push(value);
                  }
                });

                deferred.resolve(fixtures);
              })
              .error(function(data, staus) {
                deferred.reject();
              })

            return deferred.promise;
          },
          loadPredictions: function($q, $http) {
            var deferred = $q.defer();

            $http.get('api/predictions')
              .success(function(data, staus) {
                deferred.resolve(data);
              })
              .error(function(data, staus) {
                deferred.reject();
              })

            return deferred.promise;
          }
        }
      })
      .when('/wall', {
        templateUrl: 'views/wall.html',
        controller: 'WallController',
        controllerAs: 'wall',
        resolve: {
          loggedIn: AuthProvider.isLoggedIn,
          loadMessages: function($q, $http, $filter) {
            var deferred = $q.defer();

            $http.get('api/wall')
              .success(function(data, staus) {
                angular.forEach(data, function(value, key) {
                  value.humanFormat = moment(value.wall_timestamp).format('MMMM DD, YYYY @ hh:mm A');
                  value.age = moment(value.wall_timestamp).fromNow();
                  value.unixEpoch = moment(value.wall_timestamp).valueOf();
                });

                data = $filter('orderBy')(data, 'unixEpoch', true);
                deferred.resolve(data);
              })
              .error(function(data, staus) {
                deferred.reject();
              });

            return deferred.promise;
          }
        }
      })
      .otherwise({
        redirectTo: '/login'
      });
  }

  function AppController($rootScope, $http, $location, $timeout, $route, $window, $mdSidenav, Auth, xhrInProgress) {
    var vm = this;

    xhrInProgress.listenToXHR();
    vm.showFab = false;
    // we need reload where socket.io fails :(
    // $rootScope.iPhone = $window.navigator.platform.search(/iPhone/ig) === -1 ? false : true;
    vm.teams = ['AFC-Bournemouth',
                'Arsenal',
                'Aston-Villa',
                'Chelsea',
                'Crystal-Palace',
                'Everton',
                'Leicester-City',
                'Liverpool',
                'Manchester-City',
                'Manchester-United',
                'Newcastle-United',
                'Norwich-City',
                'Southampton',
                'Stock-City',
                'Sunderland',
                'Swansea-City',
                'Tottenham-Hotspur',
                'Watford',
                'West-Bromwich-Albion',
                'West-Ham-United'];

    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
      console.error(rejection);
      $location.path('/login').replace();
    });

    $rootScope.$on('$routeChangeStart', function(event, target) {
      // clearing all active menu
      // the designated menu will be activated on `routeChangeSuccess`
      $('md-list.main-menu md-item button').removeClass('active');
      $('.bootstrap-datetimepicker-widget').remove();
    });

    $rootScope.$on('$routeChangeSuccess', function(event, target) {
      scrollToTheTop();
      vm.showFab = (target.$$route && target.$$route.originalPath !== '/login');

      // menu activation based on the, the good ol' switch!
      if(target.$$route) {
        switch(target.$$route.originalPath) {
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

    vm.toggleMenu = function() {
      $mdSidenav('menu').toggle();
    };

    vm.closeMenu = function() {
      $mdSidenav('menu').close();
    };

    vm.navigateTo = function(url) {
      vm.closeMenu();
      if(url === 'logout') {
        vm.showFab = false;
      }

      // giving the time out makes sure the animation doesn't become "weired"
      $timeout(function() {
        url === 'logout' ? Auth.logout() : $location.path(url);
      }, 250);
    };

    vm.reload = function() {
      $route.reload();
    };
  }
})(window.angular);
