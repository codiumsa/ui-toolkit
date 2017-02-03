(function() {
  'use strict';

  /**
   * Wrapper simple para bootstrap-toggle. El wrapper acepta las configuraciones
   * de bootstrap-toggle.
   * 
   * @ngdoc directive
   * @name ui.directive:uiCheckbox
   * @description
   * # uiCheckbox
   */
  angular
    .module('ui')
    .directive('uiCheckbox', uiCheckbox);

  uiCheckbox.$inject = ['$compile', '$timeout'];

  function uiCheckbox($compile, $timeout) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        if ($(element).attr('type') !== 'checkbox') {
          console.warn('ui-checkbox solamente se usa en inputs de tipo checkbox');
          return;
        }
        $(element).removeAttr('ui-checkbox');
        let newElement = $compile(element)(scope)[0];
        $(element).replaceWith(newElement);
        $timeout(() => $(newElement).bootstrapToggle());
      }
    };
  }
}());