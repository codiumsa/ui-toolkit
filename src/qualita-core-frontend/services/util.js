/**
 * Created by codiumsa on 4/4/16.
 */
angular.module('qualitaCoreFrontend')
  .factory('Util', Util);


function Util() {
  var service = {
    toUnidadMedidaBase: toUnidadMedidaBase,
    fromUnidadMedidaBase: fromUnidadMedidaBase
  };

  return service;

  function toUnidadMedidaBase(cantidad, unidadMedida) {
      var multiplicador=1;
      var unidadActual = unidadMedida;
      while(!unidadActual.esBase){
        multiplicador=multiplicador*unidadActual.cantidad;
        unidadActual=unidadActual.unidadContenida;
      }
      return cantidad * multiplicador;
  }

  function fromUnidadMedidaBase(cantidad, unidadObjetivo) {
    var multiplicador = 1;
    var unidadActual = unidadObjetivo;
    while (!unidadActual.esBase) {
      multiplicador = multiplicador * unidadActual.cantidad;
      unidadActual = unidadActual.unidadContenida;
    }
    return cantidad / multiplicador;
  }
}
