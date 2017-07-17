(function() {
  'use strict';
  // helper para poder definir theme de forma dinámica para ui-select.
  angular
    .module('ui')
    .directive('bindTheme', bindTheme);

  function bindTheme() {
    return {
      restrict: 'A',
      scope: false,
      require: 'ngModel',
      link(scope, element, attrs, ngModelCtrl) {
        element.attr('theme', attrs.bindTheme);
        scope.$parent.vm.form = ngModelCtrl.$$parentForm;
        if (_isMultiSelect()) scope.$watchCollection(attrs.ngModel, _setTouched)
        else scope.$watch(attrs.ngModel, _setTouched);

        function _setTouched(newValue, oldValue) {
          if (!ngModelCtrl.$touched && _isNotInitialLoad()) ngModelCtrl.$setTouched();

          function _isNotInitialLoad() {
            return newValue !== oldValue;
          }
        };

        function _isMultiSelect() {
          return angular.isDefined(attrs.multiple);
        }
      }
    };
  }
}());