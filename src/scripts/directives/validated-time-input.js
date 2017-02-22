(function() {
  'use strict';

  angular
    .module('ui')
    .directive('validatedTimeInput', validatedTimeInput);

  function validatedTimeInput() {
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
      templateUrl: 'views/validated-time-input.html',
      link: linkFunc,
      controller: validatedTimeInputController,
    };

    function linkFunc(scope, elem, attr, controller, dateFilter) {
      if (controller.model) {
        controller.model = new Date(controller.model);
      }
    }
    return directive;
  }
  validatedTimeInputController.$inject = ['$scope', '$timeout', '$element', '$document'];

  function validatedTimeInputController($scope, $timeout, element, $document) {
    var vm = this;
    vm.isValid = true;
    if (!vm.format)
      vm.format = "HH:mm";
    vm.date = new Date();
    vm.showWeeks = false;

    vm.open = function() {
      vm.opened = !vm.opened;
    };

    vm.focus = false;
    vm.onFocus = function() {
      vm.opened = true;
      vm.focus = true;
    };

    vm.blur = function() {
      vm.opened = false;
      vm.focus = false;
    };

    vm.today = function() {
      vm.date = new Date();
      vm.model = moment(vm.date).format(vm.format);
    };

    vm.clear = function() {
      vm.date = null;
      vm.model = null;
    };

    vm.close = function() {
      vm.opened = false;
      vm.focus = false;
    };
    activate();
    vm.updateListener = updateListener;
    vm.updateInputListener = updateInputListener;

    function activate() {
      moment.locale('es');
      vm.opened = false;
    }

    function updateListener() {
      vm.model = moment(vm.date).format(vm.format);
      var pattern = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
      vm.isValid = pattern.test(vm.model);

      if (!vm.isValid) {
        vm.form[vm.name].$setValidity('invalido', !vm.isValid);
      } else {
        $timeout(vm.onChange, 0);
      }
    }

    function updateInputListener() {
      var pattern = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
      vm.isValid = pattern.test(vm.model);

      if (!vm.isValid) {
        vm.form[vm.name].$setValidity('invalido', !vm.isValid);
      } else {
        $timeout(vm.onChange, 0);
      }
    }

    vm.keydown = function(evt) {
      if (evt.which === 27 || evt.which === 9 || evt.which === 13) {
        vm.close();
      }
    };

    element.bind('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
    });

    $document.bind('click', function(event) {
      $scope.$apply(() => vm.opened = false);
    });
  };
}());