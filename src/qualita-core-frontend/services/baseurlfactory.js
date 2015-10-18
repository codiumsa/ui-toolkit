'use strict';

/**
 * @ngdoc service
 * @name qualita.baseurl
 * @description
 * # baseurl
 * Factory in the qualita.
 */
angular.module('qualitaCoreFrontend')
  .factory('baseurl', function () {

    // Public API here
    return {
      getBaseUrl: function () {
        var hostname = window.location.hostname;
        //si es 159.203.94.34 es el servidor de homologacion
        if (hostname === '159.203.94.34')
          return 'http://' + hostname + '/qualita-client/rest';
        //si es localhost quiere es desarrollo local
        else
          return 'http://' + hostname + ':8088/qualita-client/rest';
      },
      getPublicBaseUrl: function () {
        var hostname = window.location.hostname;
        //si es 159.203.94.34 es el servidor de homologacion
        if (hostname === '159.203.94.34')
          return 'http://' + hostname + '/public/';
        //si es localhost quiere es desarrollo local
        else
          return 'http://' + hostname + ':8088/public/';
      }
    };
  });