(function() {
'use strict';

angular
  .module('ui')
  .directive('validatedTextInput', validatedTextInput);

function validatedTextInput() {
  var directive = {
    restrict: 'E',
    scope: {
      model: '=',
      form: '=',
      name: '@',
      label: '@',
      isRequired: '=',
      submittedFlag: '=',
      placeholder: '@',
      classes: '@',
      inputType: '@',
      onChange: '&',
      maxLength: '@',
      minLength: '@',
      focusElement: '@',
      isDisabled: '=',
      pattern: '@',
      min: '=',
      max: '='
    },
    controllerAs: 'vm',
    bindToController: true,
    templateUrl: 'views/validated-text-input.html',
    link: linkFunc,
    controller: ValidatedTextInputController,
  };

  function linkFunc(scope, elem, attr) {
  }

  return directive;
}

ValidatedTextInputController.$inject =  ['$scope', '$timeout'];
function ValidatedTextInputController($scope, $timeout) {
  var vm = this;

  activate();
  vm.updateListener = updateListener;

  function activate() {
  }

  function updateListener() {
    $timeout(vm.onChange, 0);
  }
};
}());
