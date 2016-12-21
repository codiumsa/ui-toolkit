(function() {
'use strict';

angular
  .module('ui')
  .directive('validatedTextareaInput', validatedTextareaInput);

function validatedTextareaInput() {
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
      inputType: '@',
      onChange: '&',
      maxLength: '@',
      minLength: '@',
      isDisabled: '='
    },
    controllerAs: 'vm',
    bindToController: true,
    templateUrl: 'views/validated-textarea-input.html',
    link: linkFunc,
    controller: ValidatedTextareaInputController,
  };

  function linkFunc(scope, elem, attr) {
  }

  return directive;
}

ValidatedTextareaInputController.$inject =  ['$scope', '$timeout'];
function ValidatedTextareaInputController($scope, $timeout) {
  var vm = this;

  activate();
  vm.updateListener = updateListener;

  function activate() {
    vm.campo = vm.form[vm.name];
  }

  function updateListener() {
    $timeout(vm.onChange, 0);
  }
}
}());
