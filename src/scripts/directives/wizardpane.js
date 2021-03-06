(function() {
  'use strict';

  angular
    .module('ui')
    .directive('wizardPane', wizardPane);

  wizardPane.$inject = ['$state'];

  function wizardPane($state) {
    var directive = {
      required: '^^wizard',
      restrict: 'E',
      scope: {
        title: '@',
        number: '@',
        activeIf: '@',
        disabledIf: '=',
        state: '@',
      },
      templateUrl: 'views/wizardpane.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controllerFunc.$inject = ['$state'];

  function controllerFunc($state) {
    var vm = this;

    /**
     * Verifica si el estado dado como parametro es el estado actual
     * 
     * @param {string} state - nombre relativo o completo
     */
    vm.isActive = function(state) {
      var params = state.indexOf("(");
      params = params !== -1 ? params : state.length;
      var rawState = state.substr(0, params);
      return state.startsWith('.') ? $state.is($state.get('^').name + state) : $state.is(rawState);
    };

    vm.go = function(dest) {
      if (vm.disabledIf) {
        return;
      }
      $state.go(dest);
    };
  }
}());