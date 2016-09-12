(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.HttpInterceptor
 * @description
 * # HttpInterceptor
 */
angular.module('ui')
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
        console.log('responseError 401');
        var notify = $injector.get('notify');
        if(rejection.status === 401) {
          if(rejection.data && rejection.data.code === 403) {
            // error de autorización
            notify({
              message: rejection.data.error,
              classes: ['alert-danger'],
              position: 'right'
            });
            $location.path('/');
            return $q.reject(rejection);
          }

          if($location.path() === "/login") {
            return $q.reject(rejection);
          }


          var deferred = $q.defer();
          var AuthenticationService = $injector.get('AuthenticationService');
          var $http = $injector.get('$http');
          var auth = AuthenticationService.token($rootScope.AuthParams);

          auth.then(function(response) {
            $rootScope.AuthParams.accessToken = response.accessToken;
            localStorage.setItem('AUTH_PARAMS', JSON.stringify($rootScope.AuthParams));
            $http.defaults.headers.common.Authorization = 'Bearer ' + response.accessToken;
            AuthenticationService.postLogin($rootScope.AuthParams).$promise.then(function (data){
              $rootScope.AuthParams.accesoSistema = data;
              console.log("se ejecutó el response error");
              $http.defaults.headers.common['X-Access'] = $rootScope.AuthParams.accesoSistema.accesosSistema[0].locacion.id;
            });
          }).then(deferred.resolve, deferred.reject);

          return deferred.promise.then(function() {
              //$http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.AuthParams.accessToken;
              rejection.config.headers.Authorization = 'Bearer ' + $rootScope.AuthParams.accessToken;
              return $http(rejection.config);
          });
        }
        return $q.reject(rejection);
      }
    };
  });
}());