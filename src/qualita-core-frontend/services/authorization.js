'use strict';

/**
 * @ngdoc service
 * @name qualita.Authorization
 * @description
 * # Authorization
 * Service in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .service('AuthorizationService', function ($rootScope, $resource, $http, baseurl) {
    
    var Authorization = $resource(baseurl.getBaseUrl() + '/authorization/:action',
                                  {action: '@action'});

    return {
      /**
       * Retorna true si el usuario actual de la aplicación posee el permiso dado como
       * parámetro.
       **/
      hasPermission: function(permission) {
        var permissions = $rootScope.AuthParams.permissions || [];
        return permissions.indexOf(permission) >= 0;
      },

      principal: function() {
        return Authorization.get({action: 'principal'}).$promise;
      },

      setupCredentials: function(username, requestToken, accessToken) {
        
        var AuthParams = {
          username: username,
          requestToken: requestToken,
          accessToken: accessToken
        };

        $rootScope.AuthParams = AuthParams;
        localStorage.setItem('AUTH_PARAMS', JSON.stringify(AuthParams));
        $http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;
        // cargamos los permisos del usuario
        this.principal().then(function(response) {
          AuthParams.permissions = response.permisos;
          AuthParams.stamp = response.stamp;
          localStorage.setItem('AUTH_PARAMS', JSON.stringify(AuthParams));
        });
      },

      cleanupCredentials: function() {        
        localStorage.removeItem('AUTH_PARAMS');
      }
    };
  });
