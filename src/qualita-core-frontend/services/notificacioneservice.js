/**
 * Created by codiumsa on 19/10/15.
 */
angular.module('qualitaCoreFrontend')
  .factory('NotificacionesWSFactory', NotificacionesWSFactory);
NotificacionesWSFactory.$inject = ['$resource', 'baseurl', '$log', '$websocket', '$timeout'];

function NotificacionesWSFactory($resource, baseurl, $log, $websocket, $timeout) {
  var service = {
    all: all,
    close: close,
    create: create,
    get: get,
    getLatest: getLatest,
    init: init,
    remove: remove,
    save: save,
    sendAction: sendAction,
    registerMessageObserver: registerMessageObserver
  };

  var notificaciones = $resource( baseurl.getBaseUrl() + "/notificaciones/:id", {id: '@id'}, {
    update: {
      method: 'PUT'
    }
  });

  var closedByUser = false;

  var retries = 0;

  var websocket = undefined;

  return service;

  function all(params) {
    return notificaciones.query(params);
  }

  function close(forceClose) {
    closedByUser = true;
    var forzar = false;
    if(forceClose) {
      forzar = forceClose;
    }

    websocket.close(forzar);
  }

  function create(attrs) {
    return new notificaciones(attrs);
  }

  function get(id) {
    return notificaciones.get({id: id});
  }

  function getLatest(offset, limit) {
    var obj = {
      action: "get",
      offset: offset,
      limit: limit
    };
    websocket.send(JSON.stringify(obj));
  }

  function init(username) {
    websocket = $websocket(baseurl.getBareServerUrl() + "wsnotificaciones");
    var obj = {
      action: "init",
      username: username
    };
    websocket.onOpen(function() {
      console.log("Socket abierto");
      retries = 0;
    });

    websocket.onClose(function() {
      console.log("Socket cerrado");
      if(!closedByUser) {
        if(retries < 4) {
          retries = retries + 1;
          $timeout(function() { init(username) }, (1000 * retries));
        } else {
          console.error("Tras 4 intentos no se pudo reestablecer conexion con websocket de notificaciones.");
        }
      } else {
        closedByUser = false;
      }
    });
    console.log(websocket);
    websocket.send(JSON.stringify(obj));
  }

  function sendAction(accion, notificacion) {
    var obj = {
      action: accion,
      notificacion: notificacion.id
    };
    $log.info("mensaje a mandar: ");
    $log.info(obj);
    websocket.send(JSON.stringify(obj));
  }

  function registerMessageObserver(functionHandler) {
    if(!websocket) {
      websocket = $websocket(baseurl.getBareServerUrl() + "wsnotificaciones");
    }
    websocket.onMessage(functionHandler);
  }

  function remove(notificacion) {
    return notificacion.$remove();
  }

  function save(notificacion) {
    return (notificacion.id) ? notificacion.$update() : notificacion.$save();
  }


}
