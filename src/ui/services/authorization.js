(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.Authorization
 * @description
 * # Authorization
 */
angular.module('ui')
  .service('AuthorizationService', function ($rootScope, $resource, $http, baseurl, AuthenticationService) {
    
    var Authorization = $resource(baseurl.getBaseUrl() + '/authorization/:action',
                                  {action: '@action'});

    return {
      /**
       * Retorna true si el usuario actual de la aplicación posee el permiso dado como
       * parámetro.
       **/
      hasPermission: function(permission, userToCheck) {
        var user = userToCheck || AuthenticationService.getCurrentUser();
        var permissions = [];

        if (user) {
          permissions = user.permissions || [];
        }
        return permissions.indexOf(permission) >= 0;
      },

      principal: function() {
        return Authorization.get({action: 'principal'}).$promise;
      },

      setupCredentials: function(username, requestToken, accessToken, callback) {
        
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
          callback(AuthParams);
        });
      },

      cleanupCredentials: function() {        
        localStorage.removeItem('AUTH_PARAMS');
      },

      authorize: function (loginRequired, requiredPermissions) {
          var user = AuthenticationService.getCurrentUser();

          if (loginRequired === true && user === undefined) {
            return this.enums.LOGIN_REQUIRED;
          } else if ((loginRequired && user !== undefined) &&
            (requiredPermissions === undefined || requiredPermissions.length === 0)) {
            return this.enums.AUTHORIZED;
          } else if (requiredPermissions) {
            var isAuthorized = true;

            for (var i = 0; i < requiredPermissions.length; i++) {
              isAuthorized = this.hasPermission(requiredPermissions[i], user);

              if (isAuthorized === false) {
                break;
              }
            }
            return isAuthorized ? this.enums.AUTHORIZED : this.enums.NOT_AUTHORIZED;
          }
        },

        enums: {
          LOGIN_REQUIRED: 'loginRequired',
          NOT_AUTHORIZED: 'notAuthorized',
          AUTHORIZED: 'authorized'
        }
    };
  });
}());
