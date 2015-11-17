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
          return 'http://' + hostname + '/' + Config.serverName + '/' + Config.serverAPI;
        }
        //si es localhost es desarrollo local
        else {
          console.log("hola");
          return 'http://' + hostname + ':' + Config.serverPort 
                + '/' + Config.serverName + '/' + Config.serverAPI;
        }
          
      },
      getPublicBaseUrl: function () {
        var hostname = window.location.hostname;
        //si es el servidor de homologacion
        if (hostname === Config.serverIp)
          return 'http://' + hostname + '/public/';
        //si es localhost es desarrollo local
        else
          return 'http://' + hostname + ':' + Config.serverPort  + '/public/';
      }
    };
  });