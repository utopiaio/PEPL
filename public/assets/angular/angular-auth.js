;(function(angular) {
  'use strict';

  angular.module('moeAuth', [])
    .provider('Auth', [function() {
      var configuration = {
        authUrl: 'api/login',
        redirect: false,
        redicrectUrl: '/login',
        redirectOnStatus: [412]
      };

      var userData = {};

      return {
        config: function(options) {
          angular.extend(configuration, options);
        },

        isLoggedIn: function($q, $http, $location) {
          /**
           * PS:
           * i don't know if way is "acceptable"
           * but i know no other way of injecting this service into .config
           * plus it's SUPER-smart provider, request sent ONLY once
           * through out the lifetime of the app
           *
           * i want this in ERY controller that needs authentication
           */
          var deferred = $q.defer();

          if(userData.player_id === undefined) {
            $http.get(configuration.authUrl)
              .success(function (data, status, headers, config) {
                userData = data;
                deferred.resolve(data);
              })
              .error(function(data, status, headers, config) {
                if(configuration.redirect === true) {
                  if(configuration.redirectOnStatus.indexOf(status) > -1) {
                    $location.path(configuration.redicrectUrl).replace();
                  }
                }

                deferred.reject(data);
              });
          } else {
            deferred.resolve(userData);
          }

          return deferred.promise;
        },

        $get: function($q, $http, $location) {
          return {
            info: function() {
              return angular.copy(userData);
            },

            login: function(credentials) {
              var deferred = $q.defer();

              $http.post(configuration.authUrl, credentials)
                .success(function(data, status, headers, config) {
                  userData = data;
                  deferred.resolve(data);
                })
                .error(function(data, status, headers, config) {
                  if(configuration.redirect === true) {
                    if(configuration.redirectOnStatus.indexOf(status) > -1) {
                      $location.path(configuration.redicrectUrl).replace();
                    }
                  }

                  deferred.reject(status);
                });

              return deferred.promise;
            },

            logout: function() {
              var deferred = $q.defer();

              $http.delete(configuration.authUrl)
                .success(function(data, status, headers, config) {
                  if(configuration.redirect === true) {
                    $location.path(configuration.redicrectUrl).replace();
                  }

                  deferred.resolve(data);
                })
                .error(function(data, status, headers, config) {
                  deferred.reject(data);
                });

              return deferred.promise;
            }
          };
        }
      };
    }]);
})(window.angular);
