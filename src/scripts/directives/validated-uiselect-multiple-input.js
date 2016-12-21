(function() {
'use strict';

angular
  .module('ui')
  .directive('validatedUiselectMultipleInput', validatedUiselectMultipleInput);

function validatedUiselectMultipleInput() {
  var directive = {
    restrict: 'E',
    scope: {
      model: '=',
      form: '=',
      name: '@',
      label: '@',
      isRequired: '=',
      submittedFlag: '=',
      fieldToShow: '@',
      options: '=',
      classes: '@',
      onSelect: '&',
      isDisabled: '='
    },
    controllerAs: 'vm',
    bindToController: true,
    templateUrl: 'views/validated-uiselect-multiple-input.html',
    link: linkFunc,
    controller: ValidatedUiselectMultipleInputController,
  };

  function linkFunc(scope, elem, attr) {
  }

  return directive;
}

ValidatedUiselectMultipleInputController.$inject =  ['$scope', '$timeout'];
function ValidatedUiselectMultipleInputController($scope, $timeout) {
  var vm = this;

  vm.getChoice = getChoice;

  vm.selectListener = selectListener;

  vm.printTest = printTest;

  vm.getFilter = getFilter;

  activate();

  function activate() {
  }

  function getChoice(obj) {
    return _.get(obj, vm.fieldToShow);
  }

  function selectListener() {
    $timeout(vm.onSelect, 0);
  }

  function getFilter(param) {
    var obj = {};
    obj[vm.fieldToShow] = param;
      return obj;
  }

  function printTest() {
    console.log('este es un test');
  }
}
}());
