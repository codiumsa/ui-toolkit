(function() {
'use strict';

/**
 * Provider que permite:
 *
 * 1) Que un controller/service pueda definir las claves de traduccion que necesita.
 * 2) Que un controller/service pueda recuperar las claves de traduccion registradas por un modulo.
 *
 * @author Jorge Ramirez <jorge@codium.com.py>
 **/
angular
  .module('ui')
  .provider('tkeys', Provider);

function Provider() {
  var keysMap = {};
  this.addKeys = addKeys;
  this.$get = [tkeysFactory];

  /**
   * Agrega la lista de claves de traduccion que el modulo va a necesitar
   *
   * @param module {String}: identificador del modulo.
   * @param keys {Array}
   **/
  function addKeys(module, keys) {
    keysMap[module] = keys;
  }
  
  /**
   * Esta funcion es la que retorna el prototipo del servicio tkeys.
   **/
  function tkeysFactory($log) {
    return keysMap;
  }
}
}());
