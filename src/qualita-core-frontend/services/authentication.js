'use strict';

/**
 * @ngdoc service
 * @name qualita.Authentication
 * @description
 * # Authentication
 * Service in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .service('AuthenticationService', function ($resource, $rootScope, $http, baseurl) {
    var Authentication = $resource(baseurl.getBaseUrl() + '/:action', {action: '@action'});

    return {
      /*login: function(username, password) {
        var auth = new Authentication({username: username, password: password});
        return auth.$save({action: 'login'});
      },*/

      postLogin: function(authParams) {
        return new Authentication.save({action: 'loginApp'}, {username: authParams.username});
      },

      /*token: function(authParams) {
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
      }*/

      login: function (username, password) {
        $rootScope.auxiliarUsername = username;
        var auth = new Authentication({username: username, password: password});
        return auth.$save({action: 'login'});
      },

      token: function (authParams) {
        //var auth = new Authentication({username: authParams.username,
        //accessToken: authParams.accessToken,
        //requestToken: authParams.requestToken});
        // TODO: eventualmente va a cambiar cuando se tengan las aplicaciones. Ya que las mismas
        // deberan mandar su requestToken
        var auth = new Authentication({
          username: authParams.username,
          accessToken: authParams.accessToken,
          requestToken: authParams.requestToken
        });
        return auth.$save({action: 'token'});
      },

      logout: function () {
        //var auth = new Authentication({accessToken: authParams.accessToken,
        //                               requestToken: authParams.requestToken});
        // TODO: eventualmente va a cambiar cuando se tengan las aplicaciones. Ya que las mismas
        // deberan mandar su requestToken
        var authParams = this.getCurrentUser();
        var auth = new Authentication({
          username: authParams.username,
          accessToken: authParams.accessToken
        });
        $rootScope.AuthParams = {};
        localStorage.removeItem('AUTH_PARAMS');

        return auth.$save({action: 'logout'});
      },

      getCurrentUser: function () {
        var user = $rootScope.AuthParams;

        if (!user || Object.keys(user).length === 0) {
          user = JSON.parse(localStorage.getItem('AUTH_PARAMS')) || undefined;

          if (user) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + user.accessToken;
          }
        }
        return user;
      }

    };
  });
