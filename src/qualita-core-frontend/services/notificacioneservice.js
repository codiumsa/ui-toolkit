/**
 * Created by codiumsa on 19/10/15.
 */
angular.module('qualitaCoreFrontend')
  .factory('NotificacionesWSFactory', NotificacionesWSFactory);
NotificacionesWSFactory.$inject = ['$resource', 'baseurl', '$websocket'];

function NotificacionesWSFactory($resource, baseurl, $websocket) {
  var service = {
    all: all,
    create: create,
    get: get,
    init: init,
    remove: remove,
    save: save,
    registerMessageObserver: registerMessageObserver
  };

  var notificaciones = $resource( baseurl.getBaseUrl() + "/notificaciones/:id", {id: '@id'}, {
    update: {
      method: 'PUT'
    }
  });

  var websocket = $websocket(baseurl.getBareServerUrl() + "wsnotificaciones");


  websocket.onOpen(function() {
    console.log("Socket abierto");
  });

  websocket.onClose(function() {
    console.log("Socket cerrado");
  });

  return service;

  function all(params) {
    return notificaciones.query(params);
  }

  function create(attrs) {
    return new notificaciones(attrs);
  }

  function get(id) {
    return notificaciones.get({id: id});
  }

  function init(username) {
    var obj = {
      action: "init",
      username: username
    };
    websocket.send(JSON.stringify(obj));
  }

  function registerMessageObserver(functionHandler) {
    websocket.onMessage(functionHandler);
  }

  function remove(notificacion) {
    return notificacion.$remove();
  }

  function save(notificacion) {
    return (notificacion.id) ? notificacion.$update() : notificacion.$save();
  }


}
