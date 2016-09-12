(function() {
'use strict';

/**
 * @ngdoc service
 * @name ui.baseurl
 * @description
 * # baseurl
 */
angular.module('ui')
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
          }else{
            //si es localhost es desarrollo local
            return 'http://' + hostname + ':' + Config.serverPort + 
                   '/' + Config.serverName + '/' + Config.serverAPI;
          }
        },

        getPublicBaseUrl: function () {
          var hostname = window.location.hostname;

          //si es el servidor de homologacion
          if (hostname === Config.serverIp){
            return 'http://' + hostname + '/public/';
          }else{
            //si es localhost es desarrollo local
            return 'http://' + hostname + ':' + Config.serverPort + '/public/';
          }
        },

        getBareServerUrl: function() {
          var hostname = window.location.hostname;
          //si es el servidor de homologacion
          if (hostname === Config.serverIp) {
            return 'ws://' + hostname + '/' + Config.serverWSName + '/';
          }else{
            //si es localhost es desarrollo local
            return 'ws://' + hostname + ':' + Config.serverPort + '/' + Config.serverName + '/';
          }
        }
      };
    };
  });
}());
