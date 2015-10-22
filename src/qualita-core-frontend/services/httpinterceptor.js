'use strict';

/**
 * @ngdoc service
 * @name acadSvnApp.HttpInterceptor
 * @description
 * # HttpInterceptor
 * Factory in the acadSvnApp.
 */
angular.module('qualitaCoreFrontend')
  .factory('HttpInterceptor', function ($q, $location, $rootScope,
                                        $cookieStore, $injector) {

    return {
      request: function(config) {

        if($location.path() !== '/login') {
          config.headers.Authorization = 'Bearer ' + $rootScope.AuthParams.accessToken;
        }
        return config;
      },

      requestError: function(rejection) {

        if(rejection.status === 401) {
          $location.path('/login');
        }
        return $q.reject(rejection);
      },


      response: function(response) {
        return response;
      },

      responseError: function(rejection) {

        var notify = $injector.get('notify');

        if(rejection.status === 401) {
          if(rejection.data && rejection.data.code === 403) {
            // error de autorización
            console.log('HttpInterceptor -> error de autorizacion');
            notify({
              message: rejection.data.error,
              classes: ['alert-danger']
            });
            $location.path('/');
            return $q.reject(rejection);
          }

          var deferred = $q.defer();
          var AuthenticationService = $injector.get('AuthenticationService');
          var $http = $injector.get('$http');
          var auth = AuthenticationService.token($rootScope.AuthParams);

          auth.then(function(response) {
            $rootScope.AuthParams.accessToken = response.accessToken;
            localStorage.setItem('AUTH_PARAMS', JSON.stringify($rootScope.AuthParams));
          }).then(deferred.resolve, deferred.reject);

          return deferred.promise.then(function() {
              rejection.config.headers.Authorization = 'Bearer ' + $rootScope.AuthParams.accessToken;
              return $http(rejection.config);
          });
        }
        return $q.reject(rejection);
      }
    };
  });
