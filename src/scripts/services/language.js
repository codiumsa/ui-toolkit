(function() {
'use strict';

angular
  .module('ui')
  .factory('LangService', Service);

Service.$inject = ['$translate', '$translatePartialLoader'];

function Service($translate, $translatePartialLoader) {

  var service = {
    getTranslations: getTranslations
  };
  
  return service;

  /**
   * Metodo que retorna un objeto con las traducciones para
   * los keys dados como parametro.
   *
   * @param translationKeys {Array} claves para la traduccion.
   * @param module {String} (opcional) nombre del modulo que contiene las traducciones.
   **/
  function getTranslations(translationKeys, module) {

    if(module){
      $translatePartialLoader.addPart(module);
    }
    return $translate.refresh().then(function () {
      return $translate(translationKeys);
    });
  }
}
}());
