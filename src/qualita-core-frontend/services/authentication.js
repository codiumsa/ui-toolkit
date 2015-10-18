'use strict';

/**
 * @ngdoc service
 * @name qualita.Authentication
 * @description
 * # Authentication
 * Service in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .service('AuthenticationService', function ($resource, baseurl) {
    var Authentication = $resource(baseurl.getBaseUrl() + '/:action', {action: '@action'});

    return {
      login: function(username, password) {
        var auth = new Authentication({username: username, password: password});
        return auth.$save({action: 'login'});
      },

      postLogin: function(authParams) {
        return new Authentication.save({action: 'loginApp'}, {username: authParams.username});
      },

      token: function(authParams) {
        //$log.debug("en token");
        var auth = new Authentication({username: authParams.username,
                                       accessToken: authParams.accessToken,
                                       requestToken: authParams.requestToken});
        return auth.$save({action: 'token'});
      },

      logout: function(authParams) {
        var auth = new Authentication({accessToken: authParams.accessToken,
                                       requestToken: authParams.requestToken});
        return auth.$save({action: 'logout'});
      }
    };
  });
