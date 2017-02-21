(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name ui.ConfirmationModal
   * @description
   * # ConfirmationModal
   */
  angular.module('ui')
    .factory('ConfirmationModal', ConfirmationModal);

  ConfirmationModal.$inject = ['$uibModal', '$rootScope']

  function ConfirmationModal($uibModal, $rootScope) {

    return {
      /**
       * Se encarga de mostrar un confirmation modal.
       * 
       * @param {Object} options - Las opciones de configuración del modal.
       * @param {string} options.title - titulo del modal.
       * @param {string} options.message - El mensaje de confirmación.
       * @param {Function} options.ok - Función a invocar cuando se hace click en Aceptar.
       * @param {Function} [options.cancel] - Función a invocar cuando se hace click en Cancelar.
       */
      open(options) {
        let scope = $rootScope.$new(true);
        Object.assign(scope, options);
        let modalInstance = $uibModal.open({
          template: `
              <div class="modal-header">
                <h3 class="modal-title">{{::title}}</h3>
              </div>
              <div class="modal-body">{{::message}}</div>
              <div class="modal-footer">
                <button class="btn btn-primary" ng-click="submit()">Aceptar</button>
                <button class="btn btn-warning" ng-click="doCancel()">Cancelar</button>
              </div>`,
          scope
        });

        scope.submit = function() {
          modalInstance.dismiss('cancel');
          scope.$destroy();

          if (angular.isFunction(options.ok)) {
            options.ok();
          }
        };
        scope.doCancel = (id) => {
          modalInstance.dismiss('cancel');
          scope.$destroy();
          if (angular.isFunction(options.cancel)) {
            options.cancel();
          }
        };
      }
    }
  }
}());