/**
 * Define la funcion bootstrap que permite realizar inicializaciones basicas
 * de la aplicacion. Es obligatoria la utilizacion de esta funcion.
 *
 * @author Jorge Ramirez <jorge@codium.com.py>
 **/
(function() {
  'use strict';
  
  window.ui = window.ui || {}; 

  /**
   * Funcion que realiza inicializaciones basicas de la aplicacion.
   *
   * @param callback {Function}: Funcion a ejecutarse en caso de querer realizar inicializaciones
   *                             adicionales. La funcion recibe los parametros de configuracion.
   **/
  function bootstrap(callback) {
    $.getJSON('config.json', function (config) {
      angular.module('ui').config(['ConfigProvider', 'flowFactoryProvider', 'baseurlProvider',
                                          function (ConfigProvider, flowFactoryProvider, baseurlProvider) {
        flowFactoryProvider.defaults = {
          method: 'octet',
          target: config.serverURL + '/adjuntos'
        };
        ConfigProvider.config(config);
        baseurlProvider.setConfig(config);
      }]);
      
      angular.module('ui').constant('CONFIGURATION', {
        serverName: config.serverName,
        serverIp: config.serverIp,
        serverPort: config.serverPort,
        serverAPI: config.serverAPI
      });
      callback(config);
      angular.bootstrap('#' + config.appId, [config.appModule]);
    });
  }

  window.ui.bootstrap = bootstrap;
}());
