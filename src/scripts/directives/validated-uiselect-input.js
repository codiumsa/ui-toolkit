(function() {
'use strict';

angular
  .module('ui')
  .directive('validatedUiselectInput', validatedUiselectInput);

function validatedUiselectInput() {
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
      focusElement: '@',
      isDisabled: '='
    },
    controllerAs: 'vm',
    bindToController: true,
    templateUrl: 'views/validated-uiselect-input.html',
    link: linkFunc,
    controller: ValidatedUiselectInputController,
    compile: compileFunc
  };

  function linkFunc(scope, elem, attr) {
  }

  function compileFunc(element, attrs) {
  }

  return directive;
}

ValidatedUiselectInputController.$inject =  ['$scope', '$timeout'];
function ValidatedUiselectInputController($scope, $timeout) {
  var vm = this;

  vm.getChoice = getChoice;

  vm.selectListener = selectListener;

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
}
}());
