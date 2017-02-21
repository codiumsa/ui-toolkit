(function() {
  'use strict';

  angular
    .module('ui')
    .directive('validatedDateInput', validatedDateInput);

  function validatedDateInput() {
    var directive = {
      restrict: 'E',
      scope: {
        // el valor que almacena la fecha asociada al input. Para precargar el input se puede
        // especificar un date, string o un unix timestamp.
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
        // formato esperado para la fecha dada como parámetro.
        // Posibles formatos: http://angular-ui.github.io/bootstrap/#!#dateparser
        format: '@',
        opened: '@'
      },
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'views/validated-date-input.html',
      controller: ValidatedDateInputController,
    };
    return directive;
  }

  ValidatedDateInputController.$inject = ['$scope', '$timeout', 'uibDateParser'];

  function ValidatedDateInputController($scope, $timeout, uibDateParser) {
    let vm = this;
    let init = false;

    $scope.$watch('vm.model', (model) => {
      if (model && !init) {

        if (angular.isString(model)) {
          $scope.vm.model = uibDateParser.parse(model, $scope.vm.format);
        } else if (angular.isDate(model)) {
          $scope.vm.model = model;
        } else {
          $scope.vm.model = new Date(model);
        }
        init = true;
      }
    });

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