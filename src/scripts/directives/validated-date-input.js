(function() {
  'use strict';

  angular
    .module('ui')
    .directive('validatedDateInput', validatedDateInput);

  function validatedDateInput() {
    var directive = {
      restrict: 'E',
      scope: {
        model: '=',
        form: '=',
        name: '@',
        label: '@',
        isRequired: '=',
        submittedFlag: '=',
        classes: '@',
        onChange: '&',
        isDisabled: '=',
        dateOptions: '@',
        format: '@',
        opened: '@'
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-date-input.html',
      link: linkFunc,
      controller: ValidatedDateInputController,
    };

    function linkFunc(scope, elem, attr, controller, dateFilter) {
      if (controller.model) {
        controller.model = new Date(controller.model);
      }
    }
    return directive;
  }

  ValidatedDateInputController.$inject = ['$scope', '$timeout'];

  function ValidatedDateInputController($scope, $timeout) {
    var vm = this;

    if (!vm.format) {
      vm.format = 'dd/MM/yyyy';
    }
    vm.onChange = vm.onChange || angular.noop;
    vm.showWeeks = false;

    vm.open = function() {
      vm.opened = true;
    };

    vm.focus = false;
    vm.onFocus = function() {
      vm.opened = true;
      vm.focus = true;
    };

    vm.today = function() {
      vm.model = new Date();
    };

    vm.clear = function() {
      vm.model = null;
    };

    vm.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    activate();
    vm.updateListener = updateListener;

    function activate() {
      moment.locale('es');
    }

    function updateListener() {
      vm.focus = false;
      $timeout(vm.onChange, 0);
    }
  }
}());