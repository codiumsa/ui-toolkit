(function() {
  'use strict';

  angular
    .module('uix')
    .factory('TokenService', TokenService);

  TokenService.$inject = [];

  function TokenService() {
    return {
      getToken() {
        return {};
      },

      getRefreshToken() {
        return {};
      },

      setToken(token) {
        console.log(token);
      }
    };
  }
}());