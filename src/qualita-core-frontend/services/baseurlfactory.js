'use strict';

/**
 * @ngdoc service
 * @name qualita.baseurl
 * @description
 * # baseurl
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('baseurl', function (Config) {

    // Public API here
    return {
      getBaseUrl: function () {
        var hostname = window.location.hostname;

        //si es el servidor de homologacion
        if (hostname === Config.serverIp) {
          return 'http://' + hostname + '/' + Config.serverName + '/rest';
        }
        //si es localhost es desarrollo local
        else {
          return 'http://' + hostname + ':8088/' + Config.serverName + '/rest';
        }
          
      },
      getPublicBaseUrl: function () {
        var hostname = window.location.hostname;
        //si es el servidor de homologacion
        if (hostname === Config.serverIp)
          return 'http://' + hostname + '/public/';
        //si es localhost es desarrollo local
        else
          return 'http://' + hostname + ':8088/public/';
      }
    };
  });