(function() {
'use strict';

angular
  .module('ui')
  .directive('wizardPane', wizardPane);

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
      parentState: '@' //Por un bug, parentState debe ser necesariamente el nombre completo
    },
    templateUrl: 'views/wizardpane.html',
    controller: controllerFunc,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;
}

controllerFunc.$inject =['$state'];

function controllerFunc($state) {
  var vm = this;
  vm.isActive = isActive;

  function isActive(estado) {
    return $state.includes(estado);
  }
}
}());
