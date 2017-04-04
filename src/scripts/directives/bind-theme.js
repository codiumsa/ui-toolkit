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
      link(scope, element, attrs) {
        element.attr('theme', attrs.bindTheme);
      }
    };
  }
}());