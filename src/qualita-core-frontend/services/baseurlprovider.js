'use strict';

/**
 * @ngdoc service
 * @name qualita.baseurl
 * @description
 * # baseurl
 * Provider in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .provider('baseurl', function () {
    this.config = {};

    this.setConfig = function(config) {
        this.config = config;
    };

    this.$get = function() {
      var Config = this.config;
      return {
        getBaseUrl: function () {
          var hostname = window.location.hostname;

          //si es el servidor de homologacion
          if (hostname === Config.serverIp) {
            return 'http://' + hostname + '/' + Config.serverName + '/' + Config.serverAPI;
          }
          //si es localhost es desarrollo local
          else {
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
            return 'http://' + hostname + ':' + Config.serverPort
                  + '/' + Config.serverName + '/public/';
        },

        getBareServerUrl: function() {
          var hostname = window.location.hostname;

          //si es el servidor de homologacion
          if (hostname === Config.serverIp)
            return 'ws://' + hostname + '/' + Config.serverWSName + '/';
          //si es localhost es desarrollo local
          else
            return 'ws://' + hostname + ':' + Config.serverPort + '/' + Config.serverName + '/';
        }
      }
    };
  });
