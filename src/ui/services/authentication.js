(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.Authentication
 * @description
 * # Authentication
 */
angular.module('ui')
  .service('AuthenticationService', function ($resource, $rootScope, $http, baseurl) {
    var Authentication = $resource(baseurl.getBaseUrl() + '/:action', {action: '@action'});

    return {

      login: function (username, password) {
        $rootScope.auxiliarUsername = username;
        var auth = new Authentication({username: username, password: password});
        return auth.$save({action: 'login'});
      },

      postLogin: function(authParams) {
        return new Authentication.save({action: 'loginApp'}, {username: authParams.username});
      },

      token: function (authParams) {
        var auth = new Authentication({
          username: authParams.username,
          accessToken: authParams.accessToken,
          requestToken: authParams.requestToken
        });
        return auth.$save({action: 'token'});
      },

      logout: function () {
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
}());
